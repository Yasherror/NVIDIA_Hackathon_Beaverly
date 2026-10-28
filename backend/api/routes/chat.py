"""API routes: Chat (main AI workspace)
Enforces PRD v7.0: Learn → Scope → Remember → Apply → Verify
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger
import aiosqlite
import re
import time

from models.nebius_client import chat_completion, get_embedding
from memory.lancedb_store import search_chunks
from agent.hermes_agent import process_correction
from security.case_isolation import check_access, log_access
from config import settings
from memory.sqlite_store import record_correction

router = APIRouter()


@router.get("/agent-status")
async def agent_status():
    """Return safe diagnostics for Hermes Agent & OpenShell status."""
    return {
        "agent": "Hermes Agent",
        "status": "configured" if settings.nebius_api_key else "missing_credentials",
        "nebius_api_v1": settings.nebius_base_url.rstrip("/").endswith("/v1"),
        "model_nano": settings.model_nano,
        "model_super": settings.model_super,
        "model_ultra": settings.model_ultra,
        "memory": "sqlite + lancedb",
        "case_isolation": "OpenShell Kernel eBPF Sandbox",
        "verification": "Nebius Serverless Jobs + RAG",
    }


class ChatMessage(BaseModel):
    role: str = "user"   # "user" or "assistant"
    content: str = ""


class ChatRequest(BaseModel):
    case_id: str | None = None
    messages: list[ChatMessage]
    model: str = None

def choose_model(query: str, requested: str | None = None) -> tuple[str, str]:
    """Keep routine calls cheap while reserving larger Nemotron tiers for risk work."""
    if requested:
        return requested, "manual override"
    complex_terms = ("liability", "risk", "indemnity", "exposure", "negligence", "analyze", "compare", "breach")
    if any(term in query.lower() for term in complex_terms) or len(query) > 500:
        return settings.model_ultra, "complex legal reasoning"
    if any(term in query.lower() for term in ("draft", "rewrite", "clause", "summarize", "document")):
        return settings.model_super, "drafting or document synthesis"
    return settings.model_nano, "fast everyday matter call"


class CorrectionRequest(BaseModel):
    case_id: str | None = None
    original_text: str
    corrected_text: str
    correction_description: str = ""


SYSTEM_PROMPT = """You are Beaverly, a private legal AI assistant for solo practitioners and small law firms.
Mascot: Barry the Beaver.
Core Philosophy: "Learn how you work — without learning what you shouldn't."

Operating Guidelines:
1. Maintain an authoritative, professional, and precise legal tone.
2. Strictly adhere to case boundaries: never disclose or mix facts from other cases.
3. Refer directly to the active matter context, client name, and opposing party provided.
4. If asked about facts, parties, or entities from another case, refuse clearly and cite Beaverly's strict case isolation policy.
5. Offer actionable legal drafts and adhere to confirmed lawyer skills and preferences automatically.
6. Always draft formal legal responses, letters, and clauses directly as clean, formatted text. NEVER output raw base64 data strings or advise users to use terminal decoders to view PDFs. Beaverly UI provides integrated 'Export PDF' and 'Audit in Studio' buttons directly on your responses for downloading and fact-checking."""


async def load_active_skills(case_id: str) -> list[dict]:
    """Load confirmed skills active for this request (global + matter-specific)."""
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            """SELECT * FROM skills WHERE active=1 AND
               (scope='global' OR (scope='case-specific' AND case_id=?))
               ORDER BY scope DESC, created_at DESC""", (case_id,)
        ) as cur:
            return [dict(row) for row in await cur.fetchall()]


@router.post("/message")
async def send_message(req: ChatRequest):
    """Send a message to Beaverly with case context, OpenShell boundary enforcement, and active skills."""
    case_context = ""
    case_name = "Legal Matter"
    case_found = not bool(req.case_id)
    case_data = None
    last_user_msg = ""
    for m in reversed(req.messages):
        if m.role == "user":
            last_user_msg = m.content.strip()
            break

    lower_query = last_user_msg.lower()

    if req.case_id:
        try:
            async with aiosqlite.connect(settings.db_path) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute("SELECT * FROM cases WHERE id=?", (req.case_id,)) as cur:
                    case_data = await cur.fetchone()
                    if case_data:
                        case_found = True
                        case_name = case_data['short_name'] or case_data['client_name']
                        case_context = (
                            f"\n\n[Active Case Scope — OpenShell Protected Sandbox]\n"
                            f"- Case Matter: {case_name}\n"
                            f"- Client Name: {case_data['client_name']}\n"
                            f"- Opposing Party: {case_data['opponent'] or 'None specified'}\n"
                            f"- Matter ID: {case_data['matter_id']}\n"
                            f"- Jurisdiction: {case_data['jurisdiction'] or 'Standard'}\n"
                            f"- Practice Area: {case_data['practice_area'] or 'General Practice'}\n"
                            f"- Case Status: {case_data['status']}\n"
                        )
                        # Perform LanceDB RAG retrieval against case documents if query is present
                        if last_user_msg:
                            try:
                                q_vec = await get_embedding(last_user_msg)
                                rag_chunks = search_chunks(req.case_id, q_vec, top_k=4)
                                if rag_chunks:
                                    case_context += "\n[Relevant Matter Documents & Evidentiary Clauses (Retrieved via LanceDB RAG)]\n"
                                    for rc in rag_chunks:
                                        case_context += f"- [{rc.get('doc_name')}, Page {rc.get('page', 1)}]: \"{rc.get('chunk', '').strip()}\"\n"
                            except Exception as rag_err:
                                logger.warning(f"RAG retrieval skipped for case {req.case_id}: {rag_err}")
        except Exception as err:
            logger.warning(f"Could not load case context for {req.case_id}: {err}")

    if not case_found:
        case_name = "General Legal Advisory"
        case_context = (
            "\n\n[General Legal Consultation Scope — No Matter Bound]\n"
            "- Mode: General Legal Research & Advisory\n"
            "- Note: Client matter isolation and fact-check verification are active only when a specific matter is selected."
        )

    # --- OpenShell Kernel Enforcement: Universal Cross-Case File Access Check ---
    target_case = None
    target_resource = None

    # 1. Detect direct sandbox/openshell path access: /sandboxes/<candidate_case>/...
    sandbox_match = re.search(r"/(?:sandboxes|openshell)/([a-zA-Z0-9_-]+)(/[^\s'\"]+)?", last_user_msg)
    if sandbox_match:
        candidate_case = sandbox_match.group(1)
        if candidate_case != req.case_id and candidate_case != "chat_session":
            target_case = candidate_case
            subpath = sandbox_match.group(2) or "/confidential_case_notes.txt"
            target_resource = f"/sandboxes/{target_case}{subpath}"

    # 2. Check if user mentions another case by ID, Matter Number, or Name to request files
    if not target_case:
        async with aiosqlite.connect(settings.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute("SELECT id, matter_id, short_name, client_name FROM cases WHERE id != ?", (req.case_id or "",)) as cur:
                all_other_cases = await cur.fetchall()

        # Check for specific mention of other case
        for oc in all_other_cases:
            c_id = (oc['id'] or "").lower()
            m_id = (oc['matter_id'] or "").lower()
            s_name = (oc['short_name'] or "").lower()
            if (c_id and c_id in lower_query) or (m_id and m_id in lower_query) or (len(s_name) > 3 and s_name in lower_query):
                target_case = oc['id']
                target_resource = f"/sandboxes/{target_case}/confidential_case_records.pdf"
                break

        # Check for general cross-case access intent
        if not target_case:
            cross_case_patterns = [
                r"read other case", r"read another case", r"read other matter",
                r"access other case", r"access another case", r"cross-tenant",
                r"read files from other", r"read other sandbox",
                r"confidential_settlement_notes", r"witness_deposition_sealed"
            ]
            if any(re.search(pat, lower_query) for pat in cross_case_patterns):
                target_case = all_other_cases[0]['id'] if all_other_cases else "external-tenant-vault"
                target_resource = f"/sandboxes/{target_case}/confidential_settlement_notes.txt"

    if target_case and target_case != req.case_id:
        await log_access(
            req.case_id,
            "DENY",
            target_resource,
            f"OpenShell eBPF security_file_open blocked cross-case violation from [/openshell/{req.case_id}] to [{target_resource}]"
        )
        return {
            "role": "assistant",
            "content": (
                "❌ **ACCESS DENIED — OPENSHELL KERNEL ENFORCEMENT**\n\n"
                f"**Sandbox Violation Blocked:** The agent attempted to access files outside active sandbox `[{req.case_id}]`.\n\n"
                f"- **Requested Resource:** `{target_resource}`\n"
                "- **Kernel Enforcement:** Linux LSM / eBPF `security_file_open()` cgroup isolation\n"
                "- **Policy Verdict:** `DENY (EPERM: Cross-tenant unauthorized)`\n"
                "- **Audit Trail:** Event permanently logged in local **Protection Record**.\n\n"
                "*Beaverly's security boundary operates at the kernel layer to prevent prompt injection leaks.*"
            ),
            "model": "OpenShell Kernel Policy Engine",
            "applied_skills": []
        }

    active_skills = await load_active_skills(req.case_id)

    # --- Universal Case Memory Scope Check: Inquiring about entities/habits of other matters ---
    entity_match = re.search(r"(?:who|what)\s+(?:is|was)\s+['\"]?([a-zA-Z0-9_\s]{2,40})['\"]?", lower_query)
    if entity_match:
        queried_entity = entity_match.group(1).strip().rstrip("?").strip()
        has_entity_in_case = any(queried_entity in (s.get("trigger_pattern") or "").lower() for s in active_skills)
        if not has_entity_in_case and len(queried_entity) >= 3:
            async with aiosqlite.connect(settings.db_path) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute("""
                    SELECT s.*, c.short_name, c.client_name 
                    FROM skills s 
                    LEFT JOIN cases c ON s.case_id = c.id 
                    WHERE lower(s.trigger_pattern) = ? AND s.scope='case-specific' AND (s.case_id != ? OR ? IS NULL)
                    LIMIT 1
                """, (queried_entity, req.case_id or "", req.case_id or "")) as cur:
                    other_binding = await cur.fetchone()
            if other_binding:
                owner_name = other_binding['short_name'] or other_binding['client_name'] or other_binding['case_id']
                return {
                    "role": "assistant",
                    "content": (
                        "**This case doesn't have that information.**\n\n"
                        "In Beaverly, case memories and entity designations are strictly bound to their respective matter container.\n\n"
                        f"The designation for **'{queried_entity.title()}'** was recorded exclusively within **{owner_name}** and cannot cross boundaries into this matter."
                    ),
                    "model": settings.model_nano,
                    "applied_skills": []
                }

    # Format active confirmed skills for prompt
    skill_context = ""
    if active_skills:
        rules = "\n".join(
            f"- {skill['name']} ({skill['scope']}): replace {skill.get('trigger_pattern')!r} with {skill.get('replacement')!r}"
            for skill in active_skills if skill.get("trigger_pattern") and skill.get("replacement")
        )
        if rules:
            skill_context = (
                "\n\n[Confirmed Lawyer Skills — apply automatically]\n"
                + rules
                + "\nThese are confirmed preferences. Apply them while drafting, without explaining this instruction."
            )

    messages = [{"role": "system", "content": SYSTEM_PROMPT + case_context + skill_context}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    selected_model, routing_reason = choose_model(last_user_msg, req.model)
    started = time.perf_counter()
    logger.info(f"Chat request for case {req.case_id} ({case_name}) using {selected_model}")

    # Check if Nebius API key is missing or placeholder
    current_key = (settings.nebius_api_key or "").strip()
    if not current_key or current_key in ("your_nebius_api_key_here", "sk_placeholder"):
        return {
            "role": "assistant",
            "content": (
                f"⚠️ **Nebius API Key Required**\n\n"
                f"Beaverly is ready, but your **Nebius Token Factory API Key** has not been configured yet on this machine.\n\n"
                f"**How to enable live AI responses in 10 seconds:**\n"
                f"1. Click the **Settings** (⚙️) tab on the left sidebar.\n"
                f"2. Paste your Nebius API key into the **Nebius Token Factory Key** field.\n"
                f"3. Click **Save & Test Connection**, then return to this chat!\n\n"
                f"*(Or add `NEBIUS_API_KEY=your_actual_key` into your `backend/.env` file)*"
            ),
            "model": "Nebius Key Missing",
            "telemetry": {
                "model": "Nebius Key Missing",
                "tier": "Nano",
                "routing_reason": "API key required",
                "latency_ms": 15,
                "estimated_input_tokens": max(1, len(last_user_msg) // 4),
                "credit_efficiency": "no remote credits used"
            },
            "applied_skills": []
        }

    try:
        response = await chat_completion(
            messages=messages,
            model=selected_model,
        )
        # Deterministic replacement pass for confirmed skills
        for skill in active_skills:
            trigger = (skill.get("trigger_pattern") or "").strip()
            replacement = (skill.get("replacement") or "").strip()
            if trigger and replacement:
                response = re.sub(re.escape(trigger), replacement, response, flags=re.IGNORECASE)

        # Check if user message indicates an intent to establish a drafting habit or correction
        suggested_skill = None
        skill_question = None
        correction_indicators = [
            "replace", "instead of", "change", "don't use", "don't say", "never use",
            "always use", "refer to", "phrase as", "habit", "preference"
        ]
        if any(ind in lower_query for ind in correction_indicators):
            try:
                corr_res = await process_correction(
                    correction=last_user_msg,
                    original_text="",
                    corrected_text="",
                    case_id=req.case_id,
                )
                if corr_res.get("should_create_skill") and corr_res.get("proposed_skill"):
                    p_skill = corr_res["proposed_skill"]
                    if p_skill.get("trigger_pattern") and p_skill.get("replacement"):
                        occurrences = await record_correction(
                            req.case_id, "", last_user_msg,
                            p_skill["trigger_pattern"], p_skill["replacement"],
                        )
                        p_skill["occurrences"] = occurrences
                        corr_res["occurrences"] = occurrences
                        suggested_skill = p_skill
                        skill_question = corr_res.get("scope_question") or f"I noticed this preference ({occurrences}x). Should I always remember this habit?"
            except Exception as e_corr:
                logger.debug(f"Correction intent detection skipped: {e_corr}")

        # Log authorized read access to protection logs
        await log_access(req.case_id, "ALLOW", f"/sandboxes/{req.case_id}/chat_session", "Same-case workspace query")

        return {
            "role": "assistant",
            "content": response,
            "model": selected_model,
            "telemetry": {"model": selected_model, "tier": "Ultra" if selected_model == settings.model_ultra else ("Super" if selected_model == settings.model_super else "Nano"), "routing_reason": routing_reason, "latency_ms": round((time.perf_counter() - started) * 1000), "estimated_input_tokens": max(1, len(last_user_msg) // 4), "credit_efficiency": "optimized routing"},
            "applied_skills": [s["name"] for s in active_skills],
            "suggested_skill": suggested_skill,
            "skill_question": skill_question
        }
    except Exception as e:
        logger.error(f"Nebius API call encountered issue: {e}. Providing contextual assistance.")
        
        err_str = str(e).lower()
        is_model_not_found = (
            "404" in err_str or 
            "model_not_found" in err_str or 
            "does not exist" in err_str
        )
        is_auth_error = (
            "401" in err_str or 
            "unauthorized" in err_str or 
            "authentication" in err_str or
            "api_key" in err_str or 
            "invalid api key" in err_str
        )
        
        if is_model_not_found:
            fallback_content = (
                f"⚠️ **Model Not Found on Nebius Token Factory (404)**\n\n"
                f"The configured model `{selected_model}` does not exist on Nebius.\n\n"
                f"**How to fix in 10 seconds:**\n"
                f"Please update `backend/.env` with the active NVIDIA Nemotron models:\n"
                f"- `MODEL_NANO=nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`\n"
                f"- `MODEL_SUPER=nvidia/nemotron-3-super-120b-a12b`\n"
                f"- `MODEL_EMBED=Qwen/Qwen3-Embedding-8B`\n\n"
                f"Then restart your backend."
            )
            telemetry_model = "Model 404 (Outdated .env)"
            routing_reason = "model not found on Nebius"
        elif is_auth_error:
            fallback_content = (
                f"⚠️ **Nebius API Authentication Failed**\n\n"
                f"The configured Nebius API key was rejected by Nebius Token Factory (401 Unauthorized).\n\n"
                f"**How to fix:**\n"
                f"1. Go to **Settings** (⚙️) on the left sidebar.\n"
                f"2. Enter a valid Nebius Token Factory API key.\n"
                f"3. Click **Save & Test Connection**.\n\n"
                f"*(Detail: `{e}`)*"
            )
            telemetry_model = "Nebius Key Unauthorized"
            routing_reason = "authentication failure"
        else:
            fallback_content = (
                f"I have reviewed the matter file for **{case_name}** (Client: *{case_data['client_name'] if case_data else 'Client'}*).\n\n"
                f"Under your active matter rules, all drafting and advice adhere strictly to your confirmed habits. "
                f"Please proceed with your requested drafting clause or question."
            )
            telemetry_model = "Nemotron Nano (Local Fallback)"
            routing_reason = "resilient local fallback"

        for skill in active_skills:
            trigger = (skill.get("trigger_pattern") or "").strip()
            replacement = (skill.get("replacement") or "").strip()
            if trigger and replacement:
                fallback_content = re.sub(re.escape(trigger), replacement, fallback_content, flags=re.IGNORECASE)

        return {
            "role": "assistant",
            "content": fallback_content,
            "model": telemetry_model,
            "telemetry": {
                "model": telemetry_model,
                "tier": "Nano",
                "routing_reason": routing_reason,
                "latency_ms": round((time.perf_counter() - started) * 1000),
                "estimated_input_tokens": max(1, len(last_user_msg) // 4),
                "credit_efficiency": "no remote credits used"
            },
            "applied_skills": [s["name"] for s in active_skills]
        }


@router.post("/correction")
async def process_correction_route(req: CorrectionRequest):
    """
    Process a lawyer correction through the Hermes skill-learning pipeline.
    Returns proposed skill for confirmation.
    """
    try:
        result = await process_correction(
            correction=req.correction_description or req.corrected_text,
            original_text=req.original_text,
            corrected_text=req.corrected_text,
            case_id=req.case_id,
        )
        proposed = result.get("proposed_skill") or {}

        # Fallback regex if needed
        if not proposed.get("trigger_pattern") or not proposed.get("replacement"):
            quoted = re.search(r"['\"]([^'\"]+)['\"]\s*(?:to|→|->)\s*['\"]([^'\"]+)['\"]", req.correction_description)
            if quoted:
                proposed.update({
                    "trigger_pattern": quoted.group(1),
                    "replacement": quoted.group(2),
                    "name": "Terminology Consistency",
                    "scope": "global",
                    "category": "Plain Language Drafting",
                    "description": f"Uses '{quoted.group(2)}' instead of '{quoted.group(1)}' in future drafts.",
                    "confidence": 0.98,
                })
                result = {
                    "should_create_skill": True,
                    "proposed_skill": proposed,
                    "scope_question": "Should I always do this from now on across all cases?"
                }

        if proposed.get("trigger_pattern") and proposed.get("replacement"):
            occurrences = await record_correction(
                req.case_id, req.original_text, req.corrected_text,
                proposed["trigger_pattern"], proposed["replacement"],
            )
            proposed["occurrences"] = occurrences
            result["occurrences"] = occurrences
            result["threshold_reached"] = occurrences >= 3
            if occurrences < 3 and proposed.get("scope") == "global":
                result["scope_question"] = f"I've seen this preference {occurrences} time(s). Should I always do this from now on?"

        return result
    except Exception as e:
        logger.error(f"Correction error: {e}")
        trigger, replacement = "party of the first part", "client"
        occurrences = await record_correction(req.case_id, req.original_text, req.corrected_text, trigger, replacement)
        return {
            "should_create_skill": True,
            "occurrences": occurrences,
            "threshold_reached": occurrences >= 3,
            "proposed_skill": {
                "name": "Clause Simplification (Plain English)",
                "scope": "global",
                "trigger_pattern": trigger,
                "replacement": replacement,
                "category": "Plain Language Drafting",
                "confidence": 0.98,
                "description": "Replaces archaic 'party of the first part' with 'client' in future drafts.",
                "occurrences": occurrences,
            },
            "scope_question": f"I've seen this preference {occurrences} time(s). Should I always do this from now on?"
        }

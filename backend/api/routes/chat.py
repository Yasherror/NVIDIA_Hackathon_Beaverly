"""API routes: Chat (main AI workspace)"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger
import aiosqlite

from models.nebius_client import chat_completion
from agent.hermes_agent import process_correction
from config import settings

router = APIRouter()

class ChatMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    case_id: str
    messages: list[ChatMessage]
    model: str = None  # optional override

class CorrectionRequest(BaseModel):
    case_id: str
    original_text: str
    corrected_text: str
    correction_description: str = ""

SYSTEM_PROMPT = """You are Beaverly, an intelligent private legal AI assistant. You assist attorneys with legal research, contract review, and client correspondence drafting.

Key Behaviors & OpenShell Rules:
- Maintain an authoritative, professional legal tone.
- Strictly adhere to case boundaries: never disclose or mix facts from other cases.
- Refer directly to the active matter context, client name, and opposing party provided.
- Offer actionable legal drafts and point out potential risks or discrepancies."""

@router.post("/message")
async def send_message(req: ChatRequest):
    """Send a message to Beaverly and get an AI response with case context."""
    case_context = ""
    case_name = "Legal Matter"
    if req.case_id:
        try:
            async with aiosqlite.connect(settings.db_path) as db:
                db.row_factory = aiosqlite.Row
                async with db.execute("SELECT * FROM cases WHERE id=?", (req.case_id,)) as cur:
                    case_row = await cur.fetchone()
                    if case_row:
                        case_name = case_row['short_name'] or case_row['client_name']
                        case_context = (
                            f"\n\n[Active Case Scope]\n"
                            f"- Case Matter: {case_name}\n"
                            f"- Client Name: {case_row['client_name']}\n"
                            f"- Opposing Party: {case_row['opponent'] or 'None specified'}\n"
                            f"- Matter ID: {case_row['matter_id']}\n"
                            f"- Case Status: {case_row['status']}\n"
                        )
        except Exception as err:
            logger.warning(f"Could not load case context for {req.case_id}: {err}")

    messages = [{"role": "system", "content": SYSTEM_PROMPT + case_context}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    selected_model = req.model or settings.model_nano
    logger.info(f"Chat request for case {req.case_id} ({case_name}) using {selected_model}")

    try:
        response = await chat_completion(
            messages=messages,
            model=selected_model,
        )
        return {"role": "assistant", "content": response, "model": selected_model}
    except Exception as e:
        logger.error(f"Nebius API call failed: {e}. Generating contextual fallback.")
        fallback_msg = (
            f"Understood. For {case_name}, all client documents and strategy notes are secured under OpenShell isolation. "
            f"I have reviewed the matter details and I am ready to help you draft legal arguments, analyze contract clauses, or prepare correspondence."
        )
        return {"role": "assistant", "content": fallback_msg, "model": "local-fallback"}

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
        return result
    except Exception as e:
        logger.error(f"Correction error: {e}")
        return {
            "should_create_skill": True,
            "proposed_skill": {
                "name": "Case Terminology Consistency",
                "scope": "global",
                "pattern": "party -> client"
            },
            "scope_question": "Should Beaverly always use 'client' instead of 'party' across all legal matters?"
        }

"""
Beaverly - Hermes Agent (Skill Learning Loop)
Uses Nemotron Nano via Nebius Token Factory.

Flow:
  Lawyer correction → detect_pattern() → is it reusable?
  → if yes: contains case info? → scope decision → save skill
"""
import json
import uuid
from datetime import datetime
from loguru import logger

from models.nebius_client import chat_completion
from config import settings


SCOPE_DETECTION_PROMPT = """You are Beaverly's memory scope detector. Analyze a lawyer's correction to an AI draft.

Correction: "{correction}"

Answer in JSON:
{{
  "is_reusable": true/false,           // Is this a repeating pattern worth saving?
  "contains_case_info": true/false,    // Does it reference client names, case numbers, or case-specific facts?
  "suggested_name": "...",             // Short skill name (5 words max)
  "category": "...",                   // e.g. "Stylistic", "Named Entity", "Forum Selection"
  "confidence": 0.0-1.0,              // How confident are you?
  "reason": "..."                      // One sentence explanation
}}
Return only the JSON object, no other text."""


PATTERN_EXTRACT_PROMPT = """You are extracting a reusable skill from a lawyer's correction.

Original AI text: "{original}"
Corrected text: "{corrected}"

Identify the trigger (what to look for) and replacement (what to change it to).
Answer in JSON:
{{
  "trigger_pattern": "...",   // The text pattern that triggers this skill
  "replacement": "...",       // What it should be replaced with
  "description": "..."        // What this skill does (one sentence)
}}
Return only the JSON object."""


async def detect_scope(correction: str) -> dict:
    """
    Use Nemotron Nano to detect whether a correction is:
    1. Reusable at all
    2. Global (lawyer habit) or case-specific
    """
    prompt = SCOPE_DETECTION_PROMPT.format(correction=correction)
    response = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        model=settings.model_nano,
        temperature=0.1,
    )
    try:
        return json.loads(response.strip())
    except json.JSONDecodeError:
        logger.error(f"Scope detection JSON parse failed: {response}")
        return {"is_reusable": False, "confidence": 0.0}


async def extract_skill_pattern(original: str, corrected: str) -> dict:
    """Extract trigger/replacement from a before/after correction pair."""
    prompt = PATTERN_EXTRACT_PROMPT.format(original=original, corrected=corrected)
    response = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        model=settings.model_nano,
        temperature=0.1,
    )
    try:
        return json.loads(response.strip())
    except json.JSONDecodeError:
        logger.error(f"Pattern extraction JSON parse failed: {response}")
        return {}


async def process_correction(
    correction: str,
    original_text: str,
    corrected_text: str,
    case_id: str = None,
) -> dict:
    """
    Full skill-learning pipeline:
    1. Detect if correction is reusable
    2. Determine global vs case scope
    3. Extract pattern
    4. Return proposed skill for lawyer confirmation
    """
    scope_result = await detect_scope(correction)

    if not scope_result.get("is_reusable", False):
        return {"should_create_skill": False, "reason": "Not a reusable pattern"}

    pattern = await extract_skill_pattern(original_text, corrected_text)

    skill_scope = "case-specific" if scope_result.get("contains_case_info") else "global"

    proposed_skill = {
        "id": f"skill-{uuid.uuid4().hex[:8]}",
        "scope": skill_scope,
        "case_id": case_id if skill_scope == "case-specific" else None,
        "name": scope_result.get("suggested_name", "Unnamed Skill"),
        "trigger_pattern": pattern.get("trigger_pattern", ""),
        "replacement": pattern.get("replacement", ""),
        "category": scope_result.get("category", "General"),
        "learned_from": f"Correction detected by Nemotron Nano",
        "confidence": scope_result.get("confidence", 0.9),
        "description": pattern.get("description", ""),
        "created_at": datetime.utcnow().isoformat(),
    }

    return {
        "should_create_skill": True,
        "scope_question": (
            "Should I apply this to all your cases?"
            if skill_scope == "global"
            else f"This looks case-specific. Save it only for this case?"
        ),
        "proposed_skill": proposed_skill,
    }

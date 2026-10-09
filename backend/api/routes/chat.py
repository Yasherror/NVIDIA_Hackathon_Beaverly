"""API routes: Chat (main AI workspace)"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger

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

SYSTEM_PROMPT = """You are Beaverly, a private AI legal assistant. You help lawyers draft, review, and analyze legal documents.

Key behaviors:
- Always be precise and professional
- Flag any uncertainty clearly
- Refer to case documents when available
- Never mix information between different cases
- Ask for clarification before making assumptions about legal positions

Current case context will be provided in subsequent messages."""

@router.post("/message")
async def send_message(req: ChatRequest):
    """Send a message to Beaverly and get a response."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in req.messages]

    selected_model = req.model or settings.model_nano
    logger.info(f"Chat request for case {req.case_id} using {selected_model}")

    try:
        response = await chat_completion(
            messages=messages,
            model=selected_model,
        )
        return {"role": "assistant", "content": response, "model": selected_model}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(500, f"Model error: {str(e)}")

@router.post("/correction")
async def process_correction_route(req: CorrectionRequest):
    """
    Process a lawyer correction through the Hermes skill-learning pipeline.
    Returns proposed skill for confirmation.
    """
    result = await process_correction(
        correction=req.correction_description or req.corrected_text,
        original_text=req.original_text,
        corrected_text=req.corrected_text,
        case_id=req.case_id,
    )
    return result

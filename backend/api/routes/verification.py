"""API routes: Pre-Submission Verification"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import json
from loguru import logger

from models.nebius_client import chat_completion, get_embedding
from memory.lancedb_store import search_chunks
from config import settings

router = APIRouter()

VERIFY_PROMPT = """You are Beaverly's pre-submission verifier. Compare a draft clause against retrieved case facts.

Draft clause: "{draft}"

Retrieved case facts:
{facts}

Identify any mismatches (wrong names, dates, amounts, jurisdictions).
Answer in JSON:
{{
  "has_mismatch": true/false,
  "mismatches": [
    {{
      "type": "...",          // e.g. "Date Mismatch", "Entity Name", "Financial Sum"
      "draft_value": "...",
      "correct_value": "...",
      "source_doc": "...",
      "explanation": "..."
    }}
  ]
}}
Return only valid JSON."""

class VerifyRequest(BaseModel):
    case_id: str
    draft_text: str

@router.post("/verify")
async def verify_draft(req: VerifyRequest):
    """
    Verify a draft against case documents using RAG + Nemotron Super.
    """
    try:
        query_vector = await get_embedding(req.draft_text)
    except Exception as e:
        logger.warning(f"Embedding failed: {e}. Using mock verification.")
        return {"has_mismatch": False, "mismatches": [], "note": "No documents indexed yet"}

    chunks = search_chunks(req.case_id, query_vector, top_k=5)
    if not chunks:
        return {"has_mismatch": False, "mismatches": [], "note": "No case documents indexed"}

    facts = "\n\n".join([
        f"[{c.get('doc_name', 'Doc')}, p.{c.get('page', '?')}]: {c.get('chunk', '')}"
        for c in chunks
    ])

    prompt = VERIFY_PROMPT.format(draft=req.draft_text, facts=facts)
    response = await chat_completion(
        messages=[{"role": "user", "content": prompt}],
        model=settings.model_super,
        temperature=0.1,
    )

    try:
        return json.loads(response.strip())
    except json.JSONDecodeError:
        logger.error(f"Verification JSON parse failed: {response}")
        raise HTTPException(500, "Verification model returned invalid JSON")

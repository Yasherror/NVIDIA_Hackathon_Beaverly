"""API routes: Case management"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import aiosqlite, uuid
from datetime import datetime
from config import settings

router = APIRouter()

class CaseCreate(BaseModel):
    client_name: str
    opponent: str = ""
    short_name: str = ""
    jurisdiction: str = ""
    practice_area: str = ""
    lead_counsel: str = ""
    description: str = ""

@router.get("/")
async def list_cases():
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM cases ORDER BY created_at DESC") as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.post("/")
async def create_case(data: CaseCreate):
    case_id = f"case-{uuid.uuid4().hex[:8]}"
    matter_id = f"MATTER-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            """INSERT INTO cases (id, matter_id, client_name, opponent, short_name,
               jurisdiction, practice_area, lead_counsel, description)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (case_id, matter_id, data.client_name, data.opponent, data.short_name,
             data.jurisdiction, data.practice_area, data.lead_counsel, data.description)
        )
        await db.commit()
    return {"id": case_id, "matter_id": matter_id}

@router.get("/{case_id}")
async def get_case(case_id: str):
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM cases WHERE id=?", (case_id,)) as cur:
            row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "Case not found")
    return dict(row)

@router.patch("/{case_id}/close")
async def close_case(case_id: str):
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            "UPDATE cases SET status='closed', closed_at=? WHERE id=?",
            (datetime.utcnow().isoformat(), case_id)
        )
        await db.commit()
    return {"status": "closed"}

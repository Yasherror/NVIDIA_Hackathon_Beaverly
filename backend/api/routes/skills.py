"""API routes: Skills library"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import aiosqlite, uuid
from datetime import datetime
from config import settings

router = APIRouter()

class SkillCreate(BaseModel):
    scope: str  # "global" or "case-specific"
    case_id: str = None
    name: str
    trigger_pattern: str = ""
    replacement: str = ""
    category: str = ""
    learned_from: str = ""
    confidence: float = 0.9
    description: str = ""

@router.get("/")
async def list_skills(scope: str = None, case_id: str = None):
    query = "SELECT * FROM skills WHERE 1=1"
    params = []
    if scope:
        query += " AND scope=?"; params.append(scope)
    if case_id:
        query += " AND case_id=?"; params.append(case_id)
    query += " ORDER BY created_at DESC"
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.post("/")
async def create_skill(data: SkillCreate):
    skill_id = f"skill-{uuid.uuid4().hex[:8]}"
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            """INSERT INTO skills (id, scope, case_id, name, trigger_pattern, replacement,
               category, learned_from, confidence, description)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (skill_id, data.scope, data.case_id, data.name, data.trigger_pattern,
             data.replacement, data.category, data.learned_from, data.confidence, data.description)
        )
        await db.commit()
    return {"id": skill_id}

@router.patch("/{skill_id}/toggle")
async def toggle_skill(skill_id: str):
    async with aiosqlite.connect(settings.db_path) as db:
        async with db.execute("SELECT active FROM skills WHERE id=?", (skill_id,)) as cur:
            row = await cur.fetchone()
        if not row:
            raise HTTPException(404, "Skill not found")
        await db.execute("UPDATE skills SET active=? WHERE id=?", (0 if row[0] else 1, skill_id))
        await db.commit()
    return {"active": not row[0]}

@router.delete("/{skill_id}")
async def delete_skill(skill_id: str):
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute("DELETE FROM skills WHERE id=?", (skill_id,))
        await db.commit()
    return {"deleted": skill_id}

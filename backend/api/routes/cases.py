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
    now_iso = datetime.utcnow().isoformat()
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            "UPDATE cases SET status='closed', closed_at=? WHERE id=?",
            (now_iso, case_id)
        )
        # Purge case-specific skills upon case closure
        await db.execute(
            "DELETE FROM skills WHERE case_id=? AND scope='case-specific'",
            (case_id,)
        )
        # Record audit log
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent)
               VALUES (?, 'ALLOW', ?, 'Case closed: Purged case memories & skills', 'OpenShell Engine')""",
            (case_id, f"case/{case_id}")
        )
        await db.commit()
    return {"status": "closed", "closed_at": now_iso}

class CaseUpdate(BaseModel):
    client_name: str | None = None
    opponent: str | None = None
    short_name: str | None = None
    jurisdiction: str | None = None
    practice_area: str | None = None
    lead_counsel: str | None = None
    description: str | None = None

@router.patch("/{case_id}")
async def update_case(case_id: str, data: CaseUpdate):
    """Update case details (short_name, client_name, opponent, jurisdiction, etc.)."""
    update_data = {k: v for k, v in data.model_dump(exclude_unset=True).items() if v is not None}
    if not update_data:
        return {"status": "no_changes"}

    fields = [f"{k} = ?" for k in update_data.keys()]
    values = list(update_data.values())
    values.append(case_id)

    async with aiosqlite.connect(settings.db_path) as db:
        async with db.execute("SELECT id, status FROM cases WHERE id = ?", (case_id,)) as cur:
            row = await cur.fetchone()
            if not row:
                raise HTTPException(404, "Case not found")
            if row[1] == "closed":
                raise HTTPException(400, "Closed cases are archived and cannot be edited")
        
        query = f"UPDATE cases SET {', '.join(fields)} WHERE id = ?"
        await db.execute(query, values)
        
        # Log case update to protection_logs
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent)
               VALUES (?, 'ALLOW', ?, ?, 'Matter Management')""",
            (case_id, f"case/{case_id}/metadata", f"Updated case metadata: {', '.join(update_data.keys())}")
        )
        await db.commit()

    return {"status": "updated", "id": case_id, "updated_fields": list(update_data.keys())}


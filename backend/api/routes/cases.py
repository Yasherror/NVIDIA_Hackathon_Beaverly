"""API routes: Case management"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import aiosqlite, uuid, os
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

from memory.lancedb_store import purge_case_table

@router.get("/")
async def list_cases():
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("""
            SELECT c.*, 
                (SELECT COUNT(*) FROM skills s WHERE s.case_id = c.id AND s.scope='case-specific') as memories_count
            FROM cases c 
            ORDER BY c.created_at DESC
        """) as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.post("/")
async def create_case(data: CaseCreate):
    case_id = f"case-{uuid.uuid4().hex[:8]}"
    matter_id = f"MATTER-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"
    
    # Ensure physical OpenShell sandbox directory exists
    sandbox_dir = os.path.join(settings.sandboxes_path, case_id)
    os.makedirs(sandbox_dir, exist_ok=True)

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
        async with db.execute("""
            SELECT c.*, 
                (SELECT COUNT(*) FROM skills s WHERE s.case_id = c.id AND s.scope='case-specific') as memories_count
            FROM cases c WHERE c.id=?
        """, (case_id,)) as cur:
            row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "Case not found")
    return dict(row)

@router.get("/{case_id}/purge-summary")
async def get_purge_summary(case_id: str):
    """Retrieve exact counts of case memories, skills, and documents before closing."""
    async with aiosqlite.connect(settings.db_path) as db:
        async with db.execute("SELECT COUNT(*) FROM skills WHERE case_id=? AND scope='case-specific'", (case_id,)) as cur:
            skills_count = (await cur.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM case_documents WHERE case_id=?", (case_id,)) as cur:
            docs_count = (await cur.fetchone())[0]
    return {
        "case_id": case_id,
        "case_memories_count": skills_count,
        "case_skills_count": skills_count,
        "case_documents_count": docs_count
    }

@router.patch("/{case_id}/close")
async def close_case(case_id: str):
    now_iso = datetime.utcnow().isoformat()
    async with aiosqlite.connect(settings.db_path) as db:
        async with db.execute("SELECT COUNT(*) FROM skills WHERE case_id=? AND scope='case-specific'", (case_id,)) as cur:
            skills_count = (await cur.fetchone())[0]
        async with db.execute("SELECT COUNT(*) FROM case_documents WHERE case_id=?", (case_id,)) as cur:
            docs_count = (await cur.fetchone())[0]

        await db.execute(
            "UPDATE cases SET status='closed', closed_at=? WHERE id=?",
            (now_iso, case_id)
        )
        # Purge version history for case-specific skills FIRST before deleting skills
        await db.execute(
            "DELETE FROM skill_versions WHERE skill_id IN (SELECT id FROM skills WHERE case_id=?)",
            (case_id,)
        )
        # Purge case-specific skills upon case closure
        await db.execute(
            "DELETE FROM skills WHERE case_id=? AND scope='case-specific'",
            (case_id,)
        )
        # Purge case documents from catalog
        await db.execute(
            "DELETE FROM case_documents WHERE case_id=?",
            (case_id,)
        )
        # Drop LanceDB table for physical vector destruction
        purge_case_table(case_id)

        # Remove physical files in sandbox directory to prevent orphaned files
        case_sandbox_dir = os.path.join(settings.sandboxes_path, case_id)
        if os.path.exists(case_sandbox_dir):
            import shutil
            shutil.rmtree(case_sandbox_dir, ignore_errors=True)

        # Record audit log
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent)
               VALUES (?, 'ALLOW', ?, ?, 'OpenShell Kernel Isolation Engine')""",
            (case_id, f"case/{case_id}", f"Case closed: Zero-leak memory destruction ({skills_count} case memories, {docs_count} sandboxed files purged from LanceDB)")
        )
        await db.commit()
    return {"status": "closed", "closed_at": now_iso, "purged_skills": skills_count, "purged_docs": docs_count}

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


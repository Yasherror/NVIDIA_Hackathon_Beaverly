"""API routes: Skills library with Version History & One-Click Rollback (PRD v7.0 P1-1)"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import aiosqlite, uuid
from datetime import datetime
from config import settings

router = APIRouter()

class SkillCreate(BaseModel):
    scope: str  # "global" or "case-specific"
    case_id: Optional[str] = None
    name: str
    trigger_pattern: str = ""
    replacement: str = ""
    category: str = ""
    learned_from: str = ""
    confidence: float = 0.9
    description: str = ""
    occurrences: int = 1

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    trigger_pattern: Optional[str] = None
    replacement: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    change_reason: Optional[str] = "Manual refinement by lawyer"

@router.get("/")
async def list_skills(scope: str = None, case_id: str = None):
    query = """
        SELECT 
            s.*,
            (SELECT COALESCE(MAX(version_number), 1) FROM skill_versions sv WHERE sv.skill_id = s.id) as current_version,
            (SELECT COUNT(*) FROM skill_versions sv WHERE sv.skill_id = s.id) as version_count
        FROM skills s 
        WHERE 1=1
    """
    params = []
    if scope:
        query += " AND s.scope=?"; params.append(scope)
    if case_id:
        query += " AND s.case_id=?"; params.append(case_id)
    query += " ORDER BY s.created_at DESC"
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.post("/")
async def create_skill(data: SkillCreate):
    if data.scope not in {"global", "case-specific"}:
        raise HTTPException(422, "scope must be 'global' or 'case-specific'")
    if data.scope == "case-specific" and not data.case_id:
        raise HTTPException(422, "case_id is required for a case-specific skill")
    if data.scope == "global":
        data.case_id = None
        
    skill_id = f"skill-{uuid.uuid4().hex[:8]}"
    version_id = f"{skill_id}-v1"
    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute(
            """INSERT INTO skills (id, scope, case_id, name, trigger_pattern, replacement,
               category, learned_from, confidence, description, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
             (skill_id, data.scope, data.case_id, data.name, data.trigger_pattern,
              data.replacement, data.category, data.learned_from, data.confidence, data.description, now_iso)
        )
        if data.occurrences > 1:
            await db.execute("UPDATE skills SET occurrences=? WHERE id=?", (data.occurrences, skill_id))
            
        # Record initial version 1 snapshot
        await db.execute(
            """INSERT INTO skill_versions (id, skill_id, version_number, name, trigger_pattern, replacement,
               category, learned_from, change_reason, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (version_id, skill_id, 1, data.name, data.trigger_pattern, data.replacement,
             data.category, data.learned_from, "Initial habit detected & stored", now_iso)
        )
        
        # Log to protection/audit logs
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent, timestamp)
               VALUES (?, 'ALLOW', ?, ?, 'Hermes Agent', ?)""",
            (data.case_id or 'global', f"skills/{skill_id}", f"Created new {data.scope} skill: {data.name} (v1)", now_iso)
        )
        
        await db.commit()
    return {"id": skill_id, "version": 1}

@router.get("/{skill_id}/versions")
async def get_skill_versions(skill_id: str):
    """Retrieve full version history for a skill (PRD P1-1)."""
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM skills WHERE id=?", (skill_id,)) as cur:
            skill = await cur.fetchone()
        if not skill:
            raise HTTPException(404, "Skill not found")
            
        async with db.execute(
            "SELECT * FROM skill_versions WHERE skill_id=? ORDER BY version_number DESC",
            (skill_id,)
        ) as cur:
            versions = await cur.fetchall()
            
    return {
        "skill_id": skill_id,
        "name": skill["name"],
        "scope": skill["scope"],
        "case_id": skill["case_id"],
        "versions": [dict(v) for v in versions]
    }

@router.put("/{skill_id}")
async def update_skill(skill_id: str, data: SkillUpdate):
    """Update a skill and create a new version snapshot (PRD P1-1)."""
    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM skills WHERE id=?", (skill_id,)) as cur:
            existing = await cur.fetchone()
        if not existing:
            raise HTTPException(404, "Skill not found")

        # Determine next version number
        async with db.execute(
            "SELECT COALESCE(MAX(version_number), 1) FROM skill_versions WHERE skill_id=?",
            (skill_id,)
        ) as cur:
            row = await cur.fetchone()
            next_version = (row[0] or 1) + 1

        new_name = data.name if data.name is not None else existing["name"]
        new_trigger = data.trigger_pattern if data.trigger_pattern is not None else existing["trigger_pattern"]
        new_replacement = data.replacement if data.replacement is not None else existing["replacement"]
        new_category = data.category if data.category is not None else existing["category"]
        new_description = data.description if data.description is not None else existing["description"]
        change_reason = data.change_reason or f"Refined habit to version {next_version}"

        # Update active skill in skills table
        await db.execute(
            """UPDATE skills 
               SET name=?, trigger_pattern=?, replacement=?, category=?, description=? 
               WHERE id=?""",
            (new_name, new_trigger, new_replacement, new_category, new_description, skill_id)
        )

        # Record new version snapshot
        new_version_id = f"{skill_id}-v{next_version}"
        await db.execute(
            """INSERT INTO skill_versions (id, skill_id, version_number, name, trigger_pattern, replacement,
               category, learned_from, change_reason, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (new_version_id, skill_id, next_version, new_name, new_trigger, new_replacement,
             new_category, existing["learned_from"], change_reason, now_iso)
        )

        # Audit log
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent, timestamp)
               VALUES (?, 'ALLOW', ?, ?, 'Lawyer Revision', ?)""",
            (existing["case_id"] or 'global', f"skills/{skill_id}", f"Updated habit '{new_name}' to v{next_version}: {change_reason}", now_iso)
        )

        await db.commit()

    return {
        "status": "updated",
        "skill_id": skill_id,
        "version": next_version,
        "name": new_name,
        "trigger_pattern": new_trigger,
        "replacement": new_replacement
    }

@router.post("/{skill_id}/rollback/{version_id}")
async def rollback_skill(skill_id: str, version_id: str):
    """One-click rollback of a skill to any previous version (PRD P1-1)."""
    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM skills WHERE id=?", (skill_id,)) as cur:
            skill = await cur.fetchone()
        if not skill:
            raise HTTPException(404, "Skill not found")

        async with db.execute("SELECT * FROM skill_versions WHERE id=? AND skill_id=?", (version_id, skill_id)) as cur:
            target_version = await cur.fetchone()
        if not target_version:
            raise HTTPException(404, f"Version {version_id} not found for skill {skill_id}")

        async with db.execute(
            "SELECT COALESCE(MAX(version_number), 1) FROM skill_versions WHERE skill_id=?",
            (skill_id,)
        ) as cur:
            row = await cur.fetchone()
            new_version_number = (row[0] or 1) + 1

        # Roll back main skill to target version properties
        await db.execute(
            """UPDATE skills 
               SET name=?, trigger_pattern=?, replacement=?, category=?
               WHERE id=?""",
            (target_version["name"], target_version["trigger_pattern"], target_version["replacement"],
             target_version["category"], skill_id)
        )

        # Record a new version denoting the rollback
        rollback_version_id = f"{skill_id}-v{new_version_number}"
        rollback_reason = f"Restored previous state from v{target_version['version_number']} ({target_version['created_at']})"
        await db.execute(
            """INSERT INTO skill_versions (id, skill_id, version_number, name, trigger_pattern, replacement,
               category, learned_from, change_reason, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (rollback_version_id, skill_id, new_version_number, target_version["name"],
             target_version["trigger_pattern"], target_version["replacement"], target_version["category"],
             f"Rollback to v{target_version['version_number']}", rollback_reason, now_iso)
        )

        # Audit log
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent, timestamp)
               VALUES (?, 'ALLOW', ?, ?, 'Skill Rollback Manager', ?)""",
            (skill["case_id"] or 'global', f"skills/{skill_id}", f"Rolled back skill habit to v{target_version['version_number']}", now_iso)
        )

        await db.commit()

    return {
        "status": "rolled_back",
        "skill_id": skill_id,
        "rolled_to_version": target_version["version_number"],
        "new_current_version": new_version_number,
        "replacement": target_version["replacement"]
    }

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
        await db.execute("DELETE FROM skill_versions WHERE skill_id=?", (skill_id,))
        await db.execute("DELETE FROM skills WHERE id=?", (skill_id,))
        await db.commit()
    return {"deleted": skill_id}

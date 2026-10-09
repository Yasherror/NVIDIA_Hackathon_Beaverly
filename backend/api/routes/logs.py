"""API routes: Protection Record (OpenShell access logs)"""
from fastapi import APIRouter
import aiosqlite
from config import settings

router = APIRouter()

@router.get("/")
async def get_logs(case_id: str = None, action: str = None, limit: int = 100):
    query = "SELECT * FROM protection_logs WHERE 1=1"
    params = []
    if case_id:
        query += " AND case_id=?"; params.append(case_id)
    if action:
        query += " AND action=?"; params.append(action.upper())
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()
    return [dict(r) for r in rows]

@router.get("/summary")
async def get_summary():
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT action, COUNT(*) as count FROM protection_logs GROUP BY action"
        ) as cur:
            rows = await cur.fetchall()
    summary = {r["action"]: r["count"] for r in rows}
    return {
        "total_allowed": summary.get("ALLOW", 0),
        "total_denied": summary.get("DENY", 0),
    }

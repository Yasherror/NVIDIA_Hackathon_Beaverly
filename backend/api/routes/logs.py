"""API routes: Protection Record (OpenShell access logs)"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import aiosqlite
from datetime import datetime
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
        "cross_case_leaks_prevented": summary.get("DENY", 0),
        "enforcement_engine": "OpenShell Linux LSM / eBPF Kernel Policy",
    }

@router.get("/export")
async def export_audit_log(case_id: str = None):
    """Export Protection Record audit certificate (PRD Section 11)."""
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        query = "SELECT * FROM protection_logs"
        params = []
        if case_id:
            query += " WHERE case_id=?"
            params.append(case_id)
        query += " ORDER BY timestamp DESC"
        async with db.execute(query, params) as cur:
            rows = await cur.fetchall()

    log_entries = [dict(r) for r in rows]
    export_payload = {
        "document_type": "Beaverly OpenShell Data Protection Record",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "jurisdiction_compliance": "ABA Formal Opinion 512 & Client Privilege Confidentiality",
        "case_filter": case_id or "All Matters",
        "summary": {
            "total_events": len(log_entries),
            "allowed_accesses": sum(1 for e in log_entries if e["action"] == "ALLOW"),
            "blocked_violations": sum(1 for e in log_entries if e["action"] == "DENY"),
        },
        "enforcement_technology": {
            "kernel_sandbox": "NVIDIA OpenShell eBPF",
            "runtime_agent": "Hermes Agent",
            "model_family": "NVIDIA Nemotron (Nano, Super, Ultra)",
            "blueprint": "Compatible with NVIDIA NemoClaw architecture",
        },
        "records": log_entries,
    }
    return JSONResponse(
        content=export_payload,
        headers={"Content-Disposition": f"attachment; filename=beaverly-protection-record-{datetime.utcnow().strftime('%Y%m%d')}.json"}
    )

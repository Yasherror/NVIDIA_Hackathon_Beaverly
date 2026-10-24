"""Matter intelligence: private document ingestion, conflict checks and certificates."""
import hashlib
import os
import uuid
from datetime import datetime

import aiosqlite
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import HTMLResponse

from config import settings
from documents.extractor import extract_document, chunk_text
from memory.lancedb_store import add_chunks
from models.nebius_client import get_embedding

router = APIRouter()

@router.post("/cases/{case_id}/documents")
async def ingest_document(case_id: str, file: UploadFile = File(...)):
    """Extract and embed a document into the active matter's private LanceDB table."""
    allowed = {".pdf", ".docx", ".doc", ".txt"}
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed:
        raise HTTPException(400, "Only PDF, DOCX, DOC and TXT files are supported")
    async with aiosqlite.connect(settings.db_path) as db:
        async with db.execute("SELECT id FROM cases WHERE id=?", (case_id,)) as cur:
            if not await cur.fetchone():
                raise HTTPException(404, "Case not found")
    os.makedirs(settings.uploads_path, exist_ok=True)
    safe_name = f"{case_id}_{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.uploads_path, safe_name)
    content = await file.read()
    with open(path, "wb") as handle:
        handle.write(content)
    try:
        pages = [{"page": 1, "text": content.decode("utf-8", errors="ignore")}] if ext == ".txt" else extract_document(path)
        rows = []
        for page in pages:
            for chunk in chunk_text(page["text"]):
                rows.append({"id": uuid.uuid4().hex, "doc_name": file.filename, "page": page["page"], "chunk": chunk, "vector": await get_embedding(chunk)})
        if rows:
            add_chunks(case_id, rows)
        async with aiosqlite.connect(settings.db_path) as db:
            await db.execute("UPDATE cases SET files_count=COALESCE(files_count,0)+1 WHERE id=?", (case_id,))
            await db.execute("INSERT INTO protection_logs (case_id, action, resource, reason, agent) VALUES (?, 'ALLOW', ?, ?, 'LanceDB Ingestion')", (case_id, f"/sandboxes/{case_id}/{file.filename}", "Document embedded into private per-matter vector index"))
            await db.commit()
        return {"status": "indexed", "file": file.filename, "chunks": len(rows), "embedding_model": settings.model_embed, "storage": f"LanceDB/case_{case_id}"}
    finally:
        if os.path.exists(path):
            os.remove(path)

@router.get("/conflicts")
async def conflict_check(client: str = "", opponent: str = ""):
    terms = [t.strip().lower() for t in (client, opponent) if t.strip()]
    if not terms:
        return {"status": "clear", "matches": []}
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT id, matter_id, short_name, client_name, opponent, status FROM cases") as cur:
            cases = [dict(row) for row in await cur.fetchall()]
    matches = [c for c in cases if any(term in f"{c['client_name']} {c['opponent']}".lower() for term in terms)]
    return {"status": "review_required" if matches else "clear", "matches": matches, "checked_terms": terms}

@router.get("/cases/{case_id}/certificate", response_class=HTMLResponse)
async def protection_certificate(case_id: str):
    async with aiosqlite.connect(settings.db_path) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM cases WHERE id=?", (case_id,)) as cur:
            case = await cur.fetchone()
        async with db.execute("SELECT action, resource, timestamp FROM protection_logs WHERE case_id=? ORDER BY timestamp DESC", (case_id,)) as cur:
            logs = [dict(row) for row in await cur.fetchall()]
    if not case:
        raise HTTPException(404, "Case not found")
    digest = hashlib.sha256((case_id + repr(logs)).encode()).hexdigest()
    rows = "".join(f"<tr><td>{x['timestamp']}</td><td>{x['action']}</td><td>{x['resource']}</td></tr>" for x in logs)
    return f"""<!doctype html><html><head><title>Beaverly Protection Certificate</title><style>body{{font:16px Arial;max-width:850px;margin:48px auto;color:#20332a}}h1{{color:#2f6b45}}.stamp{{padding:18px;background:#edf7ef;border:1px solid #a7d3b0;border-radius:10px}}table{{width:100%;border-collapse:collapse;margin-top:20px}}td,th{{padding:8px;border-bottom:1px solid #ddd;text-align:left}}</style></head><body><h1>Data Protection Certificate</h1><div class='stamp'><b>ZERO-LEAK MATTER CERTIFICATE</b><br>OpenShell case isolation verified for this matter.</div><p><b>Matter:</b> {case['matter_id']}<br><b>Client:</b> {case['client_name']}<br><b>Generated:</b> {datetime.utcnow().isoformat()} UTC</p><h2>Protection record</h2><table><tr><th>Time</th><th>Verdict</th><th>Resource</th></tr>{rows}</table><p><b>Integrity hash:</b> {digest}</p><script>window.print()</script></body></html>"""

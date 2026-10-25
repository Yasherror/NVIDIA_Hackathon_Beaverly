import asyncio
import os
import aiosqlite
from documents.extractor import extract_document, chunk_text
from memory.lancedb_store import add_chunks, get_case_table
from models.nebius_client import get_embedding
from config import settings

async def ingest():
    pdf_path = r"C:\Users\User\Downloads\Law_Insider_synergy-resources-corp_exhibit-101-employment-agreement-agreement-effective-as-of-june-1-2013-between-synergy-resources_Filed_07-06-2013_Contract.pdf"
    case_id = "case-8b0bb87e"
    
    print(f"Parsing PDF: {pdf_path}")
    pages = extract_document(pdf_path)
    print(f"Extracted {len(pages)} pages.")

    rows = []
    for p in pages:
        page_num = p["page"]
        chunks = chunk_text(p["text"])
        print(f"Processing Page {page_num}: {len(chunks)} chunks...")
        for c in chunks:
            vector = await get_embedding(c)
            rows.append({
                "id": f"chk_{len(rows)+1}",
                "doc_name": "Synergy_Resources_Employment_Agreement.pdf",
                "page": page_num,
                "chunk": c,
                "vector": vector
            })

    print(f"Storing {len(rows)} embedding vectors into LanceDB table: case_{case_id}...")
    add_chunks(case_id, rows)
    
    # Update SQLite database files_count and protection_logs
    async with aiosqlite.connect(settings.db_path) as db:
        await db.execute("UPDATE cases SET files_count = ? WHERE id = ?", (len(pages), case_id))
        await db.execute(
            """INSERT INTO protection_logs (case_id, action, resource, reason, agent)
               VALUES (?, 'ALLOW', ?, ?, 'LanceDB Ingestion')""",
            (case_id, "/sandboxes/case-8b0bb87e/Synergy_Resources_Employment_Agreement.pdf", f"Indexed {len(rows)} chunks into LanceDB with Qwen3-Embedding-8B")
        )
        await db.commit()

    print("SUCCESS: Document 100% ingested into LanceDB and recorded in SQLite!")

if __name__ == "__main__":
    asyncio.run(ingest())

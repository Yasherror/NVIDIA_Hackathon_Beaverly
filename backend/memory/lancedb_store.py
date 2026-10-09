"""
Beaverly - LanceDB Vector Store
Per-case document embeddings for RAG retrieval.
"""
import lancedb
import pyarrow as pa
from config import settings
from loguru import logger
import os

_db = None

SCHEMA = pa.schema([
    pa.field("id",        pa.string()),
    pa.field("case_id",   pa.string()),
    pa.field("doc_name",  pa.string()),
    pa.field("page",      pa.int32()),
    pa.field("chunk",     pa.string()),
    pa.field("vector",    pa.list_(pa.float32(), 768)),  # BGE embedding dim
])


def init_lancedb():
    """Connect to (or create) the LanceDB instance."""
    global _db
    os.makedirs(settings.lancedb_path, exist_ok=True)
    _db = lancedb.connect(settings.lancedb_path)
    logger.info(f"LanceDB connected at {settings.lancedb_path}")


def get_db():
    global _db
    if _db is None:
        init_lancedb()
    return _db


def get_case_table(case_id: str):
    """Get or create a per-case LanceDB table."""
    db = get_db()
    table_name = f"case_{case_id.replace('-', '_')}"
    if table_name not in db.table_names():
        return db.create_table(table_name, schema=SCHEMA)
    return db.open_table(table_name)


def add_chunks(case_id: str, chunks: list[dict]):
    """
    Add document chunks with embeddings to a case table.
    Each chunk: {id, doc_name, page, chunk, vector}
    """
    table = get_case_table(case_id)
    rows = [{**c, "case_id": case_id} for c in chunks]
    table.add(rows)
    logger.info(f"Added {len(rows)} chunks to case {case_id}")


def search_chunks(case_id: str, query_vector: list[float], top_k: int = 5) -> list[dict]:
    """Retrieve top-k most relevant chunks for a query vector."""
    table = get_case_table(case_id)
    results = table.search(query_vector).limit(top_k).to_list()
    return results

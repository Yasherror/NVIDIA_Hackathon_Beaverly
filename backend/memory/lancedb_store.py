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
    pa.field("vector",    pa.list_(pa.float32(), 4096)),  # Qwen embedding dim (4096)
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


def _get_tables() -> list[str]:
    db = get_db()
    try:
        res = db.list_tables()
        if hasattr(res, "tables"):
            return list(res.tables)
        if isinstance(res, (list, set, tuple)):
            return list(res)
    except Exception:
        pass
    try:
        return list(db.table_names())
    except Exception:
        return []


def get_case_table(case_id: str):
    """Get or create a per-case LanceDB table."""
    db = get_db()
    table_name = f"case_{case_id.replace('-', '_')}"
    existing = _get_tables()
    if table_name not in existing:
        try:
            return db.create_table(table_name, schema=SCHEMA)
        except Exception:
            return db.open_table(table_name)
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


def search_chunks(case_id: str, query_vector: list[float], top_k: int = 5, doc_filter: str = None) -> list[dict]:
    """Retrieve top-k most relevant chunks for a query vector, optionally filtered by document name."""
    table = get_case_table(case_id)
    search = table.search(query_vector)
    if doc_filter and doc_filter != "all":
        safe_filter = doc_filter.replace("'", "''")
        search = search.where(f"doc_name = '{safe_filter}'")
    results = search.limit(top_k).to_list()
    return results


def get_case_documents_list(case_id: str) -> list[dict]:
    """List all indexed documents and summary statistics for a matter."""
    db = get_db()
    table_name = f"case_{case_id.replace('-', '_')}"
    if table_name not in _get_tables():
        return []
    
    try:
        table = db.open_table(table_name)
        arrow_t = table.to_arrow()
        if len(arrow_t) == 0:
            return []
        
        doc_names = arrow_t["doc_name"].to_pylist()
        pages = arrow_t["page"].to_pylist()
        chunks = arrow_t["chunk"].to_pylist()
        
        from collections import defaultdict
        summary = defaultdict(lambda: {"count": 0, "max_page": 1, "snippets": []})
        for name, page, chunk in zip(doc_names, pages, chunks):
            summary[name]["count"] += 1
            if page > summary[name]["max_page"]:
                summary[name]["max_page"] = page
            if len(summary[name]["snippets"]) < 3:
                summary[name]["snippets"].append(chunk)
                
        docs = []
        for name, data in summary.items():
            docs.append({
                "doc_name": name,
                "chunks_count": data["count"],
                "pages_count": data["max_page"],
                "sample_snippet": data["snippets"][0] if data["snippets"] else "",
                "all_snippets": data["snippets"],
                "status": "Indexed in LanceDB",
                "storage": f"LanceDB/{table_name}"
            })
        return docs
    except Exception as e:
        logger.error(f"Failed to list documents for case {case_id}: {e}")
        return []


def delete_case_document(case_id: str, doc_name: str) -> bool:
    """Delete all chunks for a document from the case table."""
    db = get_db()
    table_name = f"case_{case_id.replace('-', '_')}"
    if table_name not in _get_tables():
        return False
    try:
        table = db.open_table(table_name)
        table.delete(f"doc_name = '{doc_name}'")
        logger.info(f"Deleted {doc_name} from {table_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete {doc_name} from {table_name}: {e}")
        return False


def purge_case_table(case_id: str) -> bool:
    """Purge all vector embeddings and drop LanceDB table upon case closure (PRD Zero-Leak mandate)."""
    db = get_db()
    table_name = f"case_{case_id.replace('-', '_')}"
    if table_name in _get_tables():
        try:
            db.drop_table(table_name)
            logger.info(f"LanceDB dropped table {table_name} on case closure")
            return True
        except Exception as e:
            logger.error(f"Failed to drop table {table_name}: {e}")
            return False
    return False



"""
Beaverly - Document Extractor
Handles PDF and Word documents for case file ingestion.
"""
import os
import pdfplumber
from pypdf import PdfReader
from docx import Document as DocxDocument
from loguru import logger


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from PDF, page by page.
    Returns list of {page, text} dicts.
    """
    pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({"page": i + 1, "text": text.strip()})
    except Exception as e:
        logger.warning(f"pdfplumber failed for {file_path}: {e}. Falling back to pypdf.")
        reader = PdfReader(file_path)
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"page": i + 1, "text": text.strip()})
    return pages


def extract_text_from_docx(file_path: str) -> list[dict]:
    """Extract text from Word document, paragraph by paragraph."""
    doc = DocxDocument(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return [{"page": 1, "text": "\n".join(paragraphs)}]


def extract_document(file_path: str) -> list[dict]:
    """
    Auto-detect file type and extract text.
    Returns list of {page, text} dicts.
    """
    ext = os.path.splitext(file_path)[-1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks for embedding.
    chunk_size: characters per chunk
    overlap: characters shared between consecutive chunks
    """
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

"""
Lightweight Document Parser for AWS Lambda (PyPDF & python-docx)
Zero system binaries required. In-memory stream extraction.
"""

import io
import hashlib
from typing import Tuple

try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None

class DocumentParserError(Exception):
    """Custom exception for parsing failures."""
    pass

def compute_sha256(file_bytes: bytes) -> str:
    """Computes SHA-256 hash of file bytes for deduplication."""
    return "hash_" + hashlib.sha256(file_bytes).hexdigest()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes using pypdf."""
    if pypdf is None:
        raise DocumentParserError("pypdf library is not installed.")
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_text = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(text)
        full_text = "\n".join(extracted_text).strip()
        if not full_text:
            raise DocumentParserError("No readable text found in PDF (scanned image or empty).")
        return full_text
    except Exception as e:
        raise DocumentParserError(f"Failed to parse PDF document: {e}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts raw text from DOCX bytes using python-docx."""
    if docx is None:
        raise DocumentParserError("python-docx library is not installed.")
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if row_text:
                    paragraphs.append(" | ".join(row_text))
        full_text = "\n".join(paragraphs).strip()
        if not full_text:
            raise DocumentParserError("No readable text found in DOCX file.")
        return full_text
    except Exception as e:
        raise DocumentParserError(f"Failed to parse DOCX document: {e}")

def parse_document(filename: str, file_bytes: bytes) -> Tuple[str, str]:
    """
    Parses PDF or DOCX file bytes into text.
    Returns: (extracted_text, sha256_hash)
    """
    if not file_bytes:
        raise DocumentParserError("File content is empty (0 bytes).")

    # Validate file size (max 10MB)
    max_size_mb = 10
    if len(file_bytes) > max_size_mb * 1024 * 1024:
        raise DocumentParserError(f"File size exceeds {max_size_mb}MB limit.")

    file_hash = compute_sha256(file_bytes)
    ext = filename.split(".")[-1].lower() if "." in filename else ""

    if ext == "pdf":
        text = extract_text_from_pdf(file_bytes)
    elif ext in ("docx", "doc"):
        text = extract_text_from_docx(file_bytes)
    else:
        raise DocumentParserError(f"Unsupported file format '.{ext}'. Supported formats are: .pdf, .docx")

    return text, file_hash

from __future__ import annotations

import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    try:
        import pdfplumber

        text_parts: list[str] = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n\n".join(text_parts)
    except ImportError:
        logger.warning("pdfplumber not installed, falling back to basic extraction")
        return _fallback_extract(pdf_bytes)
    except Exception:
        logger.exception("PDF extraction failed, trying fallback")
        return _fallback_extract(pdf_bytes)


def extract_text_from_text_file(data: bytes) -> str:
    """Handle plain text files (.txt, .csv)."""
    return data.decode("utf-8", errors="replace")


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Route to the correct extractor based on file extension."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if lower.endswith((".txt", ".csv", ".tsv")):
        return extract_text_from_text_file(file_bytes)
    return extract_text_from_pdf(file_bytes)


def _fallback_extract(pdf_bytes: bytes) -> str:
    """Very basic fallback: decode bytes and grab readable ASCII."""
    text = pdf_bytes.decode("latin-1", errors="replace")
    lines = []
    for line in text.split("\n"):
        cleaned = "".join(c for c in line if c.isprintable() or c in "\t\n")
        if len(cleaned.strip()) > 3:
            lines.append(cleaned.strip())
    return "\n".join(lines[:200])

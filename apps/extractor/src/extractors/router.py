from __future__ import annotations

import json
import logging
import os

from src.models.schemas import (
    ClassifyResponse,
    DocumentType,
    ExtractedField,
    ExtractResponse,
    FIELD_SCHEMAS,
)
from src.models.providers import get_provider
from src.confidence.scorer import compute_confidence

logger = logging.getLogger(__name__)


async def classify_document(s3_key: str) -> ClassifyResponse:
    """Classify a document type using the configured LLM provider."""
    document_text = await _get_document_text(s3_key)
    provider = get_provider()

    prompt = f"""Classify this financial document into exactly one of these categories:
- CAPITAL_CALL: A capital contribution notice from a fund to an investor
- DISTRIBUTION: A distribution notice from a fund to an investor
- NAV_STATEMENT: A net asset value statement or quarterly report with holdings values
- K1: A Schedule K-1 tax document from a partnership
- FUND_REPORT: A general fund performance or investor update report

Document content:
{document_text[:4000]}

Respond with valid JSON only, no markdown fences:
{{"document_type": "<TYPE>", "confidence": <0.0-1.0>}}"""

    try:
        text = await provider.chat(prompt, max_tokens=200)
        text = _extract_json(text)
        data = json.loads(text)

        doc_type = data.get("document_type", "UNKNOWN")
        confidence = float(data.get("confidence", 0.5))

        if doc_type not in [dt.value for dt in DocumentType]:
            doc_type = "UNKNOWN"

        return ClassifyResponse(documentType=doc_type, confidence=confidence)

    except Exception:
        logger.exception("Classification failed for %s", s3_key)
        return ClassifyResponse(documentType="UNKNOWN", confidence=0.0)


async def extract_document(s3_key: str, document_type: str) -> ExtractResponse:
    """Extract structured fields using the configured LLM provider."""
    document_text = await _get_document_text(s3_key)
    provider = get_provider()
    field_schema = FIELD_SCHEMAS.get(document_type, [])

    if field_schema:
        return await _extract_with_schema(provider, document_text, document_type, field_schema, s3_key)
    else:
        return await _extract_discovery(provider, document_text, document_type, s3_key)


async def _extract_with_schema(
    provider, document_text: str, document_type: str, field_schema: list[dict], s3_key: str,
) -> ExtractResponse:
    """Schema-guided extraction: extract specific fields defined in the schema."""
    fields_desc = "\n".join(
        f"- {f['key']}: {f['label']} (type: {f['field_type']})" for f in field_schema
    )

    prompt = f"""Extract the following fields from this {document_type.replace('_', ' ').lower()} document.

Fields to extract:
{fields_desc}

Document content:
{document_text[:12000]}

For each field, provide:
- key: the field key exactly as listed above
- value: the extracted value as a string (use the EXACT numbers/text from the document)
- confidence: your confidence (0.0-1.0) that this value is correct

IMPORTANT: Only include fields where you found actual values in the document.
Do NOT include fields with null, None, N/A, or empty values.
For monetary values, include the number only (no currency symbols). If the document uses a non-USD currency, note the currency in the value (e.g. "1,731,182 VND").

Respond with valid JSON only, no markdown fences:
{{"fields": [{{"key": "...", "value": "...", "confidence": 0.95}}, ...]}}"""

    try:
        text = await provider.chat(prompt, max_tokens=2000)
        text = _extract_json(text)
        data = json.loads(text)
        raw_fields = data.get("fields", [])

        schema_lookup = {f["key"]: f for f in field_schema}
        extracted: list[ExtractedField] = []

        for rf in raw_fields:
            key = rf.get("key", "")
            schema_field = schema_lookup.get(key)
            if not schema_field:
                continue

            value = str(rf.get("value", ""))
            if not value.strip() or value.lower() in ("none", "null", "n/a", "not found", "not available", ""):
                continue

            conf = compute_confidence(
                rf.get("confidence", 0.5),
                value,
                schema_field["field_type"],
            )

            extracted.append(
                ExtractedField(
                    key=key,
                    label=schema_field["label"],
                    value=value,
                    confidence=conf,
                    field_type=schema_field["field_type"],
                )
            )

        overall = sum(f.confidence for f in extracted) / len(extracted) if extracted else 0.0

        return ExtractResponse(
            fields=extracted,
            documentType=document_type,
            overallConfidence=round(overall, 3),
        )

    except Exception:
        logger.exception("Schema extraction failed for %s", s3_key)
        return ExtractResponse(fields=[], documentType=document_type, overallConfidence=0.0)


async def _extract_discovery(
    provider, document_text: str, document_type: str, s3_key: str,
) -> ExtractResponse:
    """Discovery extraction for unknown/unschema'd types. LLM identifies the relevant fields."""
    prompt = f"""You are a financial document analyst. This document was classified as: {document_type.replace('_', ' ')}.

Analyze this document and extract ALL key financial data points you can identify.
For each value, choose the most appropriate field type from: money, date, text, percentage.

Document content:
{document_text[:12000]}

Return a JSON array of extracted fields. Each field should have:
- key: a snake_case identifier (e.g. "total_revenue", "fund_name")
- label: a human-readable label (e.g. "Total Revenue", "Fund Name")
- value: the extracted value as a string
- confidence: your confidence (0.0-1.0)
- field_type: one of "money", "date", "text", "percentage"

Focus on the most important financial metrics: names, dates, amounts, returns, valuations.
Limit to the 15 most important fields. Order by importance.

Respond with valid JSON only, no markdown fences:
{{"fields": [{{"key": "...", "label": "...", "value": "...", "confidence": 0.9, "field_type": "money"}}, ...]}}"""

    try:
        text = await provider.chat(prompt, max_tokens=3000)
        text = _extract_json(text)
        data = json.loads(text)
        raw_fields = data.get("fields", [])

        valid_types = {"money", "date", "text", "percentage", "routing_number", "ein"}
        extracted: list[ExtractedField] = []

        for rf in raw_fields[:15]:
            ft = rf.get("field_type", "text")
            if ft not in valid_types:
                ft = "text"

            value = str(rf.get("value", ""))
            if not value.strip():
                continue

            conf = compute_confidence(
                rf.get("confidence", 0.5),
                value,
                ft,
            )

            extracted.append(
                ExtractedField(
                    key=rf.get("key", f"field_{len(extracted)}"),
                    label=rf.get("label", rf.get("key", "Unknown")),
                    value=value,
                    confidence=conf,
                    field_type=ft,
                )
            )

        overall = sum(f.confidence for f in extracted) / len(extracted) if extracted else 0.0

        return ExtractResponse(
            fields=extracted,
            documentType=document_type,
            overallConfidence=round(overall, 3),
        )

    except Exception:
        logger.exception("Discovery extraction failed for %s", s3_key)
        return ExtractResponse(fields=[], documentType=document_type, overallConfidence=0.0)


def _extract_json(text: str) -> str:
    """Robustly extract JSON from LLM response, handling markdown fences."""
    text = text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts[1:]:
            cleaned = part.strip()
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            if cleaned.startswith("{") or cleaned.startswith("["):
                return cleaned
    if text.startswith("{") or text.startswith("["):
        return text
    start = text.find("{")
    if start != -1:
        return text[start:]
    return text


async def _get_document_text(s3_key: str) -> str:
    """
    Retrieve document text. Priority:
    1. S3/MinIO download + PDF parse
    2. Local file at /tmp/documents/<s3_key>
    3. Placeholder for testing
    """
    from src.storage.s3 import download_bytes, file_exists
    from src.storage.pdf import extract_text

    try:
        if await file_exists(s3_key):
            pdf_bytes = await download_bytes(s3_key)
            text = extract_text(pdf_bytes, s3_key)
            if text.strip():
                return text
            logger.warning("Empty text extracted from %s", s3_key)
    except Exception:
        logger.warning("S3 download failed for %s, trying local fallback", s3_key)

    local_path = os.path.join("/tmp/documents", s3_key)
    if os.path.exists(local_path):
        with open(local_path, "r", errors="replace") as f:
            return f.read()

    return f"[Document at {s3_key} — upload via API or place in /tmp/documents/]"

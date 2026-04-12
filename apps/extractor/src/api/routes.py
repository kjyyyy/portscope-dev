from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from src.models.schemas import ClassifyRequest, ClassifyResponse, ExtractRequest, ExtractResponse
from src.extractors.router import classify_document, extract_document
from src.storage.s3 import upload_bytes, generate_presigned_url

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest) -> ClassifyResponse:
    """Classify a document by type (CAPITAL_CALL, DISTRIBUTION, etc.)."""
    try:
        result = await classify_document(request.s3_key)
        return result
    except Exception as e:
        logger.exception("Classification failed for %s", request.s3_key)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract", response_model=ExtractResponse)
async def extract(request: ExtractRequest) -> ExtractResponse:
    """Extract structured fields from a document."""
    try:
        result = await extract_document(request.s3_key, request.document_type)
        return result
    except Exception as e:
        logger.exception("Extraction failed for %s", request.s3_key)
        raise HTTPException(status_code=500, detail=str(e))


class UploadResponse(BaseModel):
    s3_key: str
    file_name: str
    presigned_url: str


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload a document to S3/MinIO and return its key."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "pdf"
    s3_key = f"uploads/{uuid.uuid4().hex[:12]}/{file.filename}"

    try:
        data = await file.read()
        await upload_bytes(s3_key, data, content_type=file.content_type or "application/pdf")
        url = await generate_presigned_url(s3_key)
        return UploadResponse(s3_key=s3_key, file_name=file.filename, presigned_url=url)
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")


class ClassifyAndExtractResponse(BaseModel):
    s3_key: str
    classify: ClassifyResponse
    extract: ExtractResponse


@router.post("/process", response_model=ClassifyAndExtractResponse)
async def process_document(file: UploadFile = File(...)):
    """Upload, classify, and extract in one call. Great for testing."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    s3_key = f"uploads/{uuid.uuid4().hex[:12]}/{file.filename}"

    try:
        data = await file.read()
        await upload_bytes(s3_key, data, content_type=file.content_type or "application/pdf")
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    classification = await classify_document(s3_key)
    extraction = await extract_document(s3_key, classification.document_type.value if hasattr(classification.document_type, 'value') else str(classification.document_type))

    return ClassifyAndExtractResponse(
        s3_key=s3_key,
        classify=classification,
        extract=extraction,
    )

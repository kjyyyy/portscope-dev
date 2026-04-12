from __future__ import annotations

import io
import logging
import os
from typing import Optional

import boto3
from botocore.config import Config as BotoConfig

logger = logging.getLogger(__name__)

_client = None


def get_s3_client():
    """Get or create an S3 client configured for MinIO (local) or real S3."""
    global _client
    if _client is not None:
        return _client

    endpoint = os.environ.get("S3_ENDPOINT", "http://localhost:9000")
    access_key = os.environ.get("S3_ACCESS_KEY", "minioadmin")
    secret_key = os.environ.get("S3_SECRET_KEY", "minioadmin")
    region = os.environ.get("S3_REGION", "us-east-1")

    _client = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        config=BotoConfig(signature_version="s3v4"),
    )
    return _client


def get_bucket() -> str:
    return os.environ.get("S3_BUCKET", "portscope-documents")


async def download_bytes(s3_key: str) -> bytes:
    """Download a file from S3/MinIO and return raw bytes."""
    client = get_s3_client()
    buf = io.BytesIO()
    client.download_fileobj(get_bucket(), s3_key, buf)
    buf.seek(0)
    return buf.read()


async def upload_bytes(s3_key: str, data: bytes, content_type: str = "application/pdf") -> str:
    """Upload bytes to S3/MinIO. Returns the s3_key."""
    client = get_s3_client()
    client.put_object(
        Bucket=get_bucket(),
        Key=s3_key,
        Body=data,
        ContentType=content_type,
    )
    return s3_key


async def generate_presigned_url(s3_key: str, expires_in: int = 3600) -> str:
    """Generate a presigned URL for downloading a file."""
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": get_bucket(), "Key": s3_key},
        ExpiresIn=expires_in,
    )


async def file_exists(s3_key: str) -> bool:
    """Check if a file exists in S3/MinIO."""
    try:
        client = get_s3_client()
        client.head_object(Bucket=get_bucket(), Key=s3_key)
        return True
    except Exception:
        return False

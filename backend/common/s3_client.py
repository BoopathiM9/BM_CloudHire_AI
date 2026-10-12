"""
Amazon S3 Client for AI Resume Matcher
Provides presigned upload URLs and secure document retrieval.
"""

import boto3
from botocore.exceptions import ClientError
import os

BUCKET_NAME = os.environ.get("S3_BUCKET", "resume-matcher-384875139605")
REGION = os.environ.get("AWS_REGION", "us-east-1")

s3_client = boto3.client("s3", region_name=REGION)

class S3Service:
    def __init__(self, bucket_name=BUCKET_NAME):
        self.bucket = bucket_name

    def generate_presigned_upload_url(self, object_key: str, expiration_seconds: int = 300) -> dict:
        """
        Generates a short-lived presigned URL so the web client can directly
        and securely upload resumes to private S3 without passing bytes through Lambda.
        """
        try:
            url = s3_client.generate_presigned_url(
                ClientMethod="put_object",
                Params={
                    "Bucket": self.bucket,
                    "Key": object_key,
                    "ContentType": "application/pdf" if object_key.endswith(".pdf") else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                },
                ExpiresIn=expiration_seconds
            )
            return {"uploadUrl": url, "key": object_key, "bucket": self.bucket}
        except ClientError as e:
            raise RuntimeError(f"Error generating presigned S3 upload URL: {e}")

    def download_file_bytes(self, object_key: str) -> bytes:
        """Downloads document bytes for Lambda in-memory parsing."""
        try:
            response = s3_client.get_object(Bucket=self.bucket, Key=object_key)
            return response["Body"].read()
        except ClientError as e:
            raise RuntimeError(f"Error reading S3 object {object_key}: {e}")

    def upload_file_bytes(self, object_key: str, data: bytes, content_type: str = "text/plain") -> str:
        """Uploads files (e.g. KB skill taxonomy reference documents)."""
        s3_client.put_object(
            Bucket=self.bucket,
            Key=object_key,
            Body=data,
            ContentType=content_type
        )
        return f"s3://{self.bucket}/{object_key}"

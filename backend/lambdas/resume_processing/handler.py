"""
ResumeProcessingLambda: Handler for Job Requisitions & Resume Processing
AWS Lambda Entrypoint
"""

import json
import os
import sys
import re
from datetime import datetime

# Add common to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from common.ddb_client import DynamoDBService
from common.s3_client import S3Service
from lambdas.resume_processing.parser import parse_document, DocumentParserError

ddb_service = DynamoDBService()
s3_service = S3Service()

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o % 1 == 0 else float(o)
        return super().default(o)

def build_response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder)
    }

def extract_profile_heuristic(raw_text: str, filename: str) -> dict:
    """
    Lightweight heuristic fallback profile extractor (Bedrock integration in Phase 5).
    Extracts name, email, common technical skills, experience years, and certifications.
    """
    # 1. Email extraction
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
    email = email_match.group(0) if email_match else ""

    # 2. Name extraction (from filename or first line)
    name = filename.rsplit(".", 1)[0].replace("_", " ").replace("-", " ")
    name = " ".join([word.capitalize() for word in name.split() if word.lower() not in ["resume", "cv", "profile", "final"]])
    if not name:
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        name = lines[0][:40] if lines else "Candidate"

    # 3. Known skills catalog match
    known_skills = [
        "Python", "AWS Lambda", "DynamoDB", "React", "API Gateway", "Docker", "Kubernetes",
        "Terraform", "CI/CD", "Amazon Bedrock", "LangChain", "Vector Databases", "FastAPI",
        "TypeScript", "JavaScript", "SQL", "PostgreSQL", "CloudWatch", "Linux", "AWS CDK"
    ]
    detected_skills = []
    lower_text = raw_text.lower()
    for skill in known_skills:
        if skill.lower() in lower_text:
            detected_skills.append(skill)
    if not detected_skills:
        detected_skills = ["Python", "AWS", "Cloud Fundamentals"]

    # 4. Years of experience pattern match
    exp_match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience", lower_text)
    experience_years = int(exp_match.group(1)) if exp_match else 3

    # 5. Certifications
    certs = []
    if "aws certified" in lower_text:
        certs.append("AWS Certified Solutions Architect")
    if "cka" in lower_text or "kubernetes" in lower_text:
        certs.append("Certified Kubernetes Administrator")

    return {
        "name": name,
        "email": email,
        "experienceYears": experience_years,
        "skills": detected_skills,
        "projects": ["Production Cloud Application Delivery"],
        "certifications": certs,
        "education": "Bachelor's Degree in Computer Science or related"
    }

def lambda_handler(event, context):
    """
    Main entry point for ResumeProcessingLambda
    """
    # Handle CORS preflight
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
    if http_method == "OPTIONS":
        return build_response(200, {"message": "CORS preflight OK"})

    raw_path = event.get("path") or event.get("rawPath") or ""
    # Normalize path (remove stage prefix if present)
    path = "/" + "/".join([seg for seg in raw_path.split("/") if seg and seg not in ("prod", "dev", "staging")])

    try:
        body = {}
        if event.get("body"):
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]

        # ---------------- ROUTING ----------------
        # 1. GET /jobs
        if http_method == "GET" and (path == "/jobs" or path == ""):
            jobs = ddb_service.list_jobs()
            return build_response(200, {"jobs": jobs, "count": len(jobs)})

        # 2. POST /jobs
        if http_method == "POST" and path == "/jobs":
            if not body.get("title") or not body.get("description"):
                return build_response(400, {"error": "Missing required fields: title, description"})
            saved_job = ddb_service.save_job(body)
            return build_response(201, {"message": "Job created successfully", "job": saved_job})

        # 3. GET /jobs/{jobId}
        if http_method == "GET" and path.startswith("/jobs/"):
            job_id = path.split("/jobs/")[-1]
            job = ddb_service.get_job(job_id)
            if not job:
                return build_response(404, {"error": f"Job {job_id} not found"})
            return build_response(200, {"job": job})

        # 4. POST /resumes/presigned-url
        if http_method == "POST" and path == "/resumes/presigned-url":
            filename = body.get("filename")
            if not filename:
                return build_response(400, {"error": "Missing filename parameter"})
            cand_id = f"CAN-{int(datetime.utcnow().timestamp() * 1000) % 100000:04d}"
            s3_key = f"resumes/{cand_id}/{filename}"
            presigned = s3_service.generate_presigned_upload_url(s3_key, expiration_seconds=600)
            return build_response(200, {
                "candidateId": cand_id,
                "s3Key": s3_key,
                "uploadUrl": presigned["uploadUrl"],
                "bucket": presigned["bucket"]
            })

        # 5. POST /resumes/process
        if http_method == "POST" and path == "/resumes/process":
            s3_key = body.get("s3Key")
            filename = body.get("filename", s3_key.split("/")[-1] if s3_key else "resume.pdf")
            cand_id = body.get("candidateId") or f"CAN-{int(datetime.utcnow().timestamp() * 1000) % 100000:04d}"

            if not s3_key:
                return build_response(400, {"error": "Missing s3Key parameter"})

            # Download document from S3
            try:
                file_bytes = s3_service.download_file_bytes(s3_key)
            except Exception as e:
                return build_response(404, {"error": f"Failed to download file from S3: {e}"})

            # Parse document
            try:
                extracted_text, sha256_hash = parse_document(filename, file_bytes)
            except DocumentParserError as e:
                return build_response(422, {"error": f"Document parsing failed: {e}"})

            # Check for duplicate hash in existing pool
            all_cands = ddb_service.get_available_candidates()
            for existing in all_cands:
                if existing.get("resumeHash") == sha256_hash:
                    return build_response(409, {
                        "error": f"The resume is already uploaded! Matches candidate {existing.get('name')} ({existing.get('candidateId')}).",
                        "duplicateCandidateId": existing.get("candidateId")
                    })

            # Extract profile
            profile = extract_profile_heuristic(extracted_text, filename)
            profile["candidateId"] = cand_id
            profile["filename"] = filename
            profile["s3Key"] = s3_key
            profile["resumeHash"] = sha256_hash

            # Save into DynamoDB
            saved_candidate = ddb_service.save_candidate_profile(profile)
            return build_response(201, {
                "message": "Resume parsed and profile saved successfully",
                "candidate": saved_candidate
            })

        # 6. GET /candidates
        if http_method == "GET" and path == "/candidates":
            status_filter = event.get("queryStringParameters", {}).get("status", "AVAILABLE") if event.get("queryStringParameters") else "AVAILABLE"
            if status_filter == "AVAILABLE":
                candidates = ddb_service.get_available_candidates()
            else:
                # Scan table for candidates
                candidates = ddb_service.get_available_candidates() # Default
            return build_response(200, {"candidates": candidates, "count": len(candidates)})

        return build_response(404, {"error": f"Route not found: {http_method} {path}"})

    except Exception as e:
        return build_response(500, {"error": f"Internal Server Error: {str(e)}"})

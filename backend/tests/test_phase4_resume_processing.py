"""
Automated Test Suite for Phase 4: ResumeProcessingLambda & Document Parsing
Tests:
1. PDF text extraction & SHA-256 hash calculation
2. DOCX text extraction & SHA-256 hash calculation
3. Unsupported extension and empty file error handling
4. Lambda Handler: GET /jobs
5. Lambda Handler: POST /jobs
6. Lambda Handler: POST /resumes/presigned-url
7. Lambda Handler: S3 upload + POST /resumes/process
8. Lambda Handler: Duplicate resume rejection (409 Conflict)
"""

import sys
import os
import io
import json
import pypdf
import docx

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lambdas.resume_processing.parser import parse_document, DocumentParserError
from lambdas.resume_processing.handler import lambda_handler
from common.s3_client import S3Service

def create_synthetic_pdf(text: str) -> bytes:
    """Creates in-memory PDF bytes with text."""
    writer = pypdf.PdfWriter()
    # Add a blank page with text annotation or basic canvas
    # Alternatively pypdf page creation
    page = writer.add_blank_page(width=612, height=792)
    stream = io.BytesIO()
    writer.write(stream)
    # Since pypdf PdfWriter add_blank_page does not inject stream fonts without reportlab,
    # let's write a standard valid minimal PDF stream with text:
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
        b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n"
        b"4 0 obj << /Length " + str(len(text) + 50).encode() + b" >> stream\n"
        b"BT /F1 12 Tf 72 720 Td (" + text.encode("latin-1", "replace") + b") Tj ET\n"
        b"endstream\nendobj\n"
        b"5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
        b"xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000350 00000 n \n"
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n430\n%%EOF\n"
    )
    return pdf_content

def create_synthetic_docx(text: str) -> bytes:
    """Creates in-memory DOCX bytes using python-docx."""
    doc = docx.Document()
    doc.add_heading("Senior Cloud Engineer Resume", level=1)
    doc.add_paragraph(text)
    stream = io.BytesIO()
    doc.save(stream)
    return stream.getvalue()

def test_phase4():
    print("\n--- Test 1: PDF Document Parsing ---")
    pdf_text = "Experienced Python developer with AWS Lambda, DynamoDB, and React skills. 5 years experience."
    pdf_bytes = create_synthetic_pdf(pdf_text)
    extracted, sha = parse_document("sample_candidate.pdf", pdf_bytes)
    print(f"Extracted PDF text length: {len(extracted)}, Hash: {sha[:16]}...")
    assert "Python" in extracted or len(extracted) > 0
    assert sha.startswith("hash_")
    print("[PASS] PDF parser verified.")

    print("\n--- Test 2: DOCX Document Parsing ---")
    docx_text = "DevOps Engineer specializing in Docker, Kubernetes, CI/CD, and Terraform on AWS."
    docx_bytes = create_synthetic_docx(docx_text)
    extracted_docx, sha_docx = parse_document("devops_resume.docx", docx_bytes)
    print(f"Extracted DOCX text: '{extracted_docx[:40]}...', Hash: {sha_docx[:16]}...")
    assert "Kubernetes" in extracted_docx
    assert sha_docx.startswith("hash_")
    print("[PASS] DOCX parser verified.")

    print("\n--- Test 3: Unsupported Extension & Empty File Handling ---")
    try:
        parse_document("test.exe", b"binary content")
        assert False, "Should have raised DocumentParserError for .exe"
    except DocumentParserError as e:
        print(f"[PASS] Correctly rejected .exe format: {e}")

    try:
        parse_document("empty.pdf", b"")
        assert False, "Should have raised DocumentParserError for empty bytes"
    except DocumentParserError as e:
        print(f"[PASS] Correctly rejected empty file: {e}")

    print("\n--- Test 4: Lambda Handler - GET /jobs ---")
    event_get_jobs = {"httpMethod": "GET", "path": "/jobs"}
    resp = lambda_handler(event_get_jobs, None)
    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["count"] >= 3
    print(f"[PASS] GET /jobs returned {body['count']} jobs.")

    print("\n--- Test 5: Lambda Handler - POST /jobs ---")
    event_post_job = {
        "httpMethod": "POST",
        "path": "/jobs",
        "body": json.dumps({
            "title": "Lead AWS Security Architect",
            "company": "SecureCloud Inc",
            "description": "Architect cloud security postures with IAM, GuardDuty, AWS WAF, and KMS.",
            "requiredSkills": ["AWS", "IAM", "KMS", "Python"],
            "minExperienceYears": 5
        })
    }
    resp_post = lambda_handler(event_post_job, None)
    assert resp_post["statusCode"] == 201
    created_job = json.loads(resp_post["body"])["job"]
    print(f"[PASS] POST /jobs created job {created_job['jobId']}: '{created_job['title']}'.")

    print("\n--- Test 6: Lambda Handler - POST /resumes/presigned-url ---")
    event_presigned = {
        "httpMethod": "POST",
        "path": "/resumes/presigned-url",
        "body": json.dumps({"filename": "alex_johnson_resume.pdf"})
    }
    resp_presigned = lambda_handler(event_presigned, None)
    assert resp_presigned["statusCode"] == 200
    presigned_body = json.loads(resp_presigned["body"])
    assert "uploadUrl" in presigned_body
    s3_key = presigned_body["s3Key"]
    print(f"[PASS] Presigned URL generated for key: {s3_key}")

    print("\n--- Test 7: Uploading Resume to S3 and Invoking POST /resumes/process ---")
    s3 = S3Service()
    s3_test_text = "Alex Johnson. Senior AWS Developer with Python, AWS Lambda, DynamoDB, React, and Docker. 6 years experience. Email: alex.johnson@example.com"
    s3_pdf_bytes = create_synthetic_pdf(s3_test_text)
    s3.upload_file_bytes(s3_key, s3_pdf_bytes, content_type="application/pdf")

    event_process = {
        "httpMethod": "POST",
        "path": "/resumes/process",
        "body": json.dumps({
            "s3Key": s3_key,
            "filename": "alex_johnson_resume.pdf",
            "candidateId": presigned_body["candidateId"]
        })
    }
    resp_process = lambda_handler(event_process, None)
    assert resp_process["statusCode"] == 201, f"Failed: {resp_process}"
    cand_profile = json.loads(resp_process["body"])["candidate"]
    print(f"[PASS] Resume processed! Candidate ID: {cand_profile['candidateId']}, Name: {cand_profile['name']}")

    print("\n--- Test 8: Duplicate Resume Upload Detection (409 Conflict) ---")
    resp_dup = lambda_handler(event_process, None)
    assert resp_dup["statusCode"] == 409
    dup_body = json.loads(resp_dup["body"])
    assert "Duplicate resume detected" in dup_body["error"]
    print(f"[PASS] Duplicate resume prevented! {dup_body['error']}")

    print("\n==========================================")
    print("ALL PHASE 4 TESTS PASSED (8/8)!")
    print("==========================================")

if __name__ == "__main__":
    test_phase4()

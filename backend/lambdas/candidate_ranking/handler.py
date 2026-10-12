"""
CandidateRankingLambda: Handler for Candidate Ranking & Atomic Assignments
Enforces strict backend exclusion rule: Never reuse assigned candidates.
"""

import json
import os
import sys
from decimal import Decimal
from datetime import datetime

# Add common to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from common.ddb_client import DynamoDBService
from common.scorer import CandidateScorer
from common.knowledge_base import KnowledgeBaseService
from common.bedrock_service import BedrockAnalysisService

ddb_service = DynamoDBService()
scorer = CandidateScorer()
kb_service = KnowledgeBaseService()
bedrock_service = BedrockAnalysisService()

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
}

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

def lambda_handler(event, context):
    """
    Main entry point for CandidateRankingLambda
    """
    # Handle CORS preflight
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
    if http_method == "OPTIONS":
        return build_response(200, {"message": "CORS preflight OK"})

    raw_path = event.get("path") or event.get("rawPath") or ""
    path = "/" + "/".join([seg for seg in raw_path.split("/") if seg and seg not in ("prod", "dev", "staging")])

    try:
        body = {}
        if event.get("body"):
            body = json.loads(event["body"]) if isinstance(event["body"], str) else event["body"]

        # ---------------- ROUTING ----------------
        # 1. GET /ranking?jobId=JOB-101 or POST /ranking
        if path == "/ranking" or path.startswith("/ranking"):
            params = event.get("queryStringParameters") or {}
            job_id = params.get("jobId") or body.get("jobId")
            if not job_id:
                return build_response(400, {"error": "Missing jobId parameter"})

            # Fetch job details
            job = ddb_service.get_job(job_id)
            if not job:
                return build_response(404, {"error": f"Job {job_id} not found"})

            # CRITICAL BACKEND EXCLUSION: Query ONLY available candidates via DynamoDB GSI1
            available_candidates = ddb_service.get_available_candidates()
            total_eligible = len(available_candidates)

            if total_eligible == 0:
                return build_response(200, {
                    "jobId": job_id,
                    "jobTitle": job.get("title"),
                    "topThree": [],
                    "remaining": [],
                    "availableCount": 0,
                    "message": "No available candidates remaining in pool."
                })

            # Retrieve competency grounding context
            grounding = kb_service.get_grounding_context(job.get("title", ""), job.get("requiredSkills", []))

            # Score each available candidate
            evaluated = []
            for candidate in available_candidates:
                evidence = bedrock_service.evaluate_candidate(candidate, job, grounding)
                score_data = scorer.calculate_score(candidate, job, evidence)
                evaluated.append(score_data)

            # Sort descending by totalScore
            evaluated.sort(key=lambda x: x["totalScore"], reverse=True)

            # Split into Top 3 and Remaining
            top_three = evaluated[:3]
            remaining = evaluated[3:]

            return build_response(200, {
                "jobId": job_id,
                "jobTitle": job.get("title"),
                "totalEligible": total_eligible,
                "topThree": top_three,
                "remaining": remaining,
                "availableCount": total_eligible
            })

        # 2. POST /assignments - Confirm Recruiter Selection
        if http_method == "POST" and path == "/assignments":
            job_id = body.get("jobId")
            candidate_ids = body.get("candidateIds", [])

            if not job_id or not candidate_ids:
                return build_response(400, {"error": "Missing jobId or candidateIds list"})

            job = ddb_service.get_job(job_id)
            job_title = job.get("title") if job else job_id

            confirmed_assignments = []
            failed_assignments = []

            for cand_id in candidate_ids:
                try:
                    # Enforces DynamoDB conditional write: availabilityStatus = 'AVAILABLE'
                    ddb_service.assign_candidate(cand_id, job_id, job_title)
                    confirmed_assignments.append(cand_id)
                except ValueError as ve:
                    # Candidate was already assigned or concurrently claimed
                    failed_assignments.append({"candidateId": cand_id, "reason": str(ve)})
                except Exception as e:
                    failed_assignments.append({"candidateId": cand_id, "reason": str(e)})

            # Query new available pool count
            remaining_available = ddb_service.get_available_candidates()

            return build_response(200, {
                "message": f"Successfully confirmed assignment for {len(confirmed_assignments)} candidate(s).",
                "confirmedCandidateIds": confirmed_assignments,
                "failedCandidateIds": failed_assignments,
                "jobId": job_id,
                "jobTitle": job_title,
                "newAvailableCandidateCount": len(remaining_available)
            })

        # 3. GET /assignments - Assignment Ledger & Audit Trail
        if http_method == "GET" and path == "/assignments":
            # Scan for assignment records
            from boto3.dynamodb.conditions import Attr
            response = ddb_service.table.scan(
                FilterExpression=Attr("PK").begins_with("ASSIGNMENT#")
            )
            assignments = response.get("Items", [])
            # Sort newest first
            assignments.sort(key=lambda x: x.get("assignedAt", ""), reverse=True)
            return build_response(200, {"assignments": assignments, "count": len(assignments)})

        # 4. POST /assignments/cancel - Release Candidate Back to Pool
        if http_method == "POST" and (path == "/assignments/cancel" or path == "/assignments/release"):
            candidate_id = body.get("candidateId")
            assignment_sk = body.get("assignmentSk")

            if not candidate_id or not assignment_sk:
                return build_response(400, {"error": "Missing candidateId or assignmentSk"})

            ddb_service.release_candidate_assignment(candidate_id, assignment_sk)
            new_pool = ddb_service.get_available_candidates()

            return build_response(200, {
                "message": f"Candidate {candidate_id} released and returned to available pool.",
                "candidateId": candidate_id,
                "newAvailableCandidateCount": len(new_pool)
            })

        return build_response(404, {"error": f"Route not found: {http_method} {path}"})

    except Exception as e:
        return build_response(500, {"error": f"Internal Server Error: {str(e)}"})

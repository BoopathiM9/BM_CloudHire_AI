"""
Automated Test Suite for Phase 5: Bedrock Analysis, Scoring & Knowledge Base Grounding
Tests:
1. Syncing Knowledge Base reference documents to S3
2. Competency grounding context retrieval
3. Bedrock inference on Amazon Nova Micro
4. 100-point transparent rubric scoring (high vs low candidates)
5. Custom rubric weight normalization
6. Persisting match evaluation into DynamoDB
"""

import sys
import os
import json

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from common.knowledge_base import KnowledgeBaseService
from common.bedrock_service import BedrockAnalysisService
from common.scorer import CandidateScorer
from common.ddb_client import DynamoDBService

def test_phase5():
    kb = KnowledgeBaseService()
    bedrock = BedrockAnalysisService()
    scorer = CandidateScorer()
    ddb = DynamoDBService()

    print("\n--- Test 1: Syncing Knowledge Base Reference Documents to S3 ---")
    uploaded_keys = kb.sync_reference_docs_to_s3()
    print(f"Uploaded {len(uploaded_keys)} competency reference documents to S3: {uploaded_keys}")
    assert len(uploaded_keys) >= 3, "Expected at least 3 reference documents"
    print("[PASS] Knowledge Base documents synced to private S3.")

    print("\n--- Test 2: Competency Grounding Context Retrieval ---")
    grounding = kb.get_grounding_context("Senior Cloud Architect", ["Python", "AWS Lambda", "DynamoDB"])
    assert "AWS Lambda" in grounding or "Serverless" in grounding
    assert "SCORING GUIDELINES" in grounding
    print(f"[PASS] Retrieved {len(grounding)} chars of competency grounding context.")

    print("\n--- Test 3: Amazon Bedrock Foundation Model Invocation ---")
    test_candidate = {
        "candidateId": "CAN-001",
        "name": "Arun Krishnan",
        "experienceYears": 6,
        "skills": ["Python", "AWS Lambda", "DynamoDB", "React", "API Gateway", "Docker", "AWS CDK"],
        "projects": ["Serverless E-Commerce Portal on AWS", "Real-Time Telemetry Dashboard with React"],
        "certifications": ["AWS Certified Solutions Architect Associate"],
        "education": "B.Tech in Computer Science, IIT Madras"
    }

    test_job = {
        "jobId": "JOB-101",
        "title": "Senior Full-Stack AWS Developer",
        "requiredSkills": ["Python", "AWS Lambda", "DynamoDB", "React", "API Gateway"],
        "preferredSkills": ["Docker", "TypeScript", "AWS CDK"],
        "minExperienceYears": 4,
        "description": "Building serverless microservices with AWS Lambda, DynamoDB, and React."
    }

    evidence = bedrock.evaluate_candidate(test_candidate, test_job, grounding)
    print(f"Bedrock Evidence Extracted: Matched={evidence['matched_required_skills']}, Missing={evidence['missing_required_skills']}")
    print(f"Recruiter Justification: {evidence['recruiter_justification']}")
    assert len(evidence["matched_required_skills"]) >= 3
    assert "recruiter_justification" in evidence and len(evidence["recruiter_justification"]) > 10
    print("[PASS] Amazon Bedrock inference successful.")

    print("\n--- Test 4: 100-Point Transparent Rubric Scoring ---")
    score_result = scorer.calculate_score(test_candidate, test_job, evidence)
    print(f"Candidate {score_result['candidateName']} Total Score: {score_result['totalScore']}/100")
    print(f"Breakdown: {score_result['breakdown']}")
    assert 80 <= score_result["totalScore"] <= 100, f"Expected high score for strong match, got {score_result['totalScore']}"
    print("[PASS] Highly matched candidate scored in top bracket (80-100).")

    # Evaluate weak candidate
    weak_candidate = {
        "candidateId": "CAN-012",
        "name": "Gautam Ghosh",
        "experienceYears": 2,
        "skills": ["Django", "PostgreSQL", "Git"],
        "projects": ["Content Management Platform"],
        "certifications": [],
        "education": "B.Tech in IT"
    }
    weak_evidence = bedrock.evaluate_candidate(weak_candidate, test_job, grounding)
    weak_score = scorer.calculate_score(weak_candidate, test_job, weak_evidence)
    print(f"Weak candidate {weak_score['candidateName']} Total Score: {weak_score['totalScore']}/100")
    assert weak_score["totalScore"] < 55, f"Expected low score for weak match, got {weak_score['totalScore']}"
    assert score_result["totalScore"] > weak_score["totalScore"] + 30
    print("[PASS] Score disparity between strong and weak candidate verified.")

    print("\n--- Test 5: Custom Rubric Normalization ---")
    custom_scorer = CandidateScorer({"required_skills": 50, "experience": 30, "projects": 20})
    assert sum(custom_scorer.weights.values()) == 100
    print("[PASS] Custom rubric weights normalized properly.")

    print("\n--- Test 6: Persisting Match Result to DynamoDB ---")
    ddb.save_match_result(score_result)
    matches_in_ddb = ddb.get_matches_for_job(test_job["jobId"])
    assert len(matches_in_ddb) >= 1
    print(f"[PASS] Match result persisted in DynamoDB! Found {len(matches_in_ddb)} match records for {test_job['jobId']}.")

    print("\n==========================================")
    print("ALL PHASE 5 TESTS PASSED (6/6)!")
    print("==========================================")

if __name__ == "__main__":
    test_phase5()

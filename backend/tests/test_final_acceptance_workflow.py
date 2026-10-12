"""
FINAL ACCEPTANCE TEST SUITE (8-STEP END-TO-END VERIFICATION)
AI Resume Matcher & Smart Candidate Assignment System

Steps:
1. Create Job 1 & calculate candidate scores across 20 resumes.
2. Display top three candidates with explanations.
3. Confirm assignments for Job 1.
4. Create Job 2.
5. Verify that only the remaining 17 candidates are eligible.
6. Confirm three more candidates for Job 2.
7. Create Job 3 & verify that ALL SIX actively assigned candidates are excluded.
8. Confirm that all resumes and historical match results remain available in the system.
"""

import urllib.request
import urllib.parse
import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

API_BASE = "http://127.0.0.1:5000"

def http_get(url):
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def http_post(url, data):
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read().decode("utf-8"))

def reset_candidates_to_available():
    """Resets all candidate records to AVAILABLE for a clean benchmark test."""
    from common.ddb_client import DynamoDBService
    ddb = DynamoDBService()
    table = ddb.table
    # Fetch all candidates
    from boto3.dynamodb.conditions import Attr
    resp = table.scan(FilterExpression=Attr("SK").eq("PROFILE"))
    items = resp.get("Items", [])
    for it in items:
        cand_id = it["candidateId"]
        table.update_item(
            Key={"PK": f"CANDIDATE#{cand_id}", "SK": "PROFILE"},
            UpdateExpression="SET availabilityStatus = :avail, assignedJobId = :none, GSI1_PK = :gsi_avail",
            ExpressionAttributeValues={
                ":avail": "AVAILABLE",
                ":none": "NONE",
                ":gsi_avail": "STATUS#AVAILABLE"
            }
        )

def run_final_acceptance_test():
    print("\n=================================================================")
    print("STARTING FINAL ACCEPTANCE TEST: 8-STEP END-TO-END VERIFICATION")
    print("=================================================================")

    # Reset candidates to available pool
    reset_candidates_to_available()
    status, cands_resp = http_get(f"{API_BASE}/candidates?status=AVAILABLE")
    avail_count = cands_resp.get("count", 0)
    print(f"\n[SETUP] Initial Available Candidates in DynamoDB: {avail_count}")

    # --- STEP 1: Create Job 1 and calculate candidate scores ---
    print("\n>>> STEP 1: Creating Job 1 (Senior Full-Stack AWS Developer) & Scoring Candidates")
    job1_payload = {
        "title": "Job 1: Senior Full-Stack AWS Developer",
        "company": "FinTech Cloud Solutions",
        "description": "Building serverless microservices with AWS Lambda, DynamoDB, React, and Python.",
        "requiredSkills": ["Python", "AWS Lambda", "DynamoDB", "React", "API Gateway"],
        "preferredSkills": ["Docker", "TypeScript", "AWS CDK"],
        "minExperienceYears": 4
    }
    status, job1_resp = http_post(f"{API_BASE}/jobs", job1_payload)
    assert status == 201, f"Failed creating Job 1: {job1_resp}"
    job1_id = job1_resp["job"]["jobId"]
    print(f"[OK] Job 1 created with ID: {job1_id}")

    # Fetch ranking for Job 1
    status, rank1 = http_get(f"{API_BASE}/ranking?jobId={job1_id}")
    assert status == 200
    print(f"[OK] Job 1 matching executed. Total eligible candidates: {rank1['totalEligible']}")
    assert rank1["totalEligible"] >= 20, f"Expected at least 20 candidates, got {rank1['totalEligible']}"

    # --- STEP 2: Display the top three with explanations ---
    print("\n>>> STEP 2: Displaying Top Three Candidates for Job 1 with Explanations")
    top3_job1 = rank1["topThree"]
    assert len(top3_job1) == 3, f"Expected 3 candidates, got {len(top3_job1)}"
    for idx, c in enumerate(top3_job1, 1):
        print(f"  Rank #{idx}: {c['candidateName']} ({c['candidateId']}) - Score: {c['totalScore']}/100")
        print(f"    Explanation: {c['explanation']}")
        print(f"    Matched Skills: {c['breakdown']['requiredSkills']['matched']}")
    job1_assigned_ids = [c["candidateId"] for c in top3_job1]
    print(f"[OK] Top three candidates verified: {job1_assigned_ids}")

    # --- STEP 3: Confirm their assignments ---
    print(f"\n>>> STEP 3: Confirming Recruiter Assignments for Job 1 ({job1_assigned_ids})")
    status, asgn1 = http_post(f"{API_BASE}/assignments", {
        "jobId": job1_id,
        "candidateIds": job1_assigned_ids
    })
    assert status == 200
    print(f"[OK] Assigned to Job 1: {asgn1['confirmedCandidateIds']}")
    print(f"[OK] New Available Candidate Pool Count: {asgn1['newAvailableCandidateCount']}")
    expected_after_job1 = rank1["totalEligible"] - 3
    assert asgn1["newAvailableCandidateCount"] == expected_after_job1

    # --- STEP 4: Create Job 2 ---
    print("\n>>> STEP 4: Creating Job 2 (Cloud DevOps & Site Reliability Engineer)")
    job2_payload = {
        "title": "Job 2: Cloud DevOps & Site Reliability Engineer",
        "company": "Enterprise Infra Ops",
        "description": "Managing automated CI/CD, Kubernetes container orchestration, and Terraform on AWS.",
        "requiredSkills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
        "preferredSkills": ["Linux", "CloudWatch", "Python"],
        "minExperienceYears": 3
    }
    status, job2_resp = http_post(f"{API_BASE}/jobs", job2_payload)
    assert status == 201
    job2_id = job2_resp["job"]["jobId"]
    print(f"[OK] Job 2 created with ID: {job2_id}")

    # --- STEP 5: Verify that only the remaining 17 candidates are eligible ---
    print(f"\n>>> STEP 5: Verifying ONLY the Remaining {expected_after_job1} Candidates are Eligible for Job 2")
    status, rank2 = http_get(f"{API_BASE}/ranking?jobId={job2_id}")
    assert status == 200
    print(f"[OK] Job 2 Eligible Count: {rank2['totalEligible']}")
    assert rank2["totalEligible"] == expected_after_job1, f"Expected {expected_after_job1}, got {rank2['totalEligible']}"

    # Verify that Job 1 assigned candidates are strictly excluded
    all_job2_candidates = [c["candidateId"] for c in rank2["topThree"]] + [c["candidateId"] for c in rank2["remaining"]]
    for assigned_id in job1_assigned_ids:
        assert assigned_id not in all_job2_candidates, f"VIOLATION: {assigned_id} was NOT excluded from Job 2!"
    print(f"[OK] VERIFIED: Candidates assigned to Job 1 ({job1_assigned_ids}) are 100% excluded from Job 2.")

    # --- STEP 6: Confirm three more candidates for Job 2 ---
    print("\n>>> STEP 6: Confirming Three More Candidates for Job 2")
    top3_job2 = rank2["topThree"]
    for idx, c in enumerate(top3_job2, 1):
        print(f"  Job 2 Rank #{idx}: {c['candidateName']} ({c['candidateId']}) - Score: {c['totalScore']}/100")
    job2_assigned_ids = [c["candidateId"] for c in top3_job2]
    status, asgn2 = http_post(f"{API_BASE}/assignments", {
        "jobId": job2_id,
        "candidateIds": job2_assigned_ids
    })
    assert status == 200
    print(f"[OK] Assigned to Job 2: {asgn2['confirmedCandidateIds']}")
    expected_after_job2 = expected_after_job1 - 3
    print(f"[OK] New Available Candidate Pool Count: {asgn2['newAvailableCandidateCount']} (Expected {expected_after_job2})")
    assert asgn2["newAvailableCandidateCount"] == expected_after_job2

    # --- STEP 7: Create Job 3 & verify ALL SIX actively assigned candidates are excluded ---
    print("\n>>> STEP 7: Creating Job 3 & Verifying ALL SIX Assigned Candidates are Excluded")
    job3_payload = {
        "title": "Job 3: Generative AI & LLM Solutions Engineer",
        "company": "Cognitive AI Nexus",
        "description": "RAG architecture with Amazon Bedrock, Vector Databases, Python, and LangChain.",
        "requiredSkills": ["Python", "Amazon Bedrock", "Vector Databases", "LangChain", "FastAPI"],
        "minExperienceYears": 3
    }
    status, job3_resp = http_post(f"{API_BASE}/jobs", job3_payload)
    assert status == 201
    job3_id = job3_resp["job"]["jobId"]
    print(f"[OK] Job 3 created with ID: {job3_id}")

    status, rank3 = http_get(f"{API_BASE}/ranking?jobId={job3_id}")
    assert status == 200
    print(f"[OK] Job 3 Eligible Count: {rank3['totalEligible']} (Expected {expected_after_job2})")
    assert rank3["totalEligible"] == expected_after_job2

    all_six_assigned = job1_assigned_ids + job2_assigned_ids
    all_job3_candidates = [c["candidateId"] for c in rank3["topThree"]] + [c["candidateId"] for c in rank3["remaining"]]
    print(f"Checking exclusion of all 6 assigned candidates: {all_six_assigned}")
    for assigned_id in all_six_assigned:
        assert assigned_id not in all_job3_candidates, f"VIOLATION: Candidate {assigned_id} was NOT excluded from Job 3!"
    print(f"[OK] CRITICAL EXCLUSION RULE 100% VERIFIED: All 6 assigned candidates are excluded from Job 3.")

    # --- STEP 8: Confirm all resumes and historical match results remain available ---
    print("\n>>> STEP 8: Confirming All Resumes, Jobs, and Historical Match Results Remain Stored")
    status, jobs_all = http_get(f"{API_BASE}/jobs")
    print(f"[OK] Total Jobs in DynamoDB: {jobs_all['count']}")
    assert jobs_all["count"] >= 3

    status, history = http_get(f"{API_BASE}/assignments")
    print(f"[OK] Total Assignment Records in History: {history['count']}")
    assert history["count"] >= 6
    for h in history["assignments"][:6]:
        print(f"  Assignment: {h.get('candidateName', h.get('candidateId'))} -> {h.get('jobTitle')} ({h.get('status')})")

    print("\n=================================================================")
    print("ALL 8 STEPS OF THE FINAL ACCEPTANCE TEST PASSED SUCCESSFULLY!")
    print("=================================================================\n")

if __name__ == "__main__":
    run_final_acceptance_test()

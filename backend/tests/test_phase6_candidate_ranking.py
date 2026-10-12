"""
Automated Test Suite for Phase 6: CandidateRankingLambda & Strict Exclusion Rule
Tests:
1. Candidate ranking retrieval for Job 1 (Top 3 + remaining)
2. Confirmation of candidate assignments via DynamoDB conditional writes
3. Verification of strict backend exclusion on Job 2 (Assigned candidates excluded)
4. Verification of concurrent / duplicate assignment prevention
5. Verification of assignment ledger & audit trail
6. Verification of assignment release / rollback back to available pool
"""

import sys
import os
import json

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from lambdas.candidate_ranking.handler import lambda_handler
from common.ddb_client import DynamoDBService

def test_phase6():
    ddb = DynamoDBService()

    print("\n--- Test 1: Fetching Ranking for Job 1 (Senior Full-Stack AWS Developer) ---")
    event_rank_job1 = {
        "httpMethod": "GET",
        "path": "/ranking",
        "queryStringParameters": {"jobId": "JOB-101"}
    }
    resp1 = lambda_handler(event_rank_job1, None)
    assert resp1["statusCode"] == 200, f"Error: {resp1}"
    data1 = json.loads(resp1["body"])

    print(f"Total Eligible Candidates for Job 1: {data1['totalEligible']}")
    print(f"Top 3 Candidates: {[c['candidateName'] + ' (' + str(c['totalScore']) + ')' for c in data1['topThree']]}")
    assert len(data1["topThree"]) == 3, f"Expected 3 top candidates, got {len(data1['topThree'])}"
    assert data1["topThree"][0]["totalScore"] >= data1["topThree"][1]["totalScore"] >= data1["topThree"][2]["totalScore"]
    print("[PASS] Top 3 candidates evaluated and sorted by score descending.")

    # Select candidates to assign
    top_candidate_ids = [c["candidateId"] for c in data1["topThree"]]
    print(f"Recruiter selected top candidates for assignment: {top_candidate_ids}")

    print("\n--- Test 2: Confirming Assignment of Top Candidates to Job 1 ---")
    event_assign = {
        "httpMethod": "POST",
        "path": "/assignments",
        "body": json.dumps({
            "jobId": "JOB-101",
            "candidateIds": top_candidate_ids
        })
    }
    resp_assign = lambda_handler(event_assign, None)
    assert resp_assign["statusCode"] == 200
    assign_result = json.loads(resp_assign["body"])
    print(f"Confirmed Candidate IDs: {assign_result['confirmedCandidateIds']}")
    print(f"New Available Candidate Count: {assign_result['newAvailableCandidateCount']}")
    assert len(assign_result["confirmedCandidateIds"]) == len(top_candidate_ids)
    assert assign_result["newAvailableCandidateCount"] == data1["totalEligible"] - len(top_candidate_ids)
    print("[PASS] Candidate assignments confirmed via DynamoDB conditional writes.")

    print("\n--- Test 3: CRITICAL EXCLUSION RULE - Matching for Job 2 (Cloud DevOps & SRE) ---")
    event_rank_job2 = {
        "httpMethod": "GET",
        "path": "/ranking",
        "queryStringParameters": {"jobId": "JOB-102"}
    }
    resp2 = lambda_handler(event_rank_job2, None)
    assert resp2["statusCode"] == 200
    data2 = json.loads(resp2["body"])

    print(f"Total Eligible Candidates for Job 2: {data2['totalEligible']}")
    assert data2["totalEligible"] == assign_result["newAvailableCandidateCount"]

    # Verify that NONE of the candidates assigned to Job 1 appear in Job 2!
    all_job2_candidates = [c["candidateId"] for c in data2["topThree"]] + [c["candidateId"] for c in data2["remaining"]]
    for assigned_id in top_candidate_ids:
        assert assigned_id not in all_job2_candidates, f"VIOLATION: Assigned candidate {assigned_id} was NOT excluded from Job 2!"
    print(f"[PASS] CRITICAL BUSINESS RULE VERIFIED: All assigned candidates {top_candidate_ids} are 100% excluded from Job 2.")

    print("\n--- Test 4: Concurrent / Duplicate Assignment Prevention ---")
    # Try assigning an already assigned candidate again
    event_reassign = {
        "httpMethod": "POST",
        "path": "/assignments",
        "body": json.dumps({
            "jobId": "JOB-102",
            "candidateIds": [top_candidate_ids[0]]
        })
    }
    resp_reassign = lambda_handler(event_reassign, None)
    assert resp_reassign["statusCode"] == 200
    reassign_data = json.loads(resp_reassign["body"])
    assert len(reassign_data["failedCandidateIds"]) > 0
    print(f"[PASS] Prevented duplicate assignment: {reassign_data['failedCandidateIds']}")

    print("\n--- Test 5: Assignment Ledger & Audit History ---")
    event_get_asgn = {"httpMethod": "GET", "path": "/assignments"}
    resp_asgn_list = lambda_handler(event_get_asgn, None)
    assert resp_asgn_list["statusCode"] == 200
    asgn_body = json.loads(resp_asgn_list["body"])
    print(f"Found {asgn_body['count']} assignment audit records in ledger.")
    assert asgn_body["count"] >= len(top_candidate_ids)
    print("[PASS] Assignment history audit ledger verified.")

    print("\n--- Test 6: Controlled Assignment Release (Rollback to Pool) ---")
    # Release first candidate
    released_cand_id = top_candidate_ids[0]
    # Find assignment item SK
    target_record = next(a for a in asgn_body["assignments"] if a["candidateId"] == released_cand_id)
    event_cancel = {
        "httpMethod": "POST",
        "path": "/assignments/cancel",
        "body": json.dumps({
            "candidateId": released_cand_id,
            "assignmentSk": target_record["SK"]
        })
    }
    resp_cancel = lambda_handler(event_cancel, None)
    assert resp_cancel["statusCode"] == 200
    cancel_data = json.loads(resp_cancel["body"])
    print(f"Candidate {released_cand_id} released! New Available Pool: {cancel_data['newAvailableCandidateCount']}")
    assert cancel_data["newAvailableCandidateCount"] == assign_result["newAvailableCandidateCount"] + 1
    print("[PASS] Controlled rollback verified: Candidate returned to available pool.")

    print("\n==========================================")
    print("ALL PHASE 6 TESTS PASSED (6/6)!")
    print("==========================================")

if __name__ == "__main__":
    test_phase6()

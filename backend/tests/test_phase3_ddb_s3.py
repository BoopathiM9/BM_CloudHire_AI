"""
Automated Verification Test for Phase 3: S3 & DynamoDB Integration
Tests:
1. Fetching jobs from DynamoDB
2. Querying available candidates via GSI1 index
3. Testing atomic assignment conditional write
4. Testing candidate exclusion (verifies assigned candidate is removed from available pool)
5. Testing assignment release and return to pool
6. Testing S3 presigned upload URL generation
"""

import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from common.ddb_client import DynamoDBService
from common.s3_client import S3Service

def test_phase3():
    ddb = DynamoDBService()
    s3 = S3Service()

    print("\n--- Test 1: Fetching Jobs from DynamoDB ---")
    jobs = ddb.list_jobs()
    print(f"Found {len(jobs)} jobs in DynamoDB.")
    assert len(jobs) >= 3, "Expected at least 3 benchmark jobs"
    print("[PASS] Jobs list verified.")

    print("\n--- Test 2: Querying Available Candidates via GSI1 ---")
    avail = ddb.get_available_candidates()
    print(f"Found {len(avail)} available candidates via GSI1 query.")
    assert len(avail) == 20, f"Expected 20 initial available candidates, got {len(avail)}"
    print("[PASS] Available candidates query verified.")

    print("\n--- Test 3: Atomic Assignment Conditional Write ---")
    test_cand_id = "CAN-001"
    job_id = "JOB-101"
    assigned = ddb.assign_candidate(test_cand_id, job_id, "Senior Full-Stack AWS Developer")
    assert assigned is True, "Failed to assign candidate"
    print(f"[PASS] Candidate {test_cand_id} assigned to {job_id}.")

    print("\n--- Test 4: Verifying Exclusion Rule via GSI1 ---")
    avail_after = ddb.get_available_candidates()
    print(f"Available candidates count after assignment: {len(avail_after)}")
    assert len(avail_after) == 19, f"Expected 19 available candidates, got {len(avail_after)}"
    cand_ids = [c["candidateId"] for c in avail_after]
    assert test_cand_id not in cand_ids, f"Candidate {test_cand_id} was NOT excluded!"
    print(f"[PASS] Critical Rule Verified: {test_cand_id} is strictly excluded from available pool.")

    print("\n--- Test 5: Releasing Assignment (Rollback to Pool) ---")
    # Fetch assignment SK
    cand_item = ddb.get_candidate(test_cand_id)
    assert cand_item["availabilityStatus"] == "ASSIGNED"
    # Release candidate
    # find assignment item
    table = ddb.table
    asgn_items = table.query(
        KeyConditionExpression="PK = :pk",
        ExpressionAttributeValues={":pk": f"ASSIGNMENT#{test_cand_id}"}
    ).get("Items", [])
    assert len(asgn_items) > 0, "No assignment record found"
    sk = asgn_items[0]["SK"]
    ddb.release_candidate_assignment(test_cand_id, sk)

    avail_restored = ddb.get_available_candidates()
    print(f"Available candidates count after release: {len(avail_restored)}")
    assert len(avail_restored) == 20, f"Expected 20 candidates after release, got {len(avail_restored)}"
    assert test_cand_id in [c["candidateId"] for c in avail_restored]
    print(f"[PASS] Controlled release verified: {test_cand_id} restored to pool.")

    print("\n--- Test 6: S3 Presigned Upload URL Generation ---")
    presigned = s3.generate_presigned_upload_url("resumes/test_candidate.pdf", 300)
    assert "uploadUrl" in presigned and "https://" in presigned["uploadUrl"]
    assert presigned["bucket"] == "resume-matcher-384875139605"
    print("[PASS] S3 Presigned URL generated successfully.")

    print("\n==========================================")
    print("ALL PHASE 3 INTEGRATION TESTS PASSED (6/6)!")
    print("==========================================")

if __name__ == "__main__":
    test_phase3()

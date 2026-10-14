"""
DynamoDB Single-Table Client for AI Resume Matcher
Enforces atomic candidate exclusion via conditional writes
Table: ResumeMatcherTable (PK, SK, GSI1)
"""

import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from datetime import datetime
import os

TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "ResumeMatcherTable")
REGION = os.environ.get("AWS_REGION", "us-east-1")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)

class DynamoDBService:
    def __init__(self, table_name=TABLE_NAME):
        self.table = dynamodb.Table(table_name)

    # --- JOB OPERATIONS ---
    def save_job(self, job_data: dict) -> dict:
        job_id = job_data.get("jobId") or f"JOB-{int(datetime.utcnow().timestamp())}"
        item = {
            "PK": f"JOB#{job_id}",
            "SK": "METADATA",
            "jobId": job_id,
            "title": job_data["title"],
            "company": job_data.get("company", "Enterprise"),
            "description": job_data["description"],
            "requiredSkills": job_data.get("requiredSkills", []),
            "preferredSkills": job_data.get("preferredSkills", []),
            "minExperienceYears": int(job_data.get("minExperienceYears", 2)),
            "educationRequirement": job_data.get("educationRequirement", "Relevant degree"),
            "createdAt": job_data.get("createdAt", datetime.utcnow().isoformat() + "Z")
        }
        self.table.put_item(Item=item)
        return item

    def get_job(self, job_id: str):
        response = self.table.get_item(
            Key={"PK": f"JOB#{job_id}", "SK": "METADATA"}
        )
        return response.get("Item")

    def list_jobs(self) -> list:
        # Scan for jobs (small bounded set of requisitions)
        response = self.table.scan(
            FilterExpression=Attr("SK").eq("METADATA") & Attr("PK").begins_with("JOB#")
        )
        return response.get("Items", [])

    # --- CANDIDATE OPERATIONS ---
    def save_candidate_profile(self, candidate_data: dict) -> dict:
        cand_id = candidate_data.get("candidateId")
        item = {
            "PK": f"CANDIDATE#{cand_id}",
            "SK": "PROFILE",
            "GSI1_PK": "STATUS#AVAILABLE",
            "GSI1_SK": f"CANDIDATE#{cand_id}",
            "candidateId": cand_id,
            "name": candidate_data.get("name", "Unknown"),
            "email": candidate_data.get("email", ""),
            "filename": candidate_data.get("filename", ""),
            "resumeHash": candidate_data.get("resumeHash", ""),
            "experienceYears": int(candidate_data.get("experienceYears", 0)),
            "skills": candidate_data.get("skills", []),
            "projects": candidate_data.get("projects", []),
            "certifications": candidate_data.get("certifications", []),
            "availabilityStatus": "AVAILABLE",
            "assignedJobId": "NONE",
            "s3Key": candidate_data.get("s3Key", ""),
            "uploadedAt": candidate_data.get("uploadedAt", datetime.utcnow().isoformat() + "Z")
        }
        self.table.put_item(Item=item)
        return item

    def get_candidate(self, candidate_id: str):
        response = self.table.get_item(
            Key={"PK": f"CANDIDATE#{candidate_id}", "SK": "PROFILE"}
        )
        return response.get("Item")

    # CRITICAL RULE: Query ONLY available candidates using GSI1 index
    def get_available_candidates(self) -> list:
        response = self.table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1_PK").eq("STATUS#AVAILABLE")
        )
        return response.get("Items", [])

    # --- ATOMIC ASSIGNMENT WRITE ---
    def assign_candidate(self, candidate_id: str, job_id: str, job_title: str) -> bool:
        """
        Uses DynamoDB conditional write:
        ConditionExpression: availabilityStatus = 'AVAILABLE'
        Guarantees that a candidate cannot be concurrently assigned to two jobs!
        """
        now = datetime.utcnow().isoformat() + "Z"
        try:
            # 1. Update Candidate Item atomically
            self.table.update_item(
                Key={"PK": f"CANDIDATE#{candidate_id}", "SK": "PROFILE"},
                UpdateExpression="SET availabilityStatus = :asgn, assignedJobId = :jid, GSI1_PK = :gsi_asgn",
                ConditionExpression="availabilityStatus = :avail",
                ExpressionAttributeValues={
                    ":asgn": "ASSIGNED",
                    ":jid": job_id,
                    ":gsi_asgn": "STATUS#ASSIGNED",
                    ":avail": "AVAILABLE"
                }
            )

            # 2. Record Assignment Audit Record
            asgn_item = {
                "PK": f"ASSIGNMENT#{candidate_id}",
                "SK": f"JOB#{job_id}#{now}",
                "assignmentId": f"ASGN-{candidate_id}-{job_id}",
                "candidateId": candidate_id,
                "jobId": job_id,
                "jobTitle": job_title,
                "assignedAt": now,
                "status": "ACTIVE"
            }
            self.table.put_item(Item=asgn_item)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise ValueError(f"Candidate {candidate_id} is already ASSIGNED or no longer available.")
            raise

    # --- RELEASE / ROLLBACK ASSIGNMENT ---
    def release_candidate_assignment(self, candidate_id: str, assignment_sk: str) -> bool:
        """
        Returns candidate to available pool and marks assignment record as CANCELLED.
        """
        # 1. Return candidate to available pool
        self.table.update_item(
            Key={"PK": f"CANDIDATE#{candidate_id}", "SK": "PROFILE"},
            UpdateExpression="SET availabilityStatus = :avail, assignedJobId = :none, GSI1_PK = :gsi_avail",
            ExpressionAttributeValues={
                ":avail": "AVAILABLE",
                ":none": "NONE",
                ":gsi_avail": "STATUS#AVAILABLE"
            }
        )

        # 2. Update Assignment audit item status
        self.table.update_item(
            Key={"PK": f"ASSIGNMENT#{candidate_id}", "SK": assignment_sk},
            UpdateExpression="SET #st = :canc",
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={":canc": "CANCELLED"}
        )
        return True

    # --- MATCH RESULTS ---
    def save_match_result(self, match_data: dict):
        job_id = match_data["jobId"]
        cand_id = match_data["candidateId"]
        item = {
            "PK": f"JOB#{job_id}",
            "SK": f"MATCH#{cand_id}",
            **match_data
        }
        self.table.put_item(Item=item)
        return item

    def get_matches_for_job(self, job_id: str) -> list:
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"JOB#{job_id}") & Key("SK").begins_with("MATCH#")
        )
        return response.get("Items", [])

    # --- APPLICATION OPERATIONS ---
    def save_application(self, app_data: dict) -> dict:
        app_id = app_data.get("id") or f"APP-{int(datetime.utcnow().timestamp() * 1000) % 100000:04d}"
        job_id = app_data.get("jobId", "UNKNOWN")
        item = {
            "PK": f"APPLICATION#{app_id}",
            "SK": f"JOB#{job_id}",
            "id": app_id,
            "jobId": job_id,
            "jobTitle": app_data.get("jobTitle", "Requisition"),
            "candidateName": app_data.get("candidateName", "Candidate"),
            "candidateEmail": app_data.get("candidateEmail", "").lower(),
            "phone": app_data.get("phone", ""),
            "experienceYears": int(app_data.get("experienceYears", 0)),
            "skills": app_data.get("skills", []),
            "resumeFilename": app_data.get("resumeFilename", "resume.pdf"),
            "status": app_data.get("status", "Submitted"),
            "statusNote": app_data.get("statusNote", "Application received and queued for review."),
            "submittedAt": app_data.get("submittedAt", datetime.utcnow().isoformat() + "Z"),
            "updatedAt": app_data.get("updatedAt", datetime.utcnow().isoformat() + "Z")
        }
        self.table.put_item(Item=item)
        return item

    def list_applications(self, candidate_email: str = None, job_id: str = None) -> list:
        # Scan for applications
        response = self.table.scan(
            FilterExpression=Attr("PK").begins_with("APPLICATION#")
        )
        apps = response.get("Items", [])
        if candidate_email:
            apps = [a for a in apps if a.get("candidateEmail", "").lower() == candidate_email.lower()]
        if job_id:
            apps = [a for a in apps if a.get("jobId") == job_id]
        apps.sort(key=lambda x: x.get("submittedAt", ""), reverse=True)
        return apps

    def update_application_status(self, app_id: str, new_status: str, status_note: str = "") -> bool:
        now = datetime.utcnow().isoformat() + "Z"
        # Find item by PK
        response = self.table.query(
            KeyConditionExpression=Key("PK").eq(f"APPLICATION#{app_id}")
        )
        items = response.get("Items", [])
        if not items:
            return False
        sk = items[0]["SK"]
        self.table.update_item(
            Key={"PK": f"APPLICATION#{app_id}", "SK": sk},
            UpdateExpression="SET #st = :s, statusNote = :sn, updatedAt = :u",
            ExpressionAttributeNames={"#st": "status"},
            ExpressionAttributeValues={
                ":s": new_status,
                ":sn": status_note or items[0].get("statusNote", ""),
                ":u": now
            }
        )
        return True

    # --- USER AUTH OPERATIONS ---
    def save_user(self, user_data: dict) -> dict:
        email = user_data["email"].lower()
        item = {
            "PK": f"USER#{email}",
            "SK": "ACCOUNT",
            "id": user_data.get("id") or f"USR-{int(datetime.utcnow().timestamp())}",
            "email": email,
            "name": user_data.get("name", "User"),
            "role": user_data.get("role", "CANDIDATE"),
            "passwordHash": user_data.get("passwordHash", ""),
            "createdAt": user_data.get("createdAt", datetime.utcnow().isoformat() + "Z")
        }
        self.table.put_item(Item=item)
        return item

    def get_user(self, email: str):
        response = self.table.get_item(
            Key={"PK": f"USER#{email.lower()}", "SK": "ACCOUNT"}
        )
        return response.get("Item")


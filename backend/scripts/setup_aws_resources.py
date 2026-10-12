"""
AWS Setup Script for AI Resume Matcher & Smart Candidate Assignment System
Account: 384875139605 | Region: us-east-1

Creates:
1. Amazon S3 Bucket: resume-matcher-384875139605 (Private with CORS configured for web uploads)
2. Amazon DynamoDB Table: ResumeMatcherTable (Single-table design with GSI1 for availability status)
3. Seeds initial benchmark jobs and candidate profiles for immediate testing
"""

import boto3
import json
import sys
import time

REGION = "us-east-1"
BUCKET_NAME = "resume-matcher-384875139605"
TABLE_NAME = "ResumeMatcherTable"

s3 = boto3.client("s3", region_name=REGION)
dynamodb = boto3.client("dynamodb", region_name=REGION)
ddb_resource = boto3.resource("dynamodb", region_name=REGION)

def setup_s3_bucket():
    print(f"\n--- 1. Setting up S3 Bucket: {BUCKET_NAME} ---")
    try:
        # us-east-1 does not require LocationConstraint
        s3.create_bucket(Bucket=BUCKET_NAME)
        print(f"[OK] S3 Bucket '{BUCKET_NAME}' created successfully.")
    except s3.exceptions.BucketAlreadyOwnedByYou:
        print(f"[INFO] S3 Bucket '{BUCKET_NAME}' already exists and is owned by you.")
    except Exception as e:
        print(f"[ERROR] S3 Bucket creation error: {e}")
        return False

    # Block public access (Keep bucket strictly private)
    try:
        s3.put_public_access_block(
            Bucket=BUCKET_NAME,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": True,
                "IgnorePublicAcls": True,
                "BlockPublicPolicy": True,
                "RestrictPublicBuckets": True,
            },
        )
        print("[OK] S3 Bucket Public Access Block enabled (100% Private).")
    except Exception as e:
        print(f"[WARN] Failed to set public access block: {e}")

    # Configure CORS for local development and AWS Amplify frontend
    cors_configuration = {
        "CORSRules": [
            {
                "AllowedHeaders": ["*"],
                "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
                "AllowedOrigins": [
                    "http://localhost:5173",
                    "http://127.0.0.1:5173",
                    "https://*.amplifyapp.com"
                ],
                "ExposeHeaders": ["ETag"],
                "MaxAgeSeconds": 3000,
            }
        ]
    }
    try:
        s3.put_bucket_cors(Bucket=BUCKET_NAME, CORSConfiguration=cors_configuration)
        print("[OK] S3 CORS configuration applied for localhost and Amplify.")
    except Exception as e:
        print(f"[WARN] Failed to set CORS: {e}")

    return True

def setup_dynamodb_table():
    print(f"\n--- 2. Setting up DynamoDB Single Table: {TABLE_NAME} ---")
    try:
        # Check if table already exists
        existing_tables = dynamodb.list_tables().get("TableNames", [])
        if TABLE_NAME in existing_tables:
            print(f"[INFO] DynamoDB Table '{TABLE_NAME}' already exists.")
            return True

        table = dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},  # Partition Key
                {"AttributeName": "SK", "KeyType": "RANGE"},  # Sort Key
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "GSI1_PK", "AttributeType": "S"},
                {"AttributeName": "GSI1_SK", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "GSI1",
                    "KeySchema": [
                        {"AttributeName": "GSI1_PK", "KeyType": "HASH"},
                        {"AttributeName": "GSI1_SK", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
            BillingMode="PAY_PER_REQUEST",  # On-demand, within free tier
        )
        print(f"[PENDING] Creating DynamoDB table '{TABLE_NAME}'... waiting for ACTIVE state.")
        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=TABLE_NAME)
        print(f"[OK] DynamoDB table '{TABLE_NAME}' is now ACTIVE.")
        return True
    except Exception as e:
        print(f"[ERROR] DynamoDB creation error: {e}")
        return False

def seed_sample_data():
    print(f"\n--- 3. Seeding Initial Jobs & Candidates into DynamoDB ---")
    table = ddb_resource.Table(TABLE_NAME)

    # 1. Benchmark Jobs
    jobs = [
        {
            "PK": "JOB#JOB-101",
            "SK": "METADATA",
            "jobId": "JOB-101",
            "title": "Senior Full-Stack AWS Developer",
            "company": "CloudScale Technologies",
            "description": "Looking for an experienced full-stack engineer to build serverless microservices with AWS Lambda, DynamoDB, API Gateway, and modern React frontends. Requires strong Python backend expertise, REST API design, and cloud architecture fundamentals.",
            "requiredSkills": ["Python", "AWS Lambda", "DynamoDB", "React", "API Gateway"],
            "preferredSkills": ["Docker", "TypeScript", "GraphQL", "AWS CDK"],
            "minExperienceYears": 4,
            "educationRequirement": "Bachelor's in Computer Science or equivalent",
            "createdAt": "2026-10-10T10:00:00Z"
        },
        {
            "PK": "JOB#JOB-102",
            "SK": "METADATA",
            "jobId": "JOB-102",
            "title": "Cloud DevOps & Site Reliability Engineer",
            "company": "FinTech Prime Systems",
            "description": "Seeking a DevOps specialist to manage automated CI/CD pipelines, Kubernetes container orchestration, infrastructure as code using Terraform/CDK, and AWS observability using CloudWatch and Prometheus.",
            "requiredSkills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
            "preferredSkills": ["Python", "Prometheus", "CloudWatch", "Linux"],
            "minExperienceYears": 3,
            "educationRequirement": "Bachelor's in Engineering, IT, or equivalent",
            "createdAt": "2026-10-11T09:30:00Z"
        },
        {
            "PK": "JOB#JOB-103",
            "SK": "METADATA",
            "jobId": "JOB-103",
            "title": "Generative AI & LLM Solutions Engineer",
            "company": "Cognitive Nexus Labs",
            "description": "Looking for a GenAI Engineer to develop RAG pipelines using Amazon Bedrock, Vector Databases, Python FastAPI, and LangChain. Strong experience evaluating LLM prompt patterns and semantic search is required.",
            "requiredSkills": ["Python", "Amazon Bedrock", "Vector Databases", "LangChain", "FastAPI"],
            "preferredSkills": ["AWS Lambda", "PyTorch", "Hugging Face", "OpenSearch"],
            "minExperienceYears": 3,
            "educationRequirement": "Master's or Bachelor's in CS / AI / Data Science",
            "createdAt": "2026-10-12T08:15:00Z"
        }
    ]

    with table.batch_writer() as batch:
        for job in jobs:
            batch.put_item(Item=job)
    print(f"[OK] Seeded {len(jobs)} jobs into DynamoDB.")

    # 2. 20 Candidate Profiles
    candidates_raw = [
        ("CAN-001", "Arun Krishnan", "arun_krishnan_resume.pdf", 6, ["Python", "AWS Lambda", "DynamoDB", "React", "API Gateway", "Docker", "AWS CDK"], ["Serverless E-Commerce Portal on AWS", "Real-Time Telemetry Dashboard with React"], ["AWS Certified Solutions Architect Associate"]),
        ("CAN-002", "Priya Sharma", "priya_sharma_cloud.docx", 5, ["Python", "AWS Lambda", "React", "API Gateway", "DynamoDB", "TypeScript"], ["Healthcare Patient Portal with DynamoDB", "Automated Invoice Processor using Lambda"], ["AWS Certified Developer Associate"]),
        ("CAN-003", "Karthik Raja", "karthik_raja_devops.pdf", 5, ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux", "Prometheus"], ["Multi-Cluster EKS Infrastructure with Terraform", "Automated GitOps Pipeline using ArgoCD"], ["CKA", "AWS DevOps Professional"]),
        ("CAN-004", "Sneha Patel", "sneha_patel_ai.pdf", 4, ["Python", "Amazon Bedrock", "Vector Databases", "LangChain", "FastAPI", "OpenSearch"], ["Enterprise Knowledge Base RAG Assistant", "Document Summarization Engine on Bedrock"], ["AWS Certified Machine Learning Specialty"]),
        ("CAN-005", "Vikram Sengupta", "vikram_fullstack.docx", 4, ["Python", "React", "AWS Lambda", "DynamoDB", "API Gateway", "Node.js"], ["Microservices Orchestration Engine", "Inventory Tracking Dashboard"], ["AWS Certified Solutions Architect Associate"]),
        ("CAN-006", "Divya Balasubramanian", "divya_devops_sre.pdf", 4, ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "CloudWatch", "Python"], ["Disaster Recovery Automation on AWS", "Zero-Downtime Deployment with GitLab CI"], ["AWS Certified SysOps Administrator"]),
        ("CAN-007", "Rahul Verma", "rahul_genai.pdf", 3, ["Python", "Amazon Bedrock", "LangChain", "Vector Databases", "FastAPI", "PyTorch"], ["Customer Support Chatbot with Anthropic Claude", "Semantic Code Search Engine"], ["DeepLearning.AI GenAI Specialization"]),
        ("CAN-008", "Ananya Iyer", "ananya_cloud_architect.pdf", 7, ["Python", "AWS Lambda", "DynamoDB", "API Gateway", "AWS CDK", "Docker", "React"], ["Serverless Banking Ledger", "High-Throughput IoT Event Streaming Pipeline"], ["AWS Certified Solutions Architect Professional"]),
        ("CAN-009", "Manoj Kumar", "manoj_infra.docx", 3, ["AWS", "Docker", "CI/CD", "Terraform", "Linux", "Kubernetes"], ["AWS Cost Optimization with Lambda & EventBridge", "Dockerized Microservice Deployment"], ["AWS Certified Cloud Practitioner"]),
        ("CAN-010", "Siddharth Rao", "sid_llm_engineer.pdf", 4, ["Python", "Amazon Bedrock", "Vector Databases", "FastAPI", "LangChain", "AWS Lambda"], ["Multi-Agent Research Assistant using Bedrock & Claude", "Vector Search API with ChromaDB"], ["AWS Certified Machine Learning Specialty"]),
        ("CAN-011", "Meera Nair", "meera_react_frontend.pdf", 3, ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Redux"], ["HR Talent Management Dashboard", "Interactive Analytics Portal"], ["Meta Certified Frontend Developer"]),
        ("CAN-012", "Gautam Ghosh", "gautam_python_dev.docx", 2, ["Python", "Django", "PostgreSQL", "REST APIs", "Git"], ["Content Management Platform", "REST API for E-commerce Cart"], []),
        ("CAN-013", "Tanvi Deshmukh", "tanvi_qa_automation.pdf", 4, ["Python", "Selenium", "PyTest", "CI/CD", "Jira", "API Testing"], ["End-to-End Automation Framework with PyTest", "Mobile App Test Suite"], ["ISTQB Certified Tester"]),
        ("CAN-014", "Harish Pillai", "harish_data_eng.pdf", 5, ["Python", "Apache Spark", "AWS Glue", "Redshift", "SQL", "Docker"], ["Petabyte Scale Data Lake on S3", "ETL Pipelines with AWS Glue"], ["AWS Certified Data Analytics Specialty"]),
        ("CAN-015", "Roshni Chawla", "roshni_cloud_junior.docx", 1, ["Python", "AWS", "HTML/CSS", "JavaScript", "Git"], ["Student Record Management Web App", "AWS S3 Static Website"], ["AWS Certified Cloud Practitioner"]),
        ("CAN-016", "Abhishek Joshi", "abhishek_backend_aws.pdf", 4, ["Python", "AWS Lambda", "DynamoDB", "API Gateway", "FastAPI", "React"], ["Real-Time Order Processing API with SQS & Lambda", "React Dashboard for Fleet Operations"], ["AWS Certified Developer Associate"]),
        ("CAN-017", "Kavita Reddy", "kavita_sre.pdf", 4, ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Prometheus", "Python"], ["Kubernetes Cluster Hardening and Compliance", "Automated Release Pipeline on AWS CodePipeline"], ["CKA", "AWS Certified Solutions Architect Associate"]),
        ("CAN-018", "Deepak Choudhury", "deepak_ai_rag.docx", 3, ["Python", "Amazon Bedrock", "Vector Databases", "LangChain", "FastAPI", "Docker"], ["Financial Document Question Answering using Bedrock", "Multi-lingual Vector Index with FAISS"], ["AWS Certified Solutions Architect Associate"]),
        ("CAN-019", "Swati Mukherjee", "swati_fullstack.pdf", 5, ["Python", "React", "AWS Lambda", "DynamoDB", "API Gateway", "TypeScript", "Docker"], ["Telehealth Consultation System", "Payment Gateway Webhook Processor using Lambda"], ["AWS Certified Developer Associate"]),
        ("CAN-020", "Naveen Prakash", "naveen_devops.docx", 4, ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "CloudWatch", "Linux"], ["Automated Blue/Green Deployments with AWS ECS", "Centralized Logging with OpenSearch"], ["AWS DevOps Engineer Professional"]),
    ]

    with table.batch_writer() as batch:
        for cid, name, fname, exp, skills, projects, certs in candidates_raw:
            item = {
                "PK": f"CANDIDATE#{cid}",
                "SK": "PROFILE",
                "GSI1_PK": "STATUS#AVAILABLE",
                "GSI1_SK": f"CANDIDATE#{cid}",
                "candidateId": cid,
                "name": name,
                "email": f"{name.lower().replace(' ', '.')}@example.com",
                "filename": fname,
                "resumeHash": f"hash_{cid.lower()}_{hash(name) & 0xffffffff:x}",
                "experienceYears": exp,
                "skills": skills,
                "projects": projects,
                "certifications": certs,
                "availabilityStatus": "AVAILABLE",
                "assignedJobId": "NONE",
                "s3Key": f"resumes/{cid}/{fname}",
                "uploadedAt": "2026-10-10T12:00:00Z"
            }
            batch.put_item(Item=item)
    print(f"[OK] Seeded {len(candidates_raw)} candidate profiles into DynamoDB with GSI1 status.")

if __name__ == "__main__":
    s3_ok = setup_s3_bucket()
    ddb_ok = setup_dynamodb_table()
    if s3_ok and ddb_ok:
        seed_sample_data()
        print("\n=== PHASE 3 AWS SETUP & SEEDING COMPLETED SUCCESSFULLY ===")
    else:
        print("\n[ERROR] Setup encountered issues.")
        sys.exit(1)

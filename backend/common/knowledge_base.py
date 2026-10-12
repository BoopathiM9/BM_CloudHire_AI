"""
Bedrock Knowledge Base & Skill Competency Grounding Service
Provides relevant competency definitions from S3/local taxonomy for model grounding.
"""

import boto3
import os
import glob

REGION = os.environ.get("AWS_REGION", "us-east-1")
BUCKET_NAME = os.environ.get("S3_BUCKET", "resume-matcher-384875139605")
KB_PREFIX = "kb-reference/"

s3_client = boto3.client("s3", region_name=REGION)

class KnowledgeBaseService:
    def __init__(self, bucket_name=BUCKET_NAME):
        self.bucket = bucket_name
        self.local_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../knowledge_base/skill_taxonomy"))

    def sync_reference_docs_to_s3(self):
        """Syncs local competency documents to private S3 for Bedrock Knowledge Base ingestion."""
        files = glob.glob(os.path.join(self.local_dir, "*.txt"))
        uploaded = []
        for file_path in files:
            fname = os.path.basename(file_path)
            s3_key = f"{KB_PREFIX}{fname}"
            with open(file_path, "rb") as f:
                s3_client.put_object(
                    Bucket=self.bucket,
                    Key=s3_key,
                    Body=f.read(),
                    ContentType="text/plain"
                )
            uploaded.append(s3_key)
        return uploaded

    def get_grounding_context(self, job_title: str, required_skills: list) -> str:
        """
        Retrieves relevant competency definitions to ground Bedrock prompt evaluations.
        Matches relevant taxonomy files based on job domain and skills.
        """
        relevant_texts = []
        lower_title = job_title.lower()
        skills_str = " ".join(required_skills).lower()

        # 1. Cloud & Serverless
        if "cloud" in lower_title or "serverless" in lower_title or "full-stack" in lower_title or "lambda" in skills_str:
            cloud_doc = os.path.join(self.local_dir, "cloud_developer_competencies.txt")
            if os.path.exists(cloud_doc):
                with open(cloud_doc, "r", encoding="utf-8") as f:
                    relevant_texts.append(f.read())

        # 2. DevOps & SRE
        if "devops" in lower_title or "sre" in lower_title or "kubernetes" in skills_str or "terraform" in skills_str:
            devops_doc = os.path.join(self.local_dir, "devops_sre_competencies.txt")
            if os.path.exists(devops_doc):
                with open(devops_doc, "r", encoding="utf-8") as f:
                    relevant_texts.append(f.read())

        # 3. GenAI & Data
        if "ai" in lower_title or "genai" in lower_title or "llm" in lower_title or "bedrock" in skills_str:
            genai_doc = os.path.join(self.local_dir, "genai_llm_competencies.txt")
            if os.path.exists(genai_doc):
                with open(genai_doc, "r", encoding="utf-8") as f:
                    relevant_texts.append(f.read())

        # Always include scoring guidelines
        scoring_doc = os.path.join(self.local_dir, "scoring_guidelines.txt")
        if os.path.exists(scoring_doc):
            with open(scoring_doc, "r", encoding="utf-8") as f:
                relevant_texts.append(f.read())

        return "\n\n---\n\n".join(relevant_texts)

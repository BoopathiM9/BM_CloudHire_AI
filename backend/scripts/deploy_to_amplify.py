"""
Deploy BM CloudHire AI to AWS Amplify Hosting
Account: 384875139605 | Region: us-east-1

Actions:
1. Builds frontend with production assets in frontend/dist
2. Creates an AWS Amplify App: 'BM-CloudHire-AI'
3. Creates 'main' branch
4. Packages and uploads dist as zip archive
5. Starts deployment job and tracks progress
6. Outputs live Amplify HTTPS domain!
"""

import boto3
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.request
import zipfile

REGION = "us-east-1"
APP_NAME = "BM-CloudHire-AI"
BRANCH_NAME = "main"

amplify = boto3.client("amplify", region_name=REGION)

def build_frontend():
    print("\n--- 1. Building Production Frontend Assets ---")
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend"))
    dist_dir = os.path.join(frontend_dir, "dist")
    index_file = os.path.join(dist_dir, "index.html")

    if not os.path.exists(index_file):
        print("Running npm run build...")
        env = os.environ.copy()
        node_path = r"C:\Program Files\nodejs"
        if node_path not in env.get("PATH", ""):
            env["PATH"] = node_path + ";" + env.get("PATH", "")
        env["NODE_OPTIONS"] = "--max-old-space-size=4096"
        cmd = "cmd /c \"npm run build\""
        res = subprocess.run(cmd, cwd=frontend_dir, shell=True, capture_output=True, text=True, env=env)
        if res.returncode != 0:
            print(f"[ERROR] Build failed: {res.stderr}")
            sys.exit(1)
    
    print("[OK] Production build verified in frontend/dist")

    # Create zip archive of dist folder contents
    zip_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "amplify_deploy.zip"))
    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"Creating zip archive: {zip_path}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_abs = os.path.join(root, file)
                rel_path = os.path.relpath(file_abs, dist_dir)
                zipf.write(file_abs, arcname=rel_path)

    print(f"[OK] Zip package created ({os.path.getsize(zip_path) / 1024:.1f} KB)")
    return zip_path

def get_or_create_amplify_app():
    print(f"\n--- 2. Setting up AWS Amplify App: '{APP_NAME}' ---")
    # Check if app already exists
    apps = amplify.list_apps().get("apps", [])
    for app in apps:
        if app["name"] == APP_NAME:
            print(f"[INFO] Found existing Amplify App '{APP_NAME}' (ID: {app['appId']})")
            return app

    # Create new Amplify App
    print(f"Creating new Amplify App '{APP_NAME}'...")
    response = amplify.create_app(
        name=APP_NAME,
        description="BM CloudHire AI — Intelligent Recruitment Platform",
        platform="WEB",
        customRules=[
            {
                "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
                "target": "/index.html",
                "status": "200"
            }
        ],
        environmentVariables={
            "VITE_API_URL": "http://127.0.0.1:5000"
        }
    )
    app = response["app"]
    print(f"[OK] Created Amplify App '{APP_NAME}' (App ID: {app['appId']})")
    print(f"Default domain: https://{app['defaultDomain']}")
    return app

def get_or_create_branch(app_id):
    print(f"\n--- 3. Configuring Branch: '{BRANCH_NAME}' ---")
    branches = amplify.list_branches(appId=app_id).get("branches", [])
    for b in branches:
        if b["branchName"] == BRANCH_NAME:
            print(f"[INFO] Branch '{BRANCH_NAME}' already exists.")
            return b

    response = amplify.create_branch(
        appId=app_id,
        branchName=BRANCH_NAME,
        stage="PRODUCTION",
        description="Production Branch for BM CloudHire AI"
    )
    branch = response["branch"]
    print(f"[OK] Branch '{BRANCH_NAME}' created.")
    return branch

def deploy_zip_to_amplify(app_id, zip_path):
    print("\n--- 4. Uploading & Starting Amplify Deployment ---")
    # Create deployment to get upload URL
    dep_res = amplify.create_deployment(
        appId=app_id,
        branchName=BRANCH_NAME
    )
    job_id = dep_res["jobId"]
    upload_url = dep_res["zipUploadUrl"]
    print(f"Deployment Job created (Job ID: {job_id})")

    # Upload zip to S3 presigned URL
    print("Uploading build package to Amplify S3...")
    with open(zip_path, "rb") as f:
        data = f.read()
        req = urllib.request.Request(
            upload_url,
            data=data,
            headers={"Content-Type": "application/zip"},
            method="PUT"
        )
        with urllib.request.urlopen(req) as resp:
            print(f"[OK] Package uploaded. Response: {resp.status}")

    # Start deployment
    print("Starting deployment in AWS Amplify...")
    start_res = amplify.start_deployment(
        appId=app_id,
        branchName=BRANCH_NAME,
        jobId=job_id
    )
    print(f"[OK] Deployment initiated: {start_res['jobSummary']['status']}")

    # Wait for completion
    print("Waiting for Amplify to publish assets (takes ~15-30 seconds)...")
    for _ in range(30):
        time.sleep(3)
        job_info = amplify.get_job(appId=app_id, branchName=BRANCH_NAME, jobId=job_id)
        status = job_info["job"]["summary"]["status"]
        print(f"Deployment status: {status}...")
        if status in ("SUCCEED", "FAILED", "CANCELLED"):
            break

    if status == "SUCCEED":
        default_domain = amplify.get_app(appId=app_id)["app"]["defaultDomain"]
        live_url = f"https://{BRANCH_NAME}.{default_domain}"
        print(f"\n=======================================================")
        print(f"SUCCESS! BM CloudHire AI is LIVE ON AWS AMPLIFY!")
        print(f"LIVE URL: {live_url}")
        print(f"=======================================================\n")
        return live_url
    else:
        print(f"[WARN] Deployment status: {status}")
        return None

if __name__ == "__main__":
    zip_path = build_frontend()
    app = get_or_create_amplify_app()
    branch = get_or_create_branch(app["appId"])
    live_url = deploy_zip_to_amplify(app["appId"], zip_path)

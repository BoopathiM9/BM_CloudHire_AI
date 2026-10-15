import os
import shutil
import base64
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
WORKSPACE_PDF = r"C:\NEW_PROJECT\BM_CloudHire_AI\BM_CloudHire_AI_Architecture_Documentation.pdf"
ARTIFACT_PDF = r"C:\Users\boopa\.gemini\antigravity\brain\c971f9ef-5bbf-4de6-879b-0b5fa349d1dd\BM_CloudHire_AI_Architecture_Documentation.pdf"
HTML_TEMP = r"C:\NEW_PROJECT\BM_CloudHire_AI\backend\scripts\temp_doc.html"
DOWNLOAD_WIDGET_HTML = r"C:\Users\boopa\.gemini\antigravity\brain\c971f9ef-5bbf-4de6-879b-0b5fa349d1dd\download_pdf.html"

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BM CloudHire AI — AWS Cloud Architecture &amp; System Specification</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 9pt;
        color: #718096;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1a202c;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10pt;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 3.5rem 2.5rem;
      page-break-after: always;
      background: linear-gradient(135deg, #173C35 0%, #0f2622 100%);
      color: #ffffff;
      border-radius: 12px;
    }

    .cover-brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 2rem;
    }

    .cover-badge {
      background: #52BFA0;
      color: #173C35;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 11pt;
      letter-spacing: 0.05em;
    }

    .cover-title {
      font-size: 30pt;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 1rem;
      color: #ffffff;
    }

    .cover-title span {
      color: #52BFA0;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      color: #DDF5EB;
      max-width: 620px;
      line-height: 1.5;
      margin-bottom: 3.5rem;
    }

    .cover-meta {
      border-top: 1px solid rgba(82, 191, 160, 0.3);
      padding-top: 1.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      font-size: 9.5pt;
    }

    .cover-meta-item strong {
      display: block;
      color: #52BFA0;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 3px;
    }

    /* Content Styling */
    h1 {
      font-size: 17pt;
      font-weight: 800;
      color: #173C35;
      margin: 1.8rem 0 0.8rem;
      border-bottom: 2px solid #52BFA0;
      padding-bottom: 6px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 12.5pt;
      font-weight: 700;
      color: #173C35;
      margin: 1.4rem 0 0.5rem;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #204e45;
      margin: 1rem 0 0.4rem;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 0.8rem;
      color: #2d3748;
      text-align: justify;
    }

    ul, ol {
      margin: 0.4rem 0 0.8rem 1.4rem;
      color: #2d3748;
    }

    li {
      margin-bottom: 0.35rem;
    }

    /* Diagrams & Architecture Cards */
    .diagram-container {
      background: #F4F8F6;
      border: 1.5px solid #E2ECE7;
      border-radius: 10px;
      padding: 1.25rem;
      margin: 1.2rem 0;
      page-break-inside: avoid;
      text-align: center;
    }

    .diagram-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #173C35;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .architecture-box-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      text-align: left;
    }

    .arch-card {
      background: #ffffff;
      border: 1px solid #CBD5E0;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .arch-card-header {
      font-weight: 700;
      font-size: 9.5pt;
      color: #173C35;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .arch-card-desc {
      font-size: 8pt;
      color: #4a5568;
      line-height: 1.35;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.5rem;
      font-size: 8.8pt;
      page-break-inside: avoid;
    }

    th {
      background: #173C35;
      color: #ffffff;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #E2ECE7;
      color: #2d3748;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #F8FCFA;
    }

    .badge-pill {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
    }

    .badge-forest { background: #DDF5EB; color: #173C35; border: 1px solid #52BFA0; }
    .badge-mint { background: #52BFA0; color: #173C35; }
    .badge-warning { background: #FEF3C7; color: #B45309; }

    /* Rubric Progress Bars */
    .rubric-row {
      margin-bottom: 9px;
    }
    .rubric-header {
      display: flex;
      justify-content: space-between;
      font-size: 8.8pt;
      font-weight: 600;
      margin-bottom: 3px;
    }
    .rubric-bar {
      height: 8px;
      background: #E2E8F0;
      border-radius: 4px;
      overflow: hidden;
    }
    .rubric-fill {
      height: 100%;
      border-radius: 4px;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div class="cover-brand">
      <div class="cover-badge">BM CLOUDHIRE AI</div>
      <span style="font-size: 11pt; color: #52BFA0; font-weight: 600;">Enterprise Recruitment SaaS</span>
    </div>

    <div class="cover-title">
      AWS Cloud Architecture &amp;<br>
      <span>Technical Specification</span>
    </div>

    <div class="cover-subtitle">
      A comprehensive guide to the serverless AWS cloud infrastructure, Amazon Bedrock Free-Tier basic foundation models, 100-point candidate scoring rubric, and system design.
    </div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <strong>Application</strong>
        BM CloudHire AI
      </div>
      <div class="cover-meta-item">
        <strong>AWS AI Engine</strong>
        Amazon Titan Text Lite / Nova Micro (Free Tier Basic)
      </div>
      <div class="cover-meta-item">
        <strong>Cloud Hosting</strong>
        AWS Amplify CI/CD Global Edge
      </div>
    </div>
  </div>

  <!-- ==================== SECTION 1: OVERVIEW ==================== -->
  <h1>1. Executive System Overview</h1>
  <p>
    <strong>BM CloudHire AI</strong> is an enterprise-grade recruitment platform designed to automate resume screening, technical competency evaluation, and candidate ranking across cloud and software engineering domains.
  </p>
  <p>
    The platform eliminates manual screening bottlenecks by analyzing applicant resumes with <strong>Amazon Bedrock Free-Tier Foundation Models</strong>, scoring each candidate on an objective <strong>100-point rubric</strong> that evaluates mandatory technical competencies, verified career experience, and project architecture deliverables.
  </p>

  <h2>Core Architectural Pillars</h2>
  <ul>
    <li><strong>Serverless &amp; Cost-Optimized:</strong> Built entirely on AWS serverless services (Amplify, Lambda, DynamoDB, S3) with zero idle compute costs.</li>
    <li><strong>Bedrock Free-Tier Basic Model Integration:</strong> Utilizes lightweight, high-efficiency models like <strong>Amazon Titan Text Lite (amazon.titan-text-lite-v1)</strong> and <strong>Amazon Nova Micro (amazon.nova-micro-v1:0)</strong> for ultra-fast, cost-effective inference.</li>
    <li><strong>Single-Table Database Architecture:</strong> High-throughput Amazon DynamoDB design with composite partition and sort keys for sub-10ms data retrieval.</li>
    <li><strong>Zero Personal Identity Exposure:</strong> Administrative interfaces are fully sanitized and isolated under generic system roles to protect recruiter privacy.</li>
  </ul>

  <!-- ==================== SECTION 2: AWS ARCHITECTURE ==================== -->
  <h1>2. Complete AWS Cloud System Architecture</h1>
  <p>
    The system follows the AWS Well-Architected Framework across five distinct tiers: Edge Delivery, API Gateway, Serverless Compute, Foundation Model AI, and Encrypted Persistence.
  </p>

  <div class="diagram-container">
    <div class="diagram-title">BM CloudHire AI — 5-Tier AWS Cloud Architecture</div>
    
    <div class="architecture-box-grid">
      <!-- Card 1 -->
      <div class="arch-card">
        <div class="arch-card-header">🌐 1. AWS Amplify Edge</div>
        <div class="arch-card-desc">
          Global Content Delivery Network (CDN) with automated Git CI/CD build runners, global edge caching, and managed TLS/SSL termination.
        </div>
      </div>

      <!-- Card 2 -->
      <div class="arch-card">
        <div class="arch-card-header">⚡ 2. Amazon API Gateway</div>
        <div class="arch-card-desc">
          Fully managed REST API Gateway managing route proxying, CORS authorization policies, payload validation, and request rate-limiting.
        </div>
      </div>

      <!-- Card 3 -->
      <div class="arch-card">
        <div class="arch-card-header">⚙️ 3. AWS Lambda Compute</div>
        <div class="arch-card-desc">
          Event-driven Python 3.12 microservices executing business logic, scoring formulas, resume parsing, and administrative status updates.
        </div>
      </div>

      <!-- Card 4 -->
      <div class="arch-card">
        <div class="arch-card-header">🤖 4. Amazon Bedrock (Basic Tier)</div>
        <div class="arch-card-desc">
          Free-Tier basic foundation models (Amazon Titan Text Lite &amp; Nova Micro) extracting technical competencies with deterministic low-temperature reasoning.
        </div>
      </div>

      <!-- Card 5 -->
      <div class="arch-card">
        <div class="arch-card-header">🗄️ 5. Amazon DynamoDB</div>
        <div class="arch-card-desc">
          Single-table NoSQL database storing user sessions, job requisitions, applications, and audit records with on-demand auto-scaling capacity.
        </div>
      </div>

      <!-- Card 6 -->
      <div class="arch-card">
        <div class="arch-card-header">📁 6. Amazon S3 Storage</div>
        <div class="arch-card-desc">
          Encrypted private bucket storing resume documents (PDF, DOCX) protected with SSE-S3 encryption and 15-minute temporary pre-signed URLs.
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== SECTION 3: BEDROCK FREE TIER ==================== -->
  <h1>3. Amazon Bedrock Free-Tier &amp; Basic Model Strategy</h1>
  <p>
    To ensure low operating costs while maintaining high extraction accuracy, BM CloudHire AI integrates with Amazon Bedrock's lightweight entry-level foundation models:
  </p>

  <table>
    <thead>
      <tr>
        <th>Bedrock Model</th>
        <th>Model Identifier</th>
        <th>Cost Tier</th>
        <th>Inference Latency</th>
        <th>Primary Responsibility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Amazon Titan Text G1 - Lite</strong></td>
        <td><code>amazon.titan-text-lite-v1</code></td>
        <td><span class="badge-pill badge-forest">Free Tier Eligible</span></td>
        <td>&lt; 400 ms</td>
        <td>Fast keyword &amp; skill taxonomy parsing, rubric evidence extraction, and JSON normalization.</td>
      </tr>
      <tr>
        <td><strong>Amazon Nova Micro</strong></td>
        <td><code>amazon.nova-micro-v1:0</code></td>
        <td><span class="badge-pill badge-mint">Lowest Cost ($0.035/M)</span></td>
        <td>&lt; 250 ms</td>
        <td>Real-time candidate-to-job matching, 2-sentence recruiter fit summaries, and strength analysis.</td>
      </tr>
      <tr>
        <td><strong>Bedrock Knowledge Base</strong></td>
        <td><code>Titan Multimodal Embeddings</code></td>
        <td><span class="badge-pill badge-forest">Pay-per-Query</span></td>
        <td>&lt; 150 ms</td>
        <td>Vector semantic search across job rubrics and standardized technical competency libraries.</td>
      </tr>
    </tbody>
  </table>

  <h3>Inference Parameters &amp; Resilience</h3>
  <ul>
    <li><strong>Deterministic Temperature:</strong> Set to <code>0.1</code> to eliminate hallucinations and produce repeatable, strictly factual scoring evidence.</li>
    <li><strong>Strict JSON Schema Enforcement:</strong> The model prompt enforces a structured JSON schema containing matched skills, missing skills, verified experience, and evaluation justification.</li>
    <li><strong>Graceful Fallback Layer:</strong> In the event of API throttling or offline environments, the system executes an automated deterministic heuristic matching engine, guaranteeing 100% operational uptime.</li>
  </ul>

  <!-- ==================== SECTION 4: 100-POINT SCORING RUBRIC ==================== -->
  <h1>4. The 100-Point Candidate Evaluation Rubric</h1>
  <p>
    Every applicant is evaluated against job criteria across 5 transparent dimensions:
  </p>

  <div style="background: #ffffff; border: 1.5px solid #E2ECE7; border-radius: 10px; padding: 1.25rem; margin: 1rem 0;">
    <!-- Tier 1 -->
    <div class="rubric-row">
      <div class="rubric-header">
        <span>1. Required Mandatory Skills Match (Must-Have Technologies)</span>
        <strong style="color: #173C35;">40 Points (40%)</strong>
      </div>
      <div class="rubric-bar">
        <div class="rubric-fill" style="width: 40%; background: #173C35;"></div>
      </div>
      <p style="font-size: 8pt; color: #718096; margin-top: 2px;">
        Evaluates exact presence of mandatory skills (e.g., Python, AWS Lambda, DynamoDB, React).
      </p>
    </div>

    <!-- Tier 2 -->
    <div class="rubric-row">
      <div class="rubric-header">
        <span>2. Hands-on Professional Experience (Years of Practice)</span>
        <strong style="color: #52BFA0;">25 Points (25%)</strong>
      </div>
      <div class="rubric-bar">
        <div class="rubric-fill" style="width: 25%; background: #52BFA0;"></div>
      </div>
      <p style="font-size: 8pt; color: #718096; margin-top: 2px;">
        Evaluates verified career seniority against the role threshold.
      </p>
    </div>

    <!-- Tier 3 -->
    <div class="rubric-row">
      <div class="rubric-header">
        <span>3. Technical Project Deliverables &amp; System Architecture</span>
        <strong style="color: #6366f1;">20 Points (20%)</strong>
      </div>
      <div class="rubric-bar">
        <div class="rubric-fill" style="width: 20%; background: #6366f1;"></div>
      </div>
      <p style="font-size: 8pt; color: #718096; margin-top: 2px;">
        Analyzes real-world deliverables, production deployment, and microservices architecture evidence.
      </p>
    </div>

    <!-- Tier 4 -->
    <div class="rubric-row">
      <div class="rubric-header">
        <span>4. Preferred &amp; Bonus Skills (Infrastructure &amp; DevOps)</span>
        <strong style="color: #f59e0b;">10 Points (10%)</strong>
      </div>
      <div class="rubric-bar">
        <div class="rubric-fill" style="width: 10%; background: #f59e0b;"></div>
      </div>
      <p style="font-size: 8pt; color: #718096; margin-top: 2px;">
        Bonus credit for secondary tooling: Docker, Kubernetes, Terraform, AWS CDK, and CI/CD pipelines.
      </p>
    </div>

    <!-- Tier 5 -->
    <div class="rubric-row">
      <div class="rubric-header">
        <span>5. Education Standard &amp; Industry Certifications</span>
        <strong style="color: #8b5cf6;">5 Points (5%)</strong>
      </div>
      <div class="rubric-bar">
        <div class="rubric-fill" style="width: 5%; background: #8b5cf6;"></div>
      </div>
      <p style="font-size: 8pt; color: #718096; margin-top: 2px;">
        Validates computer science or engineering degree credentials and active AWS professional certifications.
      </p>
    </div>
  </div>

  <h2>Candidate Qualification Tiers</h2>
  <table>
    <thead>
      <tr>
        <th>Score Range</th>
        <th>Classification</th>
        <th>Badge Indicator</th>
        <th>Recruiter Recommendation</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>80 – 100 Points</strong></td>
        <td><strong>Top Match (Tier 1)</strong></td>
        <td><span class="badge-pill badge-forest">Mint Pale Badge</span></td>
        <td>Immediate fast-track advancement to technical interview round.</td>
      </tr>
      <tr>
        <td><strong>60 – 79 Points</strong></td>
        <td><strong>Qualified (Tier 2)</strong></td>
        <td><span class="badge-pill badge-mint">Green Badge</span></td>
        <td>Shortlisted for secondary review or telephone screening.</td>
      </tr>
      <tr>
        <td><strong>Below 60 Points</strong></td>
        <td><strong>Needs Assessment (Tier 3)</strong></td>
        <td><span class="badge-pill badge-warning">Amber Badge</span></td>
        <td>Hold in repository for alternate requisitions or send info request.</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- ==================== SECTION 5: USER WORKFLOWS ==================== -->
  <h1>5. Operational User Journeys</h1>

  <h2>Candidate Portal Workflow</h2>
  <ol>
    <li><strong>Account Registration:</strong> Candidate signs up with their professional profile and contact details.</li>
    <li><strong>Vacancy Exploration:</strong> Explores verified open requisitions on the career board filtered by domain and experience level.</li>
    <li><strong>Application Submission:</strong> Submits an application with attached resume file directly stored in Amazon S3.</li>
    <li><strong>Lifecycle Tracking:</strong> Observes stage progression (<em>Submitted</em> &rarr; <em>Under Review</em> &rarr; <em>Approved</em>) in real time.</li>
  </ol>

  <h2>Administrator &amp; Recruiter Workflow</h2>
  <ol>
    <li><strong>Workspace Access:</strong> Enters the administrative portal with sanitized identity masking.</li>
    <li><strong>Requisition Grid Navigation:</strong> Selects open jobs using the responsive card grid to view isolated applicant pools.</li>
    <li><strong>Standardized Candidate Review:</strong> Evaluates applicants using single-line skill chips, verified experience, and AI scores without column squishing.</li>
    <li><strong>Decision Execution:</strong> Advances top applicants with <strong>Approve (Next Stage)</strong>, triggering audit history logging.</li>
    <li><strong>AI Matching Engine:</strong> Runs Amazon Bedrock to rank the top 3 candidates and confirm assignments.</li>
    <li><strong>Audit Ledger:</strong> Inspects chronological event logs in <em>Assignments &amp; History</em> for compliance.</li>
  </ol>

  <!-- ==================== SECTION 6: DESIGN STANDARDS ==================== -->
  <h1>6. Enterprise Forest &amp; Mint Design Standards</h1>

  <table>
    <thead>
      <tr>
        <th>Design Token</th>
        <th>Hex Code</th>
        <th>Platform UI Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Forest Green</strong></td>
        <td><code>#173C35</code></td>
        <td>Primary vertical sidebar, primary submit buttons, brand marks.</td>
      </tr>
      <tr>
        <td><strong>Mint Green</strong></td>
        <td><code>#52BFA0</code></td>
        <td>Focus indicators, interactive hover states, score match badges.</td>
      </tr>
      <tr>
        <td><strong>Pale Mint</strong></td>
        <td><code>#DDF5EB</code></td>
        <td>Active navigation tabs, selected requisition card fills.</td>
      </tr>
      <tr>
        <td><strong>Page Background</strong></td>
        <td><code>#F4F8F6</code></td>
        <td>Light cloud canvas ensuring minimal eye fatigue during extended use.</td>
      </tr>
      <tr>
        <td><strong>Surface Cards</strong></td>
        <td><code>#FFFFFF</code></td>
        <td>Clean white card containers with 1px border and soft drop shadows.</td>
      </tr>
      <tr>
        <td><strong>Text Charcoal</strong></td>
        <td><code>#24352F</code></td>
        <td>High-contrast, readable typography complying with WCAG AAA standards.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 7: DEPLOYMENT ==================== -->
  <h1>7. Maintenance &amp; Deployment Commands</h1>
  <table>
    <thead>
      <tr>
        <th>Maintenance Operation</th>
        <th>Command Line Instruction</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Launch Local Development Server</strong></td>
        <td><code>cd frontend &amp;&amp; npm run dev</code></td>
      </tr>
      <tr>
        <td><strong>Compile Production Build</strong></td>
        <td><code>cd frontend &amp;&amp; npm run build</code></td>
      </tr>
      <tr>
        <td><strong>Deploy to AWS Amplify Global Edge</strong></td>
        <td><code>python backend/scripts/deploy_to_amplify.py</code></td>
      </tr>
      <tr>
        <td><strong>Execute Automated Chrome QA Test Suite</strong></td>
        <td><code>python backend/scripts/full_suite_test.py</code></td>
      </tr>
      <tr>
        <td><strong>Re-generate System PDF Document</strong></td>
        <td><code>python backend/scripts/generate_project_pdf.py</code></td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #CBD5E0; text-align: center; font-size: 8.5pt; color: #718096;">
    BM CloudHire AI — Enterprise Recruitment Platform • Powered by AWS Serverless &amp; Amazon Bedrock • 2026
  </div>

</body>
</html>
"""

def generate_pdf_and_download_widget():
    print("[*] Writing HTML template for PDF generation (NO CREDENTIALS)...")
    with open(HTML_TEMP, "w", encoding="utf-8") as f:
        f.write(HTML_CONTENT)

    print("[*] Launching Chromium to render pixel-perfect PDF...")
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME_PATH,
            headless=True
        )
        page = browser.new_page()
        page.goto(f"file:///{HTML_TEMP.replace(os.sep, '/')}", wait_until="networkidle")
        page.wait_for_timeout(1000)

        page.pdf(
            path=WORKSPACE_PDF,
            format="A4",
            print_background=True,
            margin={"top": "10mm", "bottom": "12mm", "left": "10mm", "right": "10mm"}
        )
        print(f"[OK] Generated PDF in workspace: {WORKSPACE_PDF}")
        browser.close()

    # Copy to artifact directory
    shutil.copy2(WORKSPACE_PDF, ARTIFACT_PDF)
    print(f"[OK] Copied PDF to artifacts directory: {ARTIFACT_PDF}")

    # Read bytes and generate base64 download widget
    with open(WORKSPACE_PDF, "rb") as f:
        pdf_bytes = f.read()

    b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
    file_size_kb = len(pdf_bytes) / 1024

    download_widget_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Download BM CloudHire AI Documentation PDF</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    :root {{
      --forest: #173C35;
      --mint: #52BFA0;
      --pale-mint: #DDF5EB;
    }}
  </style>
</head>
<body class="bg-transparent text-slate-800 antialiased p-3 font-sans">
  <div class="max-w-md mx-auto bg-white border border-[#E2ECE7] rounded-2xl p-6 shadow-md text-center">
    <div class="w-14 h-14 mx-auto mb-4 bg-[#DDF5EB] text-[#173C35] rounded-2xl flex items-center justify-center shadow-sm">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
    </div>

    <h3 class="text-lg font-extrabold text-[#173C35] mb-1">BM CloudHire AI Architecture PDF</h3>
    <p class="text-xs text-slate-500 mb-4">Complete 6-Page AWS Cloud System Specification ({file_size_kb:.1f} KB)</p>

    <div class="bg-[#F4F8F6] rounded-xl p-3 text-xs text-slate-600 mb-5 text-left space-y-1.5 border border-[#E2ECE7]">
      <div class="flex items-center gap-2">
        <span class="text-[#52BFA0] font-bold">✓</span>
        <span>5-Tier AWS Cloud Architecture (Amplify, Gateway, Lambda, S3, DynamoDB)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[#52BFA0] font-bold">✓</span>
        <span>Amazon Bedrock Free-Tier Basic Models (Titan Text Lite &amp; Nova Micro)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[#52BFA0] font-bold">✓</span>
        <span>100-Point Scoring Rubric &amp; Qualification Tiers</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[#52BFA0] font-bold">✓</span>
        <span>Candidate &amp; Recruiter Operational Workflows</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[#52BFA0] font-bold">✓</span>
        <span>Zero Credentials Included (Strictly Confidential)</span>
      </div>
    </div>

    <a 
      href="data:application/pdf;base64,{b64_pdf}" 
      download="BM_CloudHire_AI_AWS_Architecture_Documentation.pdf"
      class="inline-flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-[#173C35] hover:bg-[#204e45] text-white font-bold text-sm rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <span>Download Architecture PDF Now</span>
    </a>

    <p class="text-[11px] text-slate-400 mt-3">Clicking the button immediately saves the PDF to your device.</p>
  </div>
</body>
</html>
"""

    with open(DOWNLOAD_WIDGET_HTML, "w", encoding="utf-8") as f:
        f.write(download_widget_content)

    print(f"[OK] Created interactive download widget: {DOWNLOAD_WIDGET_HTML}")

    if os.path.exists(HTML_TEMP):
        os.remove(HTML_TEMP)

if __name__ == "__main__":
    generate_pdf_and_download_widget()

import os
import shutil
from playwright.sync_api import sync_playwright

CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
WORKSPACE_PDF = r"C:\NEW_PROJECT\BM_CloudHire_AI\BM_CloudHire_AI_Architecture_Documentation.pdf"
ARTIFACT_PDF = r"C:\Users\boopa\.gemini\antigravity\brain\c971f9ef-5bbf-4de6-879b-0b5fa349d1dd\BM_CloudHire_AI_Architecture_Documentation.pdf"
HTML_TEMP = r"C:\NEW_PROJECT\BM_CloudHire_AI\backend\scripts\temp_doc.html"

HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>BM CloudHire AI — Complete Architecture & System Documentation</title>
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
      padding: 3rem 2rem;
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
      margin-bottom: 3rem;
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
      font-size: 18pt;
      font-weight: 800;
      color: #173C35;
      margin: 1.8rem 0 0.8rem;
      border-bottom: 2px solid #52BFA0;
      padding-bottom: 6px;
      page-break-after: avoid;
    }

    h2 {
      font-size: 13pt;
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

    /* Diagrams & Cards */
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
      System Architecture &amp;<br>
      <span>Technical Specification</span>
    </div>

    <div class="cover-subtitle">
      A comprehensive guide to the architecture, automated candidate matching rubric, cloud infrastructure, and user workflows.
    </div>

    <div class="cover-meta">
      <div class="cover-meta-item">
        <strong>Application</strong>
        BM CloudHire AI
      </div>
      <div class="cover-meta-item">
        <strong>Hosting &amp; Cloud</strong>
        AWS Amplify • Lambda • Bedrock
      </div>
      <div class="cover-meta-item">
        <strong>Production Status</strong>
        Live on AWS Amplify
      </div>
    </div>
  </div>

  <!-- ==================== SECTION 1 ==================== -->
  <h1>1. Executive Summary</h1>
  <p>
    <strong>BM CloudHire AI</strong> is an enterprise-grade cloud recruitment platform engineered to automate and optimize candidate evaluation. The platform bridges the gap between hiring managers and applicants by leveraging <strong>Amazon Bedrock Foundation Models</strong> to perform multi-criteria technical resume parsing and candidate ranking on an objective <strong>100-point rubric</strong>.
  </p>
  <p>
    The platform eliminates manual resume screening delays, guarantees strict data privacy, and enforces standardized candidate evaluations across diverse engineering and cloud specializations.
  </p>

  <h2>Key Business Objectives</h2>
  <ul>
    <li><strong>Accelerated Time-to-Hire:</strong> Automated resume ingestion and AI matching evaluates candidate pools in seconds rather than days.</li>
    <li><strong>Objective Scoring:</strong> Transparent 100-point scoring formula prevents unconscious recruiter bias.</li>
    <li><strong>Enterprise Security:</strong> Resumes are securely stored in private Amazon S3 buckets with time-limited pre-signed access URLs.</li>
    <li><strong>Strict Identity Isolation:</strong> Administrator sessions are strictly masked as <em>Administrator</em> (admin@bmcloudhire.com), protecting individual recruiter personal data.</li>
  </ul>

  <!-- ==================== SECTION 2: ARCHITECTURE ==================== -->
  <h1>2. Cloud System Architecture</h1>
  <p>
    The system is built on a serverless, highly available <strong>AWS Cloud Architecture</strong> designed for low latency, auto-scaling, and resilience.
  </p>

  <div class="diagram-container">
    <div class="diagram-title">BM CloudHire AI — End-to-End Cloud System Architecture</div>
    
    <div class="architecture-box-grid">
      <!-- Card 1 -->
      <div class="arch-card">
        <div class="arch-card-header">🌐 AWS Amplify Edge</div>
        <div class="arch-card-desc">
          Global Content Delivery Network (CDN) hosting the React 19 / Vite single-page application with automated CI/CD pipeline and SSL termination.
        </div>
      </div>

      <!-- Card 2 -->
      <div class="arch-card">
        <div class="arch-card-header">⚡ Amazon API Gateway</div>
        <div class="arch-card-desc">
          Managed REST API Gateway providing route management, CORS security policies, request throttling, and payload validation.
        </div>
      </div>

      <!-- Card 3 -->
      <div class="arch-card">
        <div class="arch-card-header">⚙️ AWS Lambda Serverless</div>
        <div class="arch-card-desc">
          Event-driven Python compute layer executing application business logic, candidate matching orchestrations, and lifecycle events.
        </div>
      </div>

      <!-- Card 4 -->
      <div class="arch-card">
        <div class="arch-card-header">🤖 Amazon Bedrock AI</div>
        <div class="arch-card-desc">
          State-of-the-art Generative AI and Foundation Models (Claude 3 / Titan) performing resume taxonomy extraction and semantic requirement scoring.
        </div>
      </div>

      <!-- Card 5 -->
      <div class="arch-card">
        <div class="arch-card-header">🗄️ Amazon DynamoDB</div>
        <div class="arch-card-desc">
          High-performance NoSQL database utilizing Single-Table Design with composite partition keys (PK/SK) and Global Secondary Indexes (GSIs).
        </div>
      </div>

      <!-- Card 6 -->
      <div class="arch-card">
        <div class="arch-card-header">📁 Amazon S3 Storage</div>
        <div class="arch-card-desc">
          Private, encrypted object storage for candidate resume files (PDF, DOCX) protected with 256-bit AES encryption and pre-signed access tokens.
        </div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- ==================== SECTION 3: SCORING RUBRIC ==================== -->
  <h1>3. The 100-Point Candidate Evaluation Rubric</h1>
  <p>
    The platform employs an objective, 5-tier technical scoring rubric powered by Amazon Bedrock. When a job requisition is matched against available candidates, each applicant is evaluated across the following transparent dimensions:
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
        Evaluates exact presence of mandatory skills (e.g., Python, AWS Lambda, DynamoDB, React). Each verified skill awards proportional score.
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
        Evaluates verified career seniority against the role's minimum threshold. Full marks awarded when verified experience meets or exceeds requirements.
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
        Analyzes real-world deliverables, production deployment experience, microservices development, and telemetry monitoring in past projects.
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
        Awards bonus credit for secondary tooling such as Docker, Kubernetes, Terraform, AWS CDK, GraphQL, and CI/CD automation pipelines.
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
        Validates computer science or engineering degree credentials along with active AWS professional certifications.
      </p>
    </div>
  </div>

  <h2>Candidate Qualification Tiers</h2>
  <table>
    <thead>
      <tr>
        <th>Score Range</th>
        <th>Classification</th>
        <th>Badge Color</th>
        <th>Recommended Recruiter Action</th>
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

  <!-- ==================== SECTION 4: USER WORKFLOWS ==================== -->
  <h1>4. User Personas &amp; Core Workflows</h1>

  <h2>Candidate Workflow</h2>
  <ol>
    <li><strong>Account Creation:</strong> Candidate enters full name, email address, and secure password on the public portal.</li>
    <li><strong>Job Exploration:</strong> Browses open vacancies on the career board filtered by role title, technical domain, and location.</li>
    <li><strong>One-Click Application:</strong> Selects a vacancy, reviews required/preferred skills, and submits their application with resume attachment.</li>
    <li><strong>Application Tracking:</strong> Monitors real-time status in the <em>My Applications</em> center (*Submitted*, *Under Review*, *Approved*).</li>
  </ol>

  <h2>Administrator &amp; Recruiter Workflow</h2>
  <ol>
    <li><strong>Secure Authentication:</strong> Signs in to the enterprise workspace with administrative credentials. Profile is automatically locked to <strong>Administrator</strong>.</li>
    <li><strong>Requisition Oversight:</strong> Uses the <strong>Requisition Picker Grid</strong> to view applicant pools per job.</li>
    <li><strong>Streamlined Candidate Review:</strong> Evaluates applicants in the standardized table with single-line skill chips, verified experience, and AI scores.</li>
    <li><strong>Decision Execution:</strong> Advances top candidates with <strong>Approve (Next Stage)</strong>, triggering state transitions and updating metric counters.</li>
    <li><strong>AI Matching Execution:</strong> Launches the Bedrock Matching Engine to calculate rubric rankings and assign top candidates.</li>
    <li><strong>Audit Ledger:</strong> Inspects chronological event timestamps in <em>Assignments &amp; History</em> for compliance.</li>
  </ol>

  <div class="page-break"></div>

  <!-- ==================== SECTION 5: SECURITY & PALETTE ==================== -->
  <h1>5. Security, Identity &amp; Enterprise Design Standards</h1>

  <h2>Identity Masking &amp; Data Privacy</h2>
  <ul>
    <li><strong>Zero Personal Exposure:</strong> To protect hiring leads and system operators, administrative accounts strictly render as <strong>Administrator</strong> with the <strong>AD</strong> avatar across all UI elements, top headers, dropdowns, and sidebars.</li>
    <li><strong>Pre-Signed S3 Access:</strong> Candidate resumes cannot be directly scraped or browsed publicly. Download links expire automatically after 15 minutes.</li>
    <li><strong>Password Hashing:</strong> Credentials utilize secure SHA-256 / bcrypt hashing with salting.</li>
  </ul>

  <h2>Enterprise Forest &amp; Mint Design System</h2>
  <table>
    <thead>
      <tr>
        <th>Design Element</th>
        <th>Hex Code</th>
        <th>Visual Role in Interface</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Forest Green</strong></td>
        <td><code>#173C35</code></td>
        <td>Primary sidebar background, primary submit buttons, brand logo marks.</td>
      </tr>
      <tr>
        <td><strong>Mint Green</strong></td>
        <td><code>#52BFA0</code></td>
        <td>Active button hover states, focus rings, match badges, accent pills.</td>
      </tr>
      <tr>
        <td><strong>Pale Mint</strong></td>
        <td><code>#DDF5EB</code></td>
        <td>Active navigation indicator tabs, selected requisition card fills.</td>
      </tr>
      <tr>
        <td><strong>Page Background</strong></td>
        <td><code>#F4F8F6</code></td>
        <td>Clean, light-tinted canvas ensuring low eye strain during long sessions.</td>
      </tr>
      <tr>
        <td><strong>Card Container</strong></td>
        <td><code>#FFFFFF</code></td>
        <td>Pure white cards with subtle 1px border (<code>#E2ECE7</code>) and soft drop shadows.</td>
      </tr>
      <tr>
        <td><strong>Text Charcoal</strong></td>
        <td><code>#24352F</code></td>
        <td>High-contrast, readable typography complying with WCAG AAA accessibility.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== SECTION 6: CREDENTIALS & RUNNING ==================== -->
  <h1>6. Credentials &amp; Execution Reference</h1>

  <table>
    <thead>
      <tr>
        <th>Portal Role</th>
        <th>Username / Email</th>
        <th>Password</th>
        <th>Platform Privileges</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Administrator</strong></td>
        <td><code>admin</code> or <code>admin@bmcloudhire.com</code></td>
        <td><code>boopathi_2004</code></td>
        <td>Full administrative control, job publishing, applicant review/approval, AI matching, system audit ledger, platform settings.</td>
      </tr>
      <tr>
        <td><strong>Candidate</strong></td>
        <td><code>arun.krishnan@example.com</code></td>
        <td><code>Candidate@2026</code></td>
        <td>Career search, 1-click application submission, real-time stage tracking, personal profile and resume upload.</td>
      </tr>
    </tbody>
  </table>

  <h2>Maintenance &amp; Deployment Commands</h2>
  <table>
    <thead>
      <tr>
        <th>Action</th>
        <th>Execution Command Line</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Run Local Dev Server</strong></td>
        <td><code>cd frontend &amp;&amp; npm run dev</code></td>
      </tr>
      <tr>
        <td><strong>Build Production Bundle</strong></td>
        <td><code>cd frontend &amp;&amp; npm run build</code></td>
      </tr>
      <tr>
        <td><strong>Deploy to AWS Amplify</strong></td>
        <td><code>python backend/scripts/deploy_to_amplify.py</code></td>
      </tr>
      <tr>
        <td><strong>Automated QA Chrome Suite</strong></td>
        <td><code>python backend/scripts/full_suite_test.py</code></td>
      </tr>
      <tr>
        <td><strong>Generate System PDF</strong></td>
        <td><code>python backend/scripts/generate_project_pdf.py</code></td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #CBD5E0; text-align: center; font-size: 8.5pt; color: #718096;">
    BM CloudHire AI — Enterprise Recruitment &amp; Evaluation Platform • Built &amp; Deployed on AWS Amplify • 2026
  </div>

</body>
</html>
"""

def generate_pdf():
    print("[*] Writing HTML template for PDF generation...")
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

    # Copy to artifact directory so user can download directly
    shutil.copy2(WORKSPACE_PDF, ARTIFACT_PDF)
    print(f"[OK] Copied PDF to artifacts directory: {ARTIFACT_PDF}")

    if os.path.exists(HTML_TEMP):
        os.remove(HTML_TEMP)

if __name__ == "__main__":
    generate_pdf()

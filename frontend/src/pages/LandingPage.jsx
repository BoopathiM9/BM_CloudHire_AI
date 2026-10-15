import React from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "../components/BrandLogo";
import { 
  Briefcase, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Search, 
  Lock, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function LandingPage({ setActiveTab, onOpenAuth }) {
  const { publishedJobs, setSelectedJobId, currentUser } = useApp();

  const handleApplyClick = (jobId) => {
    setSelectedJobId(jobId);
    setActiveTab("find-jobs");
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="text-primary" />
          <span>Next-Generation Talent Acquisition Platform</span>
        </div>

        <h1 className="hero-title">
          Intelligent Recruitment. <br />
          <span className="hero-gradient-text">Better Decisions.</span>
        </h1>

        <p className="hero-description">
          BM CloudHire AI combines automated resume analysis, deterministic 100-point 
          scoring, and strict talent pool exclusion rules to eliminate recruiter bias, prevent double-booking, 
          and match elite cloud engineering talent with open requisitions.
        </p>

        {/* Dual Portal Gateway Section in Hero */}
        {!currentUser ? (
          <div className="hero-portal-cards-grid mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            {/* 1. Candidate Gateway */}
            <div className="card p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center font-bold">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Candidate Portal</h3>
                  <span className="text-xs text-muted">Apply for Jobs & Track Approval</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Register or log in using your email and password to browse verified cloud engineering roles, submit your resume, and track real-time application status.
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onOpenAuth("candidate-login")}
                  className="btn btn-primary btn-sm flex-1"
                >
                  Candidate Sign In
                </button>
                <button 
                  onClick={() => onOpenAuth("candidate-register")}
                  className="btn btn-outline btn-sm flex-1"
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* 2. Admin Gateway */}
            <div className="card p-6 bg-slate-900 text-white border border-slate-800 shadow-sm hover:shadow-md transition rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-800 text-blue-400 flex items-center justify-center font-bold">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Admin Portal</h3>
                  <span className="text-xs text-slate-400">Approvals & Job Management</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Sign in with administrative credentials to review pending candidate applications, grant 1-click approvals, and create new requisitions.
              </p>
              <div className="text-[11px] bg-slate-800/80 p-2 rounded text-slate-300 font-mono mb-3">
                Username: <strong className="text-blue-300">admin</strong> | Password: <strong className="text-blue-300">boopathi_2004</strong>
              </div>
              <button 
                onClick={() => onOpenAuth("recruiter-login")}
                className="btn btn-light btn-sm w-full font-semibold flex items-center justify-center gap-1.5"
                style={{ background: '#ffffff', color: '#0f172a' }}
              >
                <Lock size={13} />
                <span>Sign In as Admin</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="hero-actions mt-4">
            <button 
              onClick={() => setActiveTab(currentUser.role === "RECRUITER" ? "applications" : "find-jobs")} 
              className="btn btn-primary btn-lg"
            >
              <span>{currentUser.role === "RECRUITER" ? "Open Applications & Approvals" : "Browse Available Jobs"}</span>
              <ArrowRight size={18} />
            </button>
            {currentUser.role === "CANDIDATE" && (
              <button 
                onClick={() => setActiveTab("my-applications")} 
                className="btn btn-outline btn-lg"
              >
                <FileCheck2 size={18} />
                <span>My Applications</span>
              </button>
            )}
          </div>
        )}

        {/* Live Metrics Pill Strip */}
        <div className="hero-metrics-strip">
          <div className="metric-pill">
            <span className="metric-num">{publishedJobs.length}</span>
            <span className="metric-label">Published Roles</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-pill">
            <span className="metric-num">100%</span>
            <span className="metric-label">Transparent Rubric</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-pill">
            <span className="metric-num">Zero</span>
            <span className="metric-label">Demographic Bias</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-pill">
            <span className="metric-num">Atomic</span>
            <span className="metric-label">Talent Exclusivity</span>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="pillars-section">
        <div className="section-header">
          <div className="section-subtitle">PLATFORM CAPABILITIES</div>
          <h2 className="section-title">Engineered for Transparency & Precision</h2>
          <p className="section-description">
            Traditional ATS keyword searching produces false positives and repetitive recruiter fatigue. 
            BM CloudHire AI introduces objective, mathematical evaluation.
          </p>
        </div>

        <div className="pillars-grid">
          {/* Card 1: 100-Point Rubric */}
          <div className="pillar-card">
            <div className="pillar-icon bg-blue-subtle text-primary">
              <SlidersHorizontal size={24} />
            </div>
            <h3>Deterministic 100-Point Scoring</h3>
            <p>
              Candidates are evaluated using an unalterable mathematical rubric: 
              <strong> 40% Required Skills</strong>, <strong>25% Experience</strong>, 
              <strong> 20% Technical Projects</strong>, <strong>10% Preferred Skills</strong>, 
              and <strong>5% Education & Certs</strong>.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-success">Zero Model Hallucination</span>
            </div>
          </div>

          {/* Card 2: Exclusion Rule */}
          <div className="pillar-card">
            <div className="pillar-icon bg-purple-subtle text-purple">
              <ShieldCheck size={24} />
            </div>
            <h3>Strict Talent Exclusion Rule</h3>
            <p>
              Once a candidate is confirmed for an open requisition, the backend atomically locks their record. 
              They are <strong>100% excluded</strong> from subsequent job match pools until explicitly released by the hiring lead.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-primary">Atomic Conditional Writes</span>
            </div>
          </div>

          {/* Card 3: In-Memory Parsing & Storage */}
          <div className="pillar-card">
            <div className="pillar-icon bg-emerald-subtle text-success">
              <Cpu size={24} />
            </div>
            <h3>Private S3 & In-Memory Parsing</h3>
            <p>
              Uploaded resumes (PDF/DOCX) are securely stored in private cloud buckets with Block Public Access 
              enabled, SHA-256 deduplication, and zero demographic metadata leakage.
            </p>
            <div className="pillar-footer">
              <span className="badge badge-success">SHA-256 Deduplication</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Open Roles Preview */}
      <section className="featured-jobs-section">
        <div className="section-header-flex">
          <div>
            <div className="section-subtitle">OPPORTUNITIES</div>
            <h2 className="section-title">Featured Open Positions</h2>
            <p className="section-description">
              Verified active requisitions currently accepting applications.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab("find-jobs")} 
            className="btn btn-outline"
          >
            <span>View All ({publishedJobs.length})</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="jobs-preview-grid">
          {publishedJobs.slice(0, 3).map((job) => (
            <div key={job.id || job.jobId} className="featured-job-card">
              <div className="job-card-header">
                <div>
                  <span className="job-company">{job.company || "Enterprise Cloud"}</span>
                  <h3 className="job-title-h3">{job.title}</h3>
                </div>
                <span className="badge badge-success">Open</span>
              </div>

              <div className="job-card-meta">
                <span>📍 {job.location || "Remote"}</span>
                <span>💼 {job.type || "Full-Time"}</span>
                <span>⏱️ {job.minExperienceYears}+ Years Exp</span>
              </div>

              <p className="job-card-desc">
                {job.description ? job.description.slice(0, 140) + "..." : ""}
              </p>

              <div className="job-skills-wrap">
                {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="badge badge-subtle">{skill}</span>
                ))}
              </div>

              <div className="job-card-action">
                <button 
                  onClick={() => handleApplyClick(job.id || job.jobId)}
                  className="btn btn-primary btn-block"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dual Portal Gateway Section */}
      <section className="portal-gateway-section">
        <div className="portal-box portal-candidate">
          <div className="portal-box-content">
            <div className="portal-badge">FOR APPLICANTS</div>
            <h3>Candidate Career Portal</h3>
            <p>
              Search verified cloud engineering positions, submit applications with resume parsing, 
              and track real-time hiring stage progress without opaque recruiter silences.
            </p>
            <div className="portal-buttons">
              <button 
                onClick={() => setActiveTab("find-jobs")} 
                className="btn btn-primary"
              >
                <span>Find Jobs</span>
                <Search size={16} />
              </button>
              {!currentUser && (
                <button 
                  onClick={() => onOpenAuth("candidate-login")} 
                  className="btn btn-outline"
                >
                  <span>Candidate Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="portal-box portal-recruiter">
          <div className="portal-box-content">
            <div className="portal-badge recruiter-badge">FOR HIRING TEAMS</div>
            <h3>Admin & Recruiter Portal</h3>
            <p>
              Manage job requisitions, review incoming applications, run Bedrock-grounded 100-point candidate 
              scoring, and manage candidate assignments with strict exclusivity.
            </p>
            <div className="portal-buttons">
              <button 
                onClick={() => {
                  if (currentUser?.role === "RECRUITER") {
                    setActiveTab("dashboard");
                  } else {
                    onOpenAuth("recruiter-login");
                  }
                }} 
                className="btn btn-dark"
              >
                <Lock size={16} />
                <span>Access Recruiter Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-wrap">
            <BrandLogo size="default" />
            <p className="footer-tagline">Intelligent Recruitment. Better Decisions.</p>
            <p className="footer-sub">
              Deterministic AI matching platform compliant with zero-bias audit standards.
            </p>
          </div>

          <div className="footer-links-wrap">
            <div className="footer-col">
              <h4>Candidate Portal</h4>
              <button onClick={() => setActiveTab("find-jobs")}>Find Open Jobs</button>
              <button onClick={() => onOpenAuth("candidate-login")}>Candidate Sign In</button>
              <button onClick={() => onOpenAuth("candidate-register")}>Create Account</button>
              <button onClick={() => setActiveTab("my-applications")}>Track Applications</button>
            </div>

            <div className="footer-col">
              <h4>Recruiter Portal</h4>
              <button onClick={() => onOpenAuth("recruiter-login")}>Recruiter Login</button>
              <button onClick={() => setActiveTab("dashboard")}>Executive Dashboard</button>
              <button onClick={() => setActiveTab("jobs")}>Job Requisitions</button>
              <button onClick={() => setActiveTab("matching")}>AI Candidate Matching</button>
            </div>

            <div className="footer-col">
              <h4>Compliance & Security</h4>
              <span className="footer-note">S3 Block Public Access: Active</span>
              <span className="footer-note">DynamoDB Exclusion: Enforced</span>
              <span className="footer-note">Bedrock Nova Micro: Grounded</span>
              <span className="footer-note">SHA-256 Deduplication: Active</span>
            </div>
          </div>
        </div>

          <div className="footer-bottom">
            <span>© 2026 BM CloudHire AI. All rights reserved.</span>
            <span>Version 2.0 Enterprise SaaS</span>
          </div>
      </footer>
    </div>
  );
}

import React from "react";
import { useApp } from "../context/AppContext";
import { 
  UserCheck, 
  UserX, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  FileText,
  ChevronRight
} from "lucide-react";

export default function Dashboard({ setActiveTab }) {
  const { 
    candidates, 
    availableCandidates, 
    assignedCandidates, 
    jobs, 
    recentActivity, 
    selectedJob, 
    setSelectedJobId
  } = useApp();

  const total = candidates.length;
  const availCount = availableCandidates.length;
  const asgnCount = assignedCandidates.length;
  const availPercentage = total > 0 ? Math.round((availCount / total) * 100) : 0;
  const asgnPercentage = total > 0 ? Math.round((asgnCount / total) * 100) : 0;

  const workflowSteps = [
    { number: "01", title: "Create Job Description", desc: "Define role details, mandatory skills, and weighting criteria.", tab: "jobs" },
    { number: "02", title: "Upload Resumes", desc: "Ingest PDF or DOCX candidate files with automatic deduplication.", tab: "resumes" },
    { number: "03", title: "Analyze Matches", desc: "Evaluate competencies against evidence with transparent scoring.", tab: "matching" },
    { number: "04", title: "Confirm Top Three", desc: "Review top-ranked candidates, insights, and confirm selection.", tab: "matching" },
    { number: "05", title: "Track Assignments", desc: "Exclude assigned talent from future roles and audit hiring history.", tab: "history" }
  ];

  return (
    <div className="page-container">
      {/* 1. Welcome Section */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-badge">
            <span className="badge-sparkle">
              <Sparkles size={14} />
            </span>
            <span>Intelligent Recruitment. Better Decisions.</span>
          </div>

          <h1 className="welcome-title">Intelligent Recruitment, Simplified</h1>
          <p className="welcome-description">
            Analyze resumes, discover top candidates, and manage job assignments with AI-powered insights.
            Ensure fair, evidence-based candidate scoring with zero duplicate hiring reuse.
          </p>

          <div className="welcome-actions">
            <button 
              onClick={() => setActiveTab("matching")} 
              className="btn-primary-large"
            >
              <Sparkles size={17} />
              <span>Start Candidate Matching</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => setActiveTab("jobs")} 
              className="btn-secondary-large"
            >
              <Briefcase size={17} />
              <span>Manage Jobs</span>
            </button>
          </div>

          {/* Business Capability Tags */}
          <div className="capability-tags-row">
            <span className="cap-tag">AI Resume Analysis</span>
            <span className="cap-tag">Secure Resume Storage</span>
            <span className="cap-tag">Candidate Matching Engine</span>
            <span className="cap-tag">Smart Ranking</span>
            <span className="cap-tag">Candidate Assignment</span>
          </div>
        </div>
      </section>

      {/* 2. Summary Metrics */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Resumes</span>
            <div className="metric-icon-box blue">
              <FileText size={19} />
            </div>
          </div>
          <div className="metric-value">{total}</div>
          <div className="metric-caption">Indexed candidate repository</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Available Candidates</span>
            <div className="metric-icon-box green">
              <UserCheck size={19} />
            </div>
          </div>
          <div className="metric-value text-green">{availCount}</div>
          <div className="metric-caption">{availPercentage}% of total talent pool</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Assigned Candidates</span>
            <div className="metric-icon-box purple">
              <UserX size={19} />
            </div>
          </div>
          <div className="metric-value text-purple">{asgnCount}</div>
          <div className="metric-caption">Excluded from subsequent roles</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Job Descriptions</span>
            <div className="metric-icon-box indigo">
              <Briefcase size={19} />
            </div>
          </div>
          <div className="metric-value">{jobs.length}</div>
          <div className="metric-caption">Requisitions ready for matching</div>
        </div>
      </section>

      {/* 3. Candidate Pool Allocation & Exclusion Status */}
      <section className="card mb-6">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Candidate Pool Allocation & Exclusion Status</h3>
            <p className="card-subtitle">
              Visualizes talent availability under the business rule: assigned candidates are automatically excluded from subsequent requisitions.
            </p>
          </div>
          <span className="badge-status-neutral">
            {availCount} Available &bull; {asgnCount} Assigned
          </span>
        </div>

        <div className="allocation-track">
          <div 
            className="allocation-bar available" 
            style={{ width: `${availPercentage}%` }}
            title={`Available: ${availCount} candidates`}
          >
            {availPercentage > 12 && `${availCount} Available`}
          </div>
          <div 
            className="allocation-bar assigned" 
            style={{ width: `${asgnPercentage}%` }}
            title={`Assigned: ${asgnCount} candidates`}
          >
            {asgnPercentage > 8 && `${asgnCount} Assigned`}
          </div>
        </div>

        <div className="allocation-legend">
          <div className="legend-item">
            <span className="legend-indicator available"></span>
            <span>Available for Next Job Selection ({availCount})</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator assigned"></span>
            <span>Assigned & Excluded from Matching ({asgnCount})</span>
          </div>
        </div>
      </section>

      {/* 4. Getting Started 5-Step Workflow */}
      <section className="card mb-6">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Standard Recruitment Workflow</h3>
            <p className="card-subtitle">
              Follow this structured 5-step process to review and assign top talent with full auditability.
            </p>
          </div>
        </div>

        <div className="workflow-steps-grid">
          {workflowSteps.map((step) => (
            <div 
              key={step.number} 
              className="workflow-step-card"
              onClick={() => setActiveTab(step.tab)}
            >
              <div className="step-num">{step.number}</div>
              <h4 className="step-title">{step.title}</h4>
              <p className="step-desc">{step.desc}</p>
              <div className="step-link">
                <span>Proceed</span>
                <ChevronRight size={13} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Two-Column Layout: Saved Jobs & Recent Activity */}
      <div className="grid-2-col">
        {/* Saved Jobs List */}
        <section className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Job Requisitions</h3>
              <p className="card-subtitle">Select any opening to initiate candidate matching</p>
            </div>
            <button onClick={() => setActiveTab("jobs")} className="btn-link">
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="compact-jobs-list">
            {jobs.map((job) => (
              <div 
                key={job.id || job.jobId} 
                className={`compact-job-card ${(selectedJob?.id === job.id || selectedJob?.jobId === job.jobId) ? "selected" : ""}`}
                onClick={() => setSelectedJobId(job.id || job.jobId)}
              >
                <div className="compact-job-info">
                  <div className="compact-job-title-row">
                    <span className="compact-job-title">{job.title}</span>
                    {(selectedJob?.id === job.id || selectedJob?.jobId === job.jobId) && (
                      <span className="badge-active-mini">Active</span>
                    )}
                  </div>
                  <div className="compact-job-meta">
                    <span>{job.company || "Enterprise Client"}</span> &bull; <span>Min {job.minExperienceYears || 2} yrs experience</span>
                  </div>
                  <div className="compact-skills-row">
                    {(job.requiredSkills || []).slice(0, 3).map((s, idx) => (
                      <span key={idx} className="skill-tag-micro">{s}</span>
                    ))}
                    {(job.requiredSkills || []).length > 3 && (
                      <span className="skill-tag-micro count">+{(job.requiredSkills || []).length - 3}</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJobId(job.id || job.jobId);
                    setActiveTab("matching");
                  }}
                  className="btn-match-compact"
                  title="Match candidates for this job"
                >
                  <Sparkles size={14} />
                  <span>Match</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Recent Recruitment Activity</h3>
              <p className="card-subtitle">Chronological ledger of matching and assignment events</p>
            </div>
            <Clock size={16} className="text-muted" />
          </div>

          <div className="activity-stream">
            {recentActivity.map((act) => (
              <div key={act.id} className="activity-row">
                <div className={`activity-bullet ${act.type}`}></div>
                <div className="activity-body">
                  <div className="activity-msg">{act.text}</div>
                  <div className="activity-timestamp">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

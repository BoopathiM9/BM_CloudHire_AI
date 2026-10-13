import React from "react";
import { useApp } from "../context/AppContext";
import { 
  UserCheck, 
  UserX, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  FileText,
  CheckCircle2
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

  return (
    <div className="page-container">
      {/* 1. Clean Developer Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Overview</h2>
          <p className="page-sub-heading">
            Candidate repository, active job openings, and talent assignments.
          </p>
        </div>

        <div className="header-actions-clean">
          <button 
            onClick={() => setActiveTab("matching")} 
            className="btn-primary"
          >
            <span>Match Candidates</span>
            <ArrowRight size={15} />
          </button>

          <button 
            onClick={() => setActiveTab("resumes")} 
            className="btn-secondary"
          >
            <FileText size={15} />
            <span>Upload Resumes</span>
          </button>

          <button 
            onClick={() => setActiveTab("jobs")} 
            className="btn-secondary"
          >
            <Briefcase size={15} />
            <span>New Job</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Candidates</span>
            <div className="metric-icon-box blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="metric-value">{total}</div>
          <div className="metric-caption">{availCount} available &bull; {asgnCount} assigned</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Available Pool</span>
            <div className="metric-icon-box green">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="metric-value text-green">{availCount}</div>
          <div className="metric-caption">{availPercentage}% ready for matching</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Assigned</span>
            <div className="metric-icon-box purple">
              <UserX size={18} />
            </div>
          </div>
          <div className="metric-value text-purple">{asgnCount}</div>
          <div className="metric-caption">Excluded from future roles</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Jobs</span>
            <div className="metric-icon-box indigo">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="metric-value">{jobs.length}</div>
          <div className="metric-caption">Open requisitions</div>
        </div>
      </section>

      {/* 3. Candidate Pool Allocation Progress Bar */}
      <section className="card mb-6">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Talent Pool Status</h3>
            <p className="card-subtitle">
              Assigned candidates are excluded from future matching runs to prevent duplicate hiring.
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
            title={`Available: ${availCount}`}
          >
            {availPercentage > 10 && `${availCount} Available`}
          </div>
          <div 
            className="allocation-bar assigned" 
            style={{ width: `${asgnPercentage}%` }}
            title={`Assigned: ${asgnCount}`}
          >
            {asgnPercentage > 8 && `${asgnCount} Assigned`}
          </div>
        </div>

        <div className="allocation-legend">
          <div className="legend-item">
            <span className="legend-indicator available"></span>
            <span>Available ({availCount})</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator assigned"></span>
            <span>Assigned &amp; Excluded ({asgnCount})</span>
          </div>
        </div>
      </section>

      {/* 4. Two-Column Layout: Jobs & Activity */}
      <div className="grid-2-col">
        {/* Open Job Requisitions */}
        <section className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Open Jobs ({jobs.length})</h3>
              <p className="card-subtitle">Select a role to run candidate matching</p>
            </div>
            <button onClick={() => setActiveTab("jobs")} className="btn-link">
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="compact-jobs-list">
            {jobs.map((job) => {
              const isSelected = (selectedJob?.id === job.id || selectedJob?.jobId === job.jobId);
              return (
                <div 
                  key={job.id || job.jobId} 
                  className={`compact-job-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedJobId(job.id || job.jobId)}
                >
                  <div className="compact-job-info">
                    <div className="compact-job-title-row">
                      <span className="compact-job-title">{job.title}</span>
                      {isSelected && (
                        <span className="badge-active-mini">Selected</span>
                      )}
                    </div>
                    <div className="compact-job-meta">
                      <span>{job.company || "Client"}</span> &bull; <span>Min {job.minExperienceYears || 2} yrs exp</span>
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
                    <span>Match</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Activity Feed */}
        <section className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Activity Log</h3>
              <p className="card-subtitle">Recent resume uploads and candidate assignments</p>
            </div>
            <Clock size={15} className="text-muted" />
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

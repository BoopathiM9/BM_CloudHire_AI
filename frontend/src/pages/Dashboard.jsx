import React from "react";
import { useApp } from "../context/AppContext";
import { 
  UserCheck, 
  UserX, 
  Briefcase, 
  ArrowRight, 
  Clock, 
  FileText,
  CheckCircle2,
  Users,
  Award
} from "lucide-react";

export default function Dashboard({ setActiveTab }) {
  const { 
    candidates, 
    availableCandidates, 
    assignedCandidates, 
    jobs, 
    applications,
    recentActivity, 
    selectedJob, 
    setSelectedJobId
  } = useApp();

  const total = candidates.length;
  const availCount = availableCandidates.length;
  const asgnCount = assignedCandidates.length;
  const availPercentage = total > 0 ? Math.round((availCount / total) * 100) : 0;
  const asgnPercentage = total > 0 ? Math.round((asgnCount / total) * 100) : 0;

  const activeJobsCount = jobs.filter(j => j.status === "PUBLISHED" || !j.status).length;
  const totalAppsCount = applications.length;
  const newAppsCount = applications.filter(a => a.status === "Submitted" || a.status === "Under Review").length;
  const shortlistedCount = applications.filter(a => a.status === "Shortlisted" || a.status === "Interview" || a.status === "Selected").length;

  return (
    <div className="page-container">
      {/* 1. Clean Developer Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Executive Recruitment Overview</h2>
          <p className="page-sub-heading">
            Live metrics across job requisitions, inbound applications, candidate pool, and atomic exclusivity.
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
            onClick={() => setActiveTab("applications")} 
            className="btn-secondary"
          >
            <Users size={15} />
            <span>Applications ({totalAppsCount})</span>
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

      {/* 2. Key Metrics Grid (6 Real Backend Indicators) */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Active Jobs</span>
            <div className="metric-icon-box indigo">
              <Briefcase size={18} />
            </div>
          </div>
          <div className="metric-value">{activeJobsCount}</div>
          <div className="metric-caption">{jobs.length} total requisitions ({jobs.filter(j => j.status === 'DRAFT').length} drafts)</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Resumes</span>
            <div className="metric-icon-box blue">
              <FileText size={18} />
            </div>
          </div>
          <div className="metric-value">{total}</div>
          <div className="metric-caption">Indexed in private cloud repository</div>
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
            <span className="metric-label">Assigned Candidates</span>
            <div className="metric-icon-box purple">
              <UserX size={18} />
            </div>
          </div>
          <div className="metric-value text-purple">{asgnCount}</div>
          <div className="metric-caption">Locked by exclusion rule</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Inbound Applications</span>
            <div className="metric-icon-box blue">
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value">{totalAppsCount}</div>
          <div className="metric-caption">{newAppsCount} new in review queue</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Shortlisted Candidates</span>
            <div className="metric-icon-box green">
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value text-green">{shortlistedCount}</div>
          <div className="metric-caption">Cleared rubric benchmarks</div>
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

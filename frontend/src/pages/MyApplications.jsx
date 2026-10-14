import React from "react";
import { useApp } from "../context/AppContext";
import { 
  FileCheck2, 
  Clock, 
  Calendar, 
  Briefcase, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";

export default function MyApplications({ setActiveTab, onOpenAuth }) {
  const { currentUser, candidateApplications, withdrawApplication } = useApp();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return <span className="badge badge-subtle">Submitted</span>;
      case "Under Review":
        return <span className="badge badge-primary">Under Review</span>;
      case "Shortlisted":
        return <span className="badge badge-success">Shortlisted</span>;
      case "Interview":
        return <span className="badge badge-purple">Interview Stage</span>;
      case "Selected":
        return <span className="badge badge-emerald">Offer Extended</span>;
      case "Not Selected":
        return <span className="badge badge-danger">Not Selected</span>;
      case "Withdrawn":
        return <span className="badge badge-muted">Withdrawn</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  if (!currentUser || currentUser.role !== "CANDIDATE") {
    return (
      <div className="page-container">
        <div className="auth-required-card">
          <AlertCircle size={44} className="text-primary mb-2" />
          <h2>Candidate Sign In Required</h2>
          <p>
            Please sign in to your candidate account or create one to view and track your submitted applications.
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => onOpenAuth("candidate-login")} className="btn btn-primary">
              Candidate Sign In
            </button>
            <button onClick={() => onOpenAuth("candidate-register")} className="btn btn-outline">
              Create Candidate Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container candidate-apps-page">
      {/* Header */}
      <div className="candidate-page-header">
        <div>
          <span className="badge badge-primary mb-2">Applicant Dashboard</span>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">
            Track real-time hiring stages, technical review notes, and application statuses.
          </p>
        </div>

        <button onClick={() => setActiveTab("find-jobs")} className="btn btn-primary">
          <Briefcase size={16} />
          <span>Browse More Jobs</span>
        </button>
      </div>

      {/* Applications List */}
      {candidateApplications.length === 0 ? (
        <div className="empty-state-card">
          <FileCheck2 size={44} className="text-muted mb-2" />
          <h3>No Submitted Applications Yet</h3>
          <p>
            You haven't submitted any job applications under <strong>{currentUser.email}</strong>.
          </p>
          <button 
            onClick={() => setActiveTab("find-jobs")} 
            className="btn btn-primary mt-4"
          >
            Find Open Positions Now
          </button>
        </div>
      ) : (
        <div className="my-applications-grid">
          {candidateApplications.map((app) => (
            <div key={app.id} className="candidate-app-card">
              <div className="app-card-top">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="reference-pill">{app.id}</span>
                    <span className="app-date text-xs text-muted">
                      Applied on {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="app-job-title">{app.jobTitle}</h2>
                </div>
                {getStatusBadge(app.status)}
              </div>

              {/* Status Note & Timeline Info */}
              <div className="app-status-box">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-muted" />
                  <span className="text-xs font-semibold text-secondary">Hiring Panel Update:</span>
                </div>
                <p className="app-status-note">
                  {app.statusNote || "Application under review by talent acquisition team."}
                </p>
              </div>

              {/* Details Meta */}
              <div className="app-details-meta">
                <span>📄 Resume: <strong>{app.resumeFilename || "resume.pdf"}</strong></span>
                <span>⏱️ Claimed Experience: <strong>{app.experienceYears} Years</strong></span>
              </div>

              {/* Actions */}
              <div className="app-card-actions">
                <span className="text-xs text-muted">
                  Last updated: {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "Recently"}
                </span>

                {app.status !== "Withdrawn" && app.status !== "Selected" && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to withdraw your application (${app.id}) for ${app.jobTitle}?`)) {
                        withdrawApplication(app.id);
                      }
                    }}
                    className="btn btn-ghost btn-xs text-danger"
                  >
                    Withdraw Application
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

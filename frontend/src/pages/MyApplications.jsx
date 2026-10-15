import React from "react";
import { useApp } from "../context/AppContext";
import { 
  FileCheck2, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Phone,
  FileText,
  Calendar,
  AlertCircle
} from "lucide-react";

export default function MyApplications({ setActiveTab }) {
  const { currentUser, candidateApplications, withdrawApplication } = useApp();

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Review":
      case "Submitted":
        return (
          <span className="badge-pill badge-pill-warning">
            <Clock size={13} />
            <span>Pending Review</span>
          </span>
        );
      case "Approved":
      case "Selected":
        return (
          <span className="badge-pill badge-pill-success">
            <CheckCircle2 size={13} />
            <span>Request Approved</span>
          </span>
        );
      case "Under Review":
        return (
          <span className="badge-pill badge-pill-primary">
            <Clock size={13} />
            <span>Under Review</span>
          </span>
        );
      case "Shortlisted":
        return (
          <span className="badge-pill badge-pill-success">
            <CheckCircle2 size={13} />
            <span>Approved / Shortlisted</span>
          </span>
        );
      case "Interview":
        return (
          <span className="badge-pill badge-pill-purple">
            <Calendar size={13} />
            <span>Interview Stage</span>
          </span>
        );
      case "Not Selected":
      case "Rejected":
        return (
          <span className="badge-pill badge-pill-danger">
            <XCircle size={13} />
            <span>Not Selected</span>
          </span>
        );
      case "Withdrawn":
        return (
          <span className="badge-pill badge-pill-muted">
            <span>Withdrawn</span>
          </span>
        );
      default:
        return (
          <span className="badge-pill badge-pill-muted">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="page-container candidate-apps-page">
      {/* Header */}
      <div className="candidate-page-header">
        <div>
          <span className="badge badge-primary mb-2">Candidate Application Tracker</span>
          <h1 className="page-title">Application Status Portal</h1>
          <p className="page-subtitle">
            Track real-time candidate application status, administrative approvals, and hiring notes.
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setActiveTab("find-jobs")} className="btn btn-outline">
            <Briefcase size={16} />
            <span>Browse Open Positions</span>
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div>
        {candidateApplications.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon-box">
              <FileCheck2 size={32} className="text-primary" />
            </div>
            <h3>No Submitted Applications Yet</h3>
            <p>
              You haven't submitted any job applications under <strong>{currentUser?.email}</strong>. Explore verified cloud engineering requisitions and apply directly with your resume.
            </p>
            <button 
              onClick={() => setActiveTab("find-jobs")} 
              className="btn btn-primary"
            >
              <Briefcase size={16} />
              <span>Browse Open Positions Now</span>
            </button>
          </div>
        ) : (
          <div className="my-applications-grid">
            {candidateApplications.map((app) => (
              <div key={app.id} className="candidate-app-card">
                {/* Card Top: Tags, Job Title, Applicant Info, and Status Badge */}
                <div className="app-card-top">
                  <div className="app-card-title-group">
                    <div className="app-card-header-tags">
                      <span className="reference-pill">{app.id}</span>
                      <span className="app-date">
                        Applied on {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="app-job-title">{app.jobTitle}</h2>
                    <div className="app-applicant-info">
                      <span>Applicant:</span>
                      <strong>{app.candidateName}</strong>
                      <span className="text-muted">({app.candidateEmail})</span>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Status Box: Approved vs Pending vs General */}
                {app.status === "Approved" || app.status === "Selected" ? (
                  <div className="status-banner status-banner-approved">
                    <div className="status-banner-icon-col">
                      <div className="status-banner-icon-circle approved-circle">
                        <CheckCircle2 size={20} />
                      </div>
                    </div>
                    <div className="status-banner-content">
                      <div className="status-banner-headline">
                        <h3 className="status-banner-title approved-title">
                          🎉 Congratulations! Request Approved
                        </h3>
                        <span className="badge-pill badge-pill-success">✓ Request Approved</span>
                      </div>
                      <p className="status-banner-desc approved-desc">
                        {app.statusNote || "Your technical qualifications and resume match our requirements. The hiring lead has approved your application."}
                      </p>
                      
                      {/* Talent Acquisition Onboarding Card */}
                      <div className="onboarding-contact-card">
                        <div className="onboarding-contact-header">
                          <Phone size={16} className="text-emerald" />
                          <strong>Next Step: Our Talent Acquisition team will contact you shortly!</strong>
                        </div>
                        <p className="onboarding-contact-body">
                          A recruiter will reach out via email (<strong>{app.candidateEmail}</strong>) or phone (<strong>{app.phone || "your provided phone number"}</strong>) within <strong>24 to 48 business hours</strong> to schedule your technical discussion and onboarding steps.
                        </p>
                        <div className="onboarding-contact-footer">
                          <Clock size={13} className="text-emerald" />
                          <span>Technical Screening Queue: <strong>Active & Prioritized</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : app.status === "Pending Review" || app.status === "Submitted" ? (
                  <div className="status-banner status-banner-pending">
                    <div className="status-banner-icon-col">
                      <div className="status-banner-icon-circle pending-circle">
                        <Clock size={18} />
                      </div>
                    </div>
                    <div className="status-banner-content">
                      <div className="status-banner-headline">
                        <h3 className="status-banner-title">Awaiting Administrator Review & Decision</h3>
                        <span className="badge-pill badge-pill-warning">Status: Pending Review</span>
                      </div>
                      <p className="status-banner-desc">
                        {app.statusNote || "Your application and resume have been securely received in our recruitment database. An administrator is currently screening your qualifications against open requisition benchmarks."}
                      </p>
                      <div className="status-banner-tip">
                        <span>ℹ️</span>
                        <span>
                          Once the administrator reviews and approves your resume, this status will transition to <strong>Request Approved</strong> and our recruitment team will reach out directly.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="status-banner status-banner-default">
                    <div className="status-banner-icon-col">
                      <div className="status-banner-icon-circle default-circle">
                        <AlertCircle size={18} />
                      </div>
                    </div>
                    <div className="status-banner-content">
                      <div className="status-banner-headline">
                        <h3 className="status-banner-title" style={{ color: '#1e293b' }}>Application Status Update</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      <p className="status-banner-desc" style={{ color: '#475569' }}>
                        {app.statusNote || app.status}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Meta Strip */}
                <div className="app-card-meta-strip">
                  <div className="meta-strip-item">
                    <FileText size={15} className="meta-icon" />
                    <span className="meta-label">Resume Document:</span>
                    <strong className="meta-val">{app.resumeFilename || "resume.pdf"}</strong>
                  </div>
                  <div className="meta-strip-divider"></div>
                  <div className="meta-strip-item">
                    <Briefcase size={15} className="meta-icon" />
                    <span className="meta-label">Claimed Experience:</span>
                    <strong className="meta-val">{app.experienceYears} Years</strong>
                  </div>
                  <div className="meta-strip-divider"></div>
                  <div className="meta-strip-item">
                    <Calendar size={15} className="meta-icon" />
                    <span className="meta-label">Last Updated:</span>
                    <strong className="meta-val">{app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "Recently"}</strong>
                  </div>
                </div>

                {/* Withdraw Action (if active) */}
                {currentUser && app.status !== "Withdrawn" && app.status !== "Approved" && (
                  <div className="app-card-footer">
                    <span className="text-xs text-muted">
                      Need to update credentials? You can withdraw this submission and re-apply at any time.
                    </span>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to withdraw your application (${app.id})?`)) {
                          withdrawApplication(app.id);
                        }
                      }}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

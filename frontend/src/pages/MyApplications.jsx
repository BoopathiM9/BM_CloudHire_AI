import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileCheck2, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Search,
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export default function MyApplications({ setActiveTab, onOpenAuth }) {
  const { currentUser, applications, candidateApplications, withdrawApplication } = useApp();
  const [lookupQuery, setLookupQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending Review":
      case "Submitted":
        return (
          <span 
            className="badge badge-warning" 
            style={{ 
              background: '#fef3c7', 
              color: '#92400e', 
              border: '1px solid #fde68a', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontWeight: 600
            }}
          >
            <Clock size={13} /> Pending Review
          </span>
        );
      case "Approved":
      case "Selected":
        return (
          <span 
            className="badge badge-success" 
            style={{ 
              background: '#dcfce7', 
              color: '#166534', 
              border: '1px solid #bbf7d0', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={13} /> Approved
          </span>
        );
      case "Under Review":
        return <span className="badge badge-primary"><Clock size={13} /> Under Review</span>;
      case "Shortlisted":
        return (
          <span 
            className="badge badge-success" 
            style={{ 
              background: '#dcfce7', 
              color: '#166534', 
              border: '1px solid #bbf7d0', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px' 
            }}
          >
            <CheckCircle2 size={13} /> Approved / Shortlisted
          </span>
        );
      case "Interview":
        return <span className="badge badge-purple">Interview Stage</span>;
      case "Not Selected":
      case "Rejected":
        return (
          <span 
            className="badge badge-danger" 
            style={{ 
              background: '#fee2e2', 
              color: '#991b1b', 
              border: '1px solid #fecaca', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontWeight: 600
            }}
          >
            <XCircle size={13} /> Not Selected
          </span>
        );
      case "Withdrawn":
        return <span className="badge badge-muted">Withdrawn</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  // Determine list of displayed applications
  let displayedApps = [];
  if (currentUser && currentUser.role === "CANDIDATE") {
    displayedApps = candidateApplications;
  } else if (lookupQuery.trim()) {
    const q = lookupQuery.trim().toLowerCase();
    displayedApps = applications.filter(a => 
      a.candidateEmail?.toLowerCase() === q ||
      a.id?.toLowerCase() === q ||
      a.candidateName?.toLowerCase().includes(q)
    );
  }

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    setHasSearched(true);
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
          {!currentUser && (
            <button onClick={() => onOpenAuth("candidate-login")} className="btn btn-primary">
              <User size={16} />
              <span>Candidate Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Guest Lookup Bar (if not logged in) */}
      {!currentUser && (
        <div className="card p-5 mt-4 border border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Search size={18} className="text-primary" />
            <h3 className="text-base font-bold text-slate-800">Quick Status Lookup</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Enter your email address or Application Reference ID (e.g., <code>APP-101</code> or <code>arun.krishnan@example.com</code>) to see whether your application is <strong>Pending Review</strong>, <strong>Approved</strong>, or <strong>Not Selected</strong>.
          </p>
          <form onSubmit={handleLookupSubmit} className="flex gap-2 max-w-xl">
            <input 
              type="text"
              required
              placeholder="e.g. arun.krishnan@example.com or APP-101"
              value={lookupQuery}
              onChange={(e) => { setLookupQuery(e.target.value); setHasSearched(false); }}
              className="form-input flex-1"
              style={{ background: 'white' }}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={15} />
              <span>Track Status</span>
            </button>
          </form>
        </div>
      )}

      {/* Applications List */}
      <div className="mt-6">
        {currentUser && candidateApplications.length === 0 ? (
          <div className="empty-state-card card p-8 text-center">
            <FileCheck2 size={44} className="text-muted mx-auto mb-2" />
            <h3>No Submitted Applications Yet</h3>
            <p className="text-sm text-muted">
              You haven't submitted any job applications under <strong>{currentUser.email}</strong>.
            </p>
            <button 
              onClick={() => setActiveTab("find-jobs")} 
              className="btn btn-primary mt-4"
            >
              Browse Open Positions Now
            </button>
          </div>
        ) : !currentUser && hasSearched && displayedApps.length === 0 ? (
          <div className="empty-state-card card p-8 text-center">
            <XCircle size={44} className="text-amber-500 mx-auto mb-2" />
            <h3>No Application Found</h3>
            <p className="text-sm text-muted">
              No application matched "<strong>{lookupQuery}</strong>". Please verify your email or application reference ID.
            </p>
          </div>
        ) : !currentUser && !hasSearched && displayedApps.length === 0 ? (
          <div className="card p-8 text-center text-muted">
            <FileCheck2 size={40} className="mx-auto mb-2 text-primary opacity-60" />
            <p className="text-sm">Use the search box above to track any application status instantly, or sign in to your candidate account.</p>
          </div>
        ) : (
          <div className="my-applications-grid grid gap-4">
            {displayedApps.map((app) => (
              <div key={app.id} className="candidate-app-card card p-5 border border-slate-200 hover:shadow-md transition">
                <div className="app-card-top flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="reference-pill font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">{app.id}</span>
                      <span className="app-date text-xs text-muted">
                        Applied on {new Date(app.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="app-job-title text-lg font-bold text-slate-900">{app.jobTitle}</h2>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Applicant: <strong>{app.candidateName}</strong> ({app.candidateEmail})
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Status Note & Timeline Info */}
                <div className="app-status-box mt-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-slate-800">Status Update & Administrator Decision:</span>
                  </div>
                  <p className="app-status-note text-xs text-slate-700 leading-relaxed font-medium">
                    {app.statusNote || (app.status === "Approved" ? "Congratulations! Application approved by hiring administrator." : app.status === "Pending Review" ? "Application received and queued for administrative review." : "In review.")}
                  </p>
                </div>

                {/* Details Meta */}
                <div className="app-details-meta flex flex-wrap gap-4 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                  <span>📄 Resume: <strong className="text-slate-800">{app.resumeFilename || "resume.pdf"}</strong></span>
                  <span>⏱️ Claimed Experience: <strong className="text-slate-800">{app.experienceYears} Years</strong></span>
                  <span>📅 Last Updated: <strong className="text-slate-800">{app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "Recently"}</strong></span>
                </div>

                {/* Withdraw Action (if active) */}
                {currentUser && app.status !== "Withdrawn" && app.status !== "Approved" && (
                  <div className="app-card-actions mt-3 flex justify-end">
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to withdraw your application (${app.id})?`)) {
                          withdrawApplication(app.id);
                        }
                      }}
                      className="btn btn-ghost btn-xs text-danger"
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

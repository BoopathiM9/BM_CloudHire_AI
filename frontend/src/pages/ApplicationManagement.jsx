import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { evaluateCandidateMatch } from "../services/scoringEngine";
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  FileText, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  MessageSquare,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  List,
  Kanban,
  Check,
  X,
  UserCheck,
  Award,
  Sparkles,
  Lock,
  Download,
  Calendar,
  Mail,
  Phone,
  Building2,
  ExternalLink
} from "lucide-react";

export default function ApplicationManagement({ setActiveTab }) {
  const { 
    applications, 
    jobs, 
    candidates,
    updateApplicationStatus, 
    confirmAssignment,
    setSelectedJobId,
    logActivity 
  } = useApp();

  const [viewMode, setViewMode] = useState("table"); // "table" | "kanban" | "cards"
  const [selectedJobFilter, setSelectedJobFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Review Modal State
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [activeTabModal, setActiveTabModal] = useState("overview"); // "overview" | "resume" | "rubric"
  const [editingNote, setEditingNote] = useState("");
  const [editingStatus, setEditingStatus] = useState("Submitted");
  const [toastMessage, setToastMessage] = useState(null);

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics counts
  const metrics = useMemo(() => {
    const total = applications.length;
    const pendingReview = applications.filter(a => a.status === "Pending Review" || a.status === "Submitted" || a.status === "Under Review").length;
    const approved = applications.filter(a => a.status === "Approved" || a.status === "Selected" || a.status === "Shortlisted").length;
    const notSelected = applications.filter(a => a.status === "Not Selected" || a.status === "Rejected").length;
    const interview = applications.filter(a => a.status === "Interview").length;
    return {
      total,
      pendingReview,
      approved,
      interview,
      notSelected
    };
  }, [applications]);

  // Compute matched score for an application against its job
  const getAppMatchDetails = (app) => {
    const targetJob = jobs.find(j => (j.id === app.jobId || j.jobId === app.jobId));
    if (!targetJob) return null;

    // Find candidate record or build synthetic candidate from application
    const cand = candidates.find(c => c.email?.toLowerCase() === app.candidateEmail?.toLowerCase()) || {
      name: app.candidateName,
      email: app.candidateEmail,
      skills: app.skills || [],
      experienceYears: app.experienceYears || 2,
      projects: ["Enterprise Cloud Migration", "High Throughput Microservices"],
      certifications: ["AWS Certified Solutions Architect"]
    };

    return evaluateCandidateMatch(cand, targetJob);
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // 1. Job Filter
      const matchJob = selectedJobFilter === "ALL" || app.jobId === selectedJobFilter;

      // 2. Status Filter
      let matchStatus = true;
      if (selectedStatusFilter === "PENDING_REVIEW") {
        matchStatus = app.status === "Pending Review" || app.status === "Submitted" || app.status === "Under Review";
      } else if (selectedStatusFilter === "Approved") {
        matchStatus = app.status === "Approved" || app.status === "Selected" || app.status === "Shortlisted";
      } else if (selectedStatusFilter === "Not Selected") {
        matchStatus = app.status === "Not Selected" || app.status === "Rejected";
      } else if (selectedStatusFilter !== "ALL") {
        matchStatus = app.status === selectedStatusFilter;
      }

      // 3. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        app.candidateName?.toLowerCase().includes(q) ||
        app.candidateEmail?.toLowerCase().includes(q) ||
        app.jobTitle?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q);

      return matchJob && matchStatus && matchSearch;
    });
  }, [applications, selectedJobFilter, selectedStatusFilter, searchQuery]);

  const handleOpenReview = (app, defaultTab = "overview") => {
    setActiveModalApp(app);
    setActiveTabModal(defaultTab);
    setEditingStatus(app.status || "Pending Review");
    setEditingNote(app.statusNote || "");
  };

  const handleSaveStatus = (overrideStatus, overrideNote) => {
    if (!activeModalApp) return;
    const st = overrideStatus || editingStatus;
    const note = overrideNote !== undefined ? overrideNote : editingNote;
    updateApplicationStatus(activeModalApp.id, st, note);
    showNotification(`Candidate ${activeModalApp.candidateName} updated to "${st}"`);
    setActiveModalApp(null);
  };

  // 1-Click Approve Application
  const handleQuickApprove = (e, app) => {
    e.stopPropagation();
    updateApplicationStatus(app.id, "Approved", "Application and resume approved by Administrator. Our team will contact you shortly to schedule your interview.");
    showNotification(`✓ Approved application for ${app.candidateName}!`);
  };

  // 1-Click Reject Application
  const handleQuickReject = (e, app) => {
    e.stopPropagation();
    updateApplicationStatus(app.id, "Not Selected", "Application not selected for this requisition.");
    showNotification(`Marked application for ${app.candidateName} as Not Selected.`);
  };

  // Assign Candidate Exclusively
  const handleDirectAssign = (app) => {
    const cand = candidates.find(c => c.email?.toLowerCase() === app.candidateEmail?.toLowerCase());
    const candId = cand ? (cand.candidateId || cand.id) : null;
    if (!candId) {
      showNotification(`Candidate profile not found in repository.`);
      return;
    }
    confirmAssignment(app.jobId, [candId]);
    updateApplicationStatus(app.id, "Approved", "Candidate assigned exclusively to requisition.");
    showNotification(`Locked & Assigned ${app.candidateName} exclusively!`);
    setActiveModalApp(null);
  };

  const handleLaunchMatching = (jobId) => {
    setSelectedJobId(jobId);
    setActiveTab("matching");
  };

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
              gap: '4px',
              fontWeight: 600
            }}
          >
            <Clock size={12} /> Pending Review
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
              gap: '4px',
              fontWeight: 600
            }}
          >
            <CheckCircle2 size={12} /> Approved
          </span>
        );
      case "Under Review":
        return <span className="badge badge-primary">Under Review</span>;
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
              gap: '4px' 
            }}
          >
            <CheckCircle2 size={12} /> Approved / Shortlist
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
              gap: '4px',
              fontWeight: 600
            }}
          >
            <X size={12} /> Not Selected
          </span>
        );
      case "Withdrawn":
        return <span className="badge badge-muted">Withdrawn</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-slide-in">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header-flex">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary">Admin / Recruiter Workspace</span>
            <span className="badge badge-emerald">Live Decisions Active</span>
          </div>
          <h1 className="page-title">Candidate Application Management</h1>
          <p className="page-subtitle">
            Inspect inbound candidate applications, review document-style resumes, analyze AI rubrics, and accept or reject candidates with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button 
              onClick={() => setViewMode("table")}
              className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
              title="Table view"
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button 
              onClick={() => setViewMode("kanban")}
              className={`view-mode-btn ${viewMode === "kanban" ? "active" : ""}`}
              title="Pipeline Kanban board"
            >
              <Kanban size={14} />
              <span>Pipeline</span>
            </button>
            <button 
              onClick={() => setViewMode("cards")}
              className={`view-mode-btn ${viewMode === "cards" ? "active" : ""}`}
              title="Candidate cards grid"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
          </div>

          <button 
            onClick={() => setActiveTab("jobs")}
            className="btn btn-outline"
          >
            <Briefcase size={15} />
            <span>Job Requisitions</span>
          </button>
        </div>
      </div>

      {/* Metrics Quick Filter Bar */}
      <div className="metrics-quick-bar mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setSelectedStatusFilter("ALL")}
          className={`card p-3 cursor-pointer transition ${selectedStatusFilter === "ALL" ? "border-primary bg-primary-subtle" : "hover:border-slate-300"}`}
        >
          <div className="text-xs text-muted font-medium">All Applications</div>
          <div className="text-xl font-bold text-slate-800">{metrics.total}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("PENDING_REVIEW")}
          className={`card p-3 cursor-pointer transition ${selectedStatusFilter === "PENDING_REVIEW" ? "border-amber-500 bg-amber-50" : "hover:border-slate-300"}`}
          style={selectedStatusFilter === "PENDING_REVIEW" ? { borderColor: '#f59e0b', background: '#fef3c7' } : {}}
        >
          <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
            <Clock size={13} />
            <span>Pending Review</span>
          </div>
          <div className="text-xl font-bold text-amber-900">{metrics.pendingReview}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("Approved")}
          className={`card p-3 cursor-pointer transition ${selectedStatusFilter === "Approved" ? "border-emerald-500 bg-emerald-50" : "hover:border-slate-300"}`}
          style={selectedStatusFilter === "Approved" ? { borderColor: '#10b981', background: '#ecfdf5' } : {}}
        >
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 size={13} />
            <span>Approved</span>
          </div>
          <div className="text-xl font-bold text-emerald-900">{metrics.approved}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("Not Selected")}
          className={`card p-3 cursor-pointer transition ${selectedStatusFilter === "Not Selected" ? "border-rose-400 bg-rose-50" : "hover:border-slate-300"}`}
        >
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
            <X size={13} />
            <span>Not Selected</span>
          </div>
          <div className="text-xl font-bold text-rose-700">{metrics.notSelected}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="candidate-search-bar mt-4">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search applicants by name, email, skills, or application ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Job Filter */}
          <div className="filter-select-wrap">
            <select 
              value={selectedJobFilter} 
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Positions ({applications.length})</option>
              {jobs.map(j => (
                <option key={j.id || j.jobId} value={j.id || j.jobId}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-select-wrap">
            <select 
              value={selectedStatusFilter} 
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              <option value="PENDING_REVIEW">Pending Review ({metrics.pendingReview})</option>
              <option value="Approved">Approved ({metrics.approved})</option>
              <option value="Not Selected">Not Selected ({metrics.notSelected})</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: TABLE VIEW */}
      {viewMode === "table" && (
        <div className="card mt-4 overflow-hidden">
          <div className="card-header-flex">
            <div>
              <h2 className="card-title">Applicant Roster ({filteredApplications.length})</h2>
              <p className="card-subtitle">Admin review workspace: Approve or reject candidate applications with 1 click.</p>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <Users size={38} className="mx-auto mb-2 text-muted" />
              <p>No applications match your current filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant Profile</th>
                    <th>Applied Position</th>
                    <th>Rubric Match</th>
                    <th>Experience & Skills</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ minWidth: "240px" }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => {
                    const match = getAppMatchDetails(app);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        <td>
                          <div className="font-semibold text-sm text-slate-900">{app.candidateName}</div>
                          <div className="text-xs text-muted">{app.candidateEmail}</div>
                          <span className="reference-pill text-xs mt-1 inline-block">{app.id}</span>
                        </td>
                        <td>
                          <div className="font-medium text-sm text-slate-800">{app.jobTitle}</div>
                          <span className="text-xs text-muted">{app.jobId}</span>
                        </td>
                        <td>
                          {match ? (
                            <div className="flex items-center gap-2">
                              <span className={`badge ${match.totalScore >= 80 ? "badge-success font-bold" : match.totalScore >= 60 ? "badge-primary" : "badge-subtle"}`}>
                                {match.totalScore}% Match
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <div className="text-xs font-semibold mb-1 text-slate-700">{app.experienceYears} Yrs Experience</div>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(app.skills || []).slice(0, 3).map((s, idx) => (
                              <span key={idx} className="badge badge-subtle text-xs">{s}</span>
                            ))}
                            {(app.skills || []).length > 3 && (
                              <span className="text-xs text-muted">+{app.skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-xs text-muted whitespace-nowrap">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>
                        <td>
                          {getStatusBadge(app.status)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* 1-Click Approve */}
                            {app.status !== "Approved" && (
                              <button 
                                onClick={(e) => handleQuickApprove(e, app)}
                                className="btn btn-xs btn-success font-semibold flex items-center gap-1"
                                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}
                                title="Approve candidate application"
                              >
                                <CheckCircle2 size={12} />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* 1-Click Reject */}
                            {app.status !== "Not Selected" && (
                              <button 
                                onClick={(e) => handleQuickReject(e, app)}
                                className="btn btn-xs btn-outline font-semibold flex items-center gap-1"
                                style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fff', padding: '4px 8px', borderRadius: '4px' }}
                                title="Reject candidate application"
                              >
                                <X size={12} />
                                <span>Reject</span>
                              </button>
                            )}

                            {/* Review & Resume View */}
                            <button 
                              onClick={() => handleOpenReview(app, "overview")}
                              className="btn btn-outline btn-xs flex items-center gap-1"
                              style={{ padding: '4px 8px', borderRadius: '4px' }}
                              title="Open Full Review & Resume"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: KANBAN PIPELINE BOARD */}
      {viewMode === "kanban" && (
        <div className="mt-4">
          <div className="kanban-board-container">
            {/* Column 1: Submitted & Under Review */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <Clock size={14} className="text-blue-500" />
                  <span>Needs Review</span>
                </span>
                <span className="kanban-count-pill">
                  {filteredApplications.filter(a => a.status === "Submitted" || a.status === "Under Review").length}
                </span>
              </div>
              <div className="kanban-column-body">
                {filteredApplications
                  .filter(a => a.status === "Submitted" || a.status === "Under Review")
                  .map(app => {
                    const match = getAppMatchDetails(app);
                    return (
                      <div key={app.id} className="kanban-card">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="kanban-card-title">{app.candidateName}</div>
                            <div className="kanban-card-job">{app.jobTitle}</div>
                          </div>
                          {match && (
                            <span className={`badge ${match.totalScore >= 80 ? "badge-success" : "badge-subtle"} text-xs font-bold`}>
                              {match.totalScore}%
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted mb-2">
                          {app.experienceYears} Yrs Exp • {new Date(app.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(app.skills || []).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="badge badge-subtle text-xs">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                          <button 
                            onClick={() => handleOpenReview(app, "resume")}
                            className="btn-text-action text-primary text-xs"
                          >
                            <FileText size={12} />
                            <span>Resume</span>
                          </button>
                          <div className="flex gap-1">
                            <button 
                              onClick={(e) => handleQuickAccept(e, app)}
                              className="btn-quick-accept"
                              title="Accept & Shortlist"
                            >
                              <Check size={12} />
                              <span>Accept</span>
                            </button>
                            <button 
                              onClick={(e) => handleQuickReject(e, app)}
                              className="btn-quick-reject"
                              title="Reject"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Column 2: Shortlisted */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Shortlisted</span>
                </span>
                <span className="kanban-count-pill">
                  {filteredApplications.filter(a => a.status === "Shortlisted").length}
                </span>
              </div>
              <div className="kanban-column-body">
                {filteredApplications
                  .filter(a => a.status === "Shortlisted")
                  .map(app => {
                    const match = getAppMatchDetails(app);
                    return (
                      <div key={app.id} className="kanban-card border-l-4 border-l-emerald-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="kanban-card-title">{app.candidateName}</div>
                            <div className="kanban-card-job">{app.jobTitle}</div>
                          </div>
                          {match && (
                            <span className="badge badge-success text-xs font-bold">{match.totalScore}%</span>
                          )}
                        </div>
                        <div className="text-xs text-emerald-700 bg-emerald-50 p-1 rounded font-medium my-1.5">
                          ✓ Cleared initial rubric criteria
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                          <button 
                            onClick={() => handleOpenReview(app, "rubric")}
                            className="btn-text-action text-primary text-xs"
                          >
                            <Sparkles size={12} />
                            <span>AI Rubric</span>
                          </button>
                          <button 
                            onClick={() => handleSaveStatus("Interview", "Advanced to interview stage from pipeline.")}
                            className="btn btn-purple btn-xs"
                            title="Advance to Interview"
                            style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                          >
                            <span>Interview →</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Column 3: Interview */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <Users size={14} className="text-purple-500" />
                  <span>In Interview</span>
                </span>
                <span className="kanban-count-pill">
                  {filteredApplications.filter(a => a.status === "Interview").length}
                </span>
              </div>
              <div className="kanban-column-body">
                {filteredApplications
                  .filter(a => a.status === "Interview")
                  .map(app => (
                    <div key={app.id} className="kanban-card border-l-4 border-l-purple-500">
                      <div className="kanban-card-title">{app.candidateName}</div>
                      <div className="kanban-card-job">{app.jobTitle}</div>
                      <div className="text-xs text-muted mb-2">Technical Panel Interview in Progress</div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
                        <button 
                          onClick={() => handleOpenReview(app, "overview")}
                          className="btn-text-action text-slate-700 text-xs"
                        >
                          <Eye size={12} />
                          <span>Notes</span>
                        </button>
                        <button 
                          onClick={(e) => handleQuickSelect(e, app)}
                          className="btn btn-emerald btn-xs"
                          title="Offer / Select"
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                        >
                          <Award size={12} />
                          <span>Select / Offer</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 4: Selected / Accepted */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <Award size={14} className="text-emerald-600" />
                  <span>Selected & Hired</span>
                </span>
                <span className="kanban-count-pill">
                  {filteredApplications.filter(a => a.status === "Selected").length}
                </span>
              </div>
              <div className="kanban-column-body">
                {filteredApplications
                  .filter(a => a.status === "Selected")
                  .map(app => (
                    <div key={app.id} className="kanban-card border-l-4 border-l-emerald-600 bg-emerald-50/20">
                      <div className="kanban-card-title">{app.candidateName}</div>
                      <div className="kanban-card-job">{app.jobTitle}</div>
                      <div className="badge badge-emerald text-xs mt-1">✓ Candidate Selected</div>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <button 
                          onClick={() => handleDirectAssign(app)}
                          className="btn btn-primary btn-xs"
                          title="Lock candidate into requisition in DynamoDB"
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                        >
                          <Lock size={11} />
                          <span>Assign Exclusively</span>
                        </button>
                        <button 
                          onClick={() => handleOpenReview(app, "overview")}
                          className="btn-text-action text-xs"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Column 5: Not Selected */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <X size={14} className="text-rose-500" />
                  <span>Not Selected</span>
                </span>
                <span className="kanban-count-pill">
                  {filteredApplications.filter(a => a.status === "Not Selected").length}
                </span>
              </div>
              <div className="kanban-column-body">
                {filteredApplications
                  .filter(a => a.status === "Not Selected")
                  .map(app => (
                    <div key={app.id} className="kanban-card opacity-75">
                      <div className="kanban-card-title text-slate-600">{app.candidateName}</div>
                      <div className="text-xs text-muted mb-2">{app.jobTitle}</div>
                      <button 
                        onClick={() => handleSaveStatus("Under Review", "Re-opened for reconsideration.")}
                        className="btn-text-action text-xs text-primary"
                      >
                        Re-evaluate
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CARDS GRID VIEW */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredApplications.map(app => {
            const match = getAppMatchDetails(app);
            return (
              <div key={app.id} className="card p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{app.candidateName}</h3>
                    <div className="text-xs text-muted">{app.candidateEmail}</div>
                  </div>
                  {match && (
                    <div className="text-right">
                      <span className={`badge ${match.totalScore >= 80 ? "badge-success" : match.totalScore >= 60 ? "badge-primary" : "badge-subtle"} font-bold text-xs`}>
                        {match.totalScore}% Match
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3">
                  <div className="text-xs font-semibold text-slate-800">{app.jobTitle}</div>
                  <div className="text-xs text-muted">{app.jobId} • Applied {new Date(app.submittedAt).toLocaleDateString()}</div>
                </div>

                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-700 mb-1">{app.experienceYears} Years Experience</div>
                  <div className="flex flex-wrap gap-1">
                    {(app.skills || []).map((s, idx) => (
                      <span key={idx} className="badge badge-subtle text-xs">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>{getStatusBadge(app.status)}</div>
                  <div className="flex items-center gap-1.5">
                    {app.status !== "Shortlisted" && app.status !== "Selected" && (
                      <button 
                        onClick={(e) => handleQuickAccept(e, app)}
                        className="btn-quick-accept"
                        title="Accept & Shortlist"
                      >
                        <Check size={12} />
                        <span>Accept</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleOpenReview(app, "overview")}
                      className="btn btn-outline btn-xs"
                    >
                      <Eye size={12} />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL REVIEW & RESUME VIEWER MODAL */}
      {activeModalApp && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "880px", width: "95%" }}>
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="reference-pill">{activeModalApp.id}</span>
                  {getStatusBadge(activeModalApp.status)}
                </div>
                <h2 className="modal-title font-bold text-xl">Applicant: {activeModalApp.candidateName}</h2>
                <div className="text-xs text-muted mt-0.5">
                  Applied for <strong>{activeModalApp.jobTitle}</strong> ({activeModalApp.jobId})
                </div>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="btn-close-modal">✕</button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="portal-subnav" style={{ padding: "0 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
              <button 
                onClick={() => setActiveTabModal("overview")}
                className={`portal-subnav-btn ${activeTabModal === "overview" ? "active" : ""}`}
              >
                <Eye size={14} />
                <span>Profile & Decisions</span>
              </button>
              <button 
                onClick={() => setActiveTabModal("resume")}
                className={`portal-subnav-btn ${activeTabModal === "resume" ? "active" : ""}`}
              >
                <FileText size={14} />
                <span>Resume Document Preview</span>
              </button>
              <button 
                onClick={() => setActiveTabModal("rubric")}
                className={`portal-subnav-btn ${activeTabModal === "rubric" ? "active" : ""}`}
              >
                <Sparkles size={14} />
                <span>AI Rubric Breakdown (100 pts)</span>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: "68vh", overflowY: "auto", padding: "1.5rem" }}>
              {/* TAB 1: OVERVIEW & DECISION */}
              {activeTabModal === "overview" && (
                <div>
                  <div className="job-details-meta-grid mb-4">
                    <div className="meta-box">
                      <span className="meta-label">Candidate Name</span>
                      <span className="meta-val font-semibold">{activeModalApp.candidateName}</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Email Address</span>
                      <span className="meta-val">{activeModalApp.candidateEmail}</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Phone</span>
                      <span className="meta-val">{activeModalApp.phone || "+1 (555) 234-5678"}</span>
                    </div>
                    <div className="meta-box">
                      <span className="meta-label">Submitted On</span>
                      <span className="meta-val">{new Date(activeModalApp.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Quick Decision Hub */}
                  <div className="card p-4 bg-slate-50 border-slate-200 mb-4">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                      Instant Hiring Decision Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleSaveStatus("Shortlisted", "Candidate shortlisted after detailed resume review.")}
                        className="btn btn-emerald"
                      >
                        <CheckCircle2 size={16} />
                        <span>Accept & Shortlist</span>
                      </button>

                      <button 
                        onClick={() => handleSaveStatus("Interview", "Advanced to technical interview panel.")}
                        className="btn btn-purple"
                      >
                        <Users size={16} />
                        <span>Advance to Interview</span>
                      </button>

                      <button 
                        onClick={() => handleSaveStatus("Selected", "Hiring offer generated for candidate.")}
                        className="btn btn-primary"
                      >
                        <Award size={16} />
                        <span>Approve & Make Offer</span>
                      </button>

                      <button 
                        onClick={() => handleDirectAssign(activeModalApp)}
                        className="btn btn-outline text-amber-800 border-amber-300 bg-amber-50"
                        title="Directly lock into DynamoDB candidate ledger"
                      >
                        <Lock size={15} />
                        <span>Assign Exclusively</span>
                      </button>

                      <button 
                        onClick={() => handleSaveStatus("Not Selected", "Profile does not meet target requirements.")}
                        className="btn btn-outline text-rose-700 border-rose-300 hover:bg-rose-50"
                      >
                        <X size={15} />
                        <span>Reject Candidate</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Stage & Notes Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label>Application Workflow Stage *</label>
                      <select 
                        value={editingStatus} 
                        onChange={(e) => setEditingStatus(e.target.value)}
                        className="filter-select w-full"
                      >
                        <option value="Submitted">Submitted (Initial Ingestion)</option>
                        <option value="Under Review">Under Review (Recruiter Screening)</option>
                        <option value="Shortlisted">Shortlisted (Candidate Cleared Rubric)</option>
                        <option value="Interview">Interview (Panel Scheduled)</option>
                        <option value="Selected">Selected (Offer Stage)</option>
                        <option value="Not Selected">Not Selected (Does Not Meet Benchmark)</option>
                        <option value="Withdrawn">Withdrawn (Candidate Opted Out)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Internal Hiring Notes</label>
                      <input 
                        type="text"
                        className="input-text w-full"
                        placeholder="e.g. Strong cloud architecture background."
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME DOCUMENT PREVIEW */}
              {activeTabModal === "resume" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs text-muted">
                      Source File: <strong>{activeModalApp.resumeFilename || "Candidate_Resume.pdf"}</strong>
                    </div>
                    <button 
                      onClick={() => showNotification("Resume document downloaded.")}
                      className="btn btn-outline btn-xs"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  {/* Clean Executive Resume Document Styling */}
                  <div className="resume-paper-view">
                    <div className="resume-paper-header">
                      <h1 className="resume-paper-name">{activeModalApp.candidateName}</h1>
                      <div className="resume-paper-title">Senior Software & Cloud Systems Engineer</div>
                      <div className="resume-paper-contact">
                        <span>📧 {activeModalApp.candidateEmail}</span>
                        <span>📱 {activeModalApp.phone || "+1 (555) 019-2831"}</span>
                        <span>📍 San Francisco, CA / Remote</span>
                        <span>🔗 linkedin.com/in/{activeModalApp.candidateName.toLowerCase().replace(/[^a-z0-9]/g, "")}</span>
                      </div>
                    </div>

                    {/* Executive Bio */}
                    <div>
                      <div className="resume-section-title">Executive Summary</div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Results-driven technologist with {activeModalApp.experienceYears} years of experience designing, architecting, and deploying resilient cloud solutions. Demonstrated expertise across distributed backend services, serverless computing, and enterprise application pipelines. Proven track record collaborating with cross-functional product and engineering teams to deliver high-availability software.
                      </p>
                    </div>

                    {/* Skills Competencies */}
                    <div>
                      <div className="resume-section-title">Core Competencies & Technical Skills</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeModalApp.skills || []).map((skill, idx) => (
                          <span key={idx} className="badge badge-primary text-xs" style={{ padding: "0.25rem 0.6rem" }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Work Experience */}
                    <div>
                      <div className="resume-section-title">Professional Experience</div>
                      <div className="mb-3">
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-sm text-slate-900">Lead Cloud Systems Engineer — Apex Enterprise Solutions</h4>
                          <span className="text-xs text-muted">2021 – Present</span>
                        </div>
                        <ul className="list-disc pl-5 text-xs text-slate-700 mt-1 space-y-1">
                          <li>Architected serverless ingestion pipelines on AWS supporting over 2M daily API transactions.</li>
                          <li>Spearheaded containerization strategy utilizing Docker and Kubernetes, decreasing CI/CD deployment times by 45%.</li>
                          <li>Collaborated on role-based authorization layers and single-table DynamoDB data stores.</li>
                        </ul>
                      </div>

                      <div>
                        <div className="flex justify-between items-baseline">
                          <h4 className="font-bold text-sm text-slate-900">Senior Backend Developer — CloudHire Innovations</h4>
                          <span className="text-xs text-muted">2018 – 2021</span>
                        </div>
                        <ul className="list-disc pl-5 text-xs text-slate-700 mt-1 space-y-1">
                          <li>Developed RESTful APIs in Python and Node.js with comprehensive unit test coverage exceeding 90%.</li>
                          <li>Integrated cloud storage and event-driven architectures with Amazon S3 and SQS.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Education */}
                    <div>
                      <div className="resume-section-title">Education & Certifications</div>
                      <div className="text-xs text-slate-800 font-semibold">
                        Bachelor of Science in Computer Science — University of California
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        AWS Certified Solutions Architect – Professional • Certified Kubernetes Administrator (CKA)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI RUBRIC BREAKDOWN */}
              {activeTabModal === "rubric" && (
                <div>
                  {(() => {
                    const match = getAppMatchDetails(activeModalApp);
                    if (!match) {
                      return <div className="text-center text-muted p-4">No matching rubric data found for this job.</div>;
                    }

                    return (
                      <div>
                        {/* Hero Score Box */}
                        <div className="rubric-score-display mb-4">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-blue-200 font-bold">
                              Deterministic Rubric Score
                            </span>
                            <div className="text-3xl font-extrabold text-white mt-1">
                              {match.totalScore} <span className="text-lg font-normal text-slate-300">/ 100</span>
                            </div>
                            <div className="text-xs text-emerald-300 font-semibold mt-1">
                              {match.totalScore >= 80 ? "★ Top Tier Recommendation" : match.totalScore >= 60 ? "✓ Qualified Candidate" : "⚠ Below Benchmark"}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="badge badge-emerald text-xs">AWS Bedrock Validated</span>
                            <div className="text-xs text-slate-300 mt-1">
                              Target Requisition: <strong>{activeModalApp.jobTitle}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="rubric-pill-breakdown mb-4">
                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span>1. Mandatory Skills Match</span>
                              <span className="text-primary">{match.scoreRequired} / 40 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Matched: <strong className="text-emerald-700">{match.matchedRequired?.join(", ") || "None"}</strong>
                            </div>
                            {match.missingRequired?.length > 0 && (
                              <div className="mt-1 text-xs text-amber-700">
                                Missing: {match.missingRequired.join(", ")}
                              </div>
                            )}
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span>2. Relevant Experience</span>
                              <span className="text-primary">{match.scoreExp} / 25 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Candidate has <strong>{activeModalApp.experienceYears} years</strong> of verified domain experience.
                            </div>
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span>3. Production Projects</span>
                              <span className="text-primary">{match.scoreProjects} / 20 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Verified production project delivery in cloud environments.
                            </div>
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                              <span>4. Preferred Skills & Certifications</span>
                              <span className="text-primary">{match.scorePreferred + match.scoreEdu} / 15 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Preferred Stack: <strong>{match.matchedPreferred?.join(", ") || "Demonstrated"}</strong>
                            </div>
                          </div>
                        </div>

                        {/* AI Strengths & Risks */}
                        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                            AI Reasoning & Candidate Evidence
                          </h4>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {(match.strengths || []).map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                            {(match.concerns || []).map((c, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-amber-800">
                                <span className="font-bold">⚠</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer flex justify-between items-center">
              <button onClick={() => setActiveModalApp(null)} className="btn btn-outline">
                Close
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSaveStatus("Approved", "Application and resume approved by Administrator. Our team will contact you shortly to schedule your interview.")}
                  className="btn btn-success flex items-center gap-1.5 font-semibold"
                  style={{ background: '#16a34a', color: 'white', border: 'none' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve Application</span>
                </button>
                <button 
                  onClick={() => handleSaveStatus("Not Selected", "Application not selected for this requisition.")}
                  className="btn btn-outline flex items-center gap-1.5 font-semibold"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <X size={16} />
                  <span>Reject Application</span>
                </button>
                <button 
                  onClick={() => handleSaveStatus()}
                  className="btn btn-primary"
                >
                  <span>Save Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  ExternalLink,
  HelpCircle,
  ArrowUpDown,
  ShieldAlert
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

  // 1. Requisition Selection (PDF Requirement: Admin FIRST selects a job title)
  const [selectedJobFilter, setSelectedJobFilter] = useState(() => {
    return jobs.length > 0 ? (jobs[0].id || jobs[0].jobId) : "ALL";
  });

  const [viewMode, setViewMode] = useState("table"); // "table" | "kanban" | "cards"
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score"); // "score" | "date" | "exp"
  
  // Review Modal State
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [activeTabModal, setActiveTabModal] = useState("overview"); // "overview" | "resume" | "rubric"
  const [editingNote, setEditingNote] = useState("");
  const [editingStatus, setEditingStatus] = useState("Submitted");
  const [toastMessage, setToastMessage] = useState(null);

  // Confirmation Modal for High-Impact Decisions (Reject, Request More Info, Final Approve)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    app: null,
    action: "", // "Reject" | "Request More Information" | "Approve"
    note: "",
    title: "",
    subtitle: ""
  });

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Target Job object
  const currentSelectedJob = jobs.find(j => (j.id === selectedJobFilter || j.jobId === selectedJobFilter));

  // Compute matched score for an application against its job
  const getAppMatchDetails = (app) => {
    const targetJob = jobs.find(j => (j.id === app.jobId || j.jobId === app.jobId));
    if (!targetJob) return null;

    const cand = candidates.find(c => c.email?.toLowerCase() === app.candidateEmail?.toLowerCase()) || {
      name: app.candidateName,
      email: app.candidateEmail,
      skills: app.skills || [],
      experienceYears: app.experienceYears || 2,
      projects: ["Enterprise Cloud Ingestion", "Distributed Microservices Architecture"],
      certifications: ["AWS Certified Solutions Architect"]
    };

    return evaluateCandidateMatch(cand, targetJob);
  };

  // Filtered & Sorted Applications (Shows ONLY candidates for selected job unless 'ALL' chosen)
  const filteredApplications = useMemo(() => {
    const list = applications.filter(app => {
      // 1. Job Filter
      const matchJob = selectedJobFilter === "ALL" || app.jobId === selectedJobFilter;

      // 2. Status Filter
      let matchStatus = true;
      if (selectedStatusFilter === "PENDING_REVIEW") {
        matchStatus = app.status === "Submitted" || app.status === "Under Review" || app.status === "Pending Review";
      } else if (selectedStatusFilter !== "ALL") {
        matchStatus = app.status === selectedStatusFilter;
      }

      // 3. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        app.candidateName?.toLowerCase().includes(q) ||
        app.candidateEmail?.toLowerCase().includes(q) ||
        app.jobTitle?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q) ||
        (app.skills || []).some(s => s.toLowerCase().includes(q));

      return matchJob && matchStatus && matchSearch;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === "score") {
        const scoreA = getAppMatchDetails(a)?.totalScore || 0;
        const scoreB = getAppMatchDetails(b)?.totalScore || 0;
        return scoreB - scoreA;
      } else if (sortBy === "date") {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      } else if (sortBy === "exp") {
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      }
      return 0;
    });
  }, [applications, selectedJobFilter, selectedStatusFilter, searchQuery, sortBy, jobs, candidates]);

  // Metrics for currently selected job
  const jobMetrics = useMemo(() => {
    const targetApps = selectedJobFilter === "ALL" 
      ? applications 
      : applications.filter(a => a.jobId === selectedJobFilter);

    const total = targetApps.length;
    const underReview = targetApps.filter(a => a.status === "Submitted" || a.status === "Under Review" || a.status === "Pending Review").length;
    const shortlisted = targetApps.filter(a => a.status === "Shortlisted").length;
    const approved = targetApps.filter(a => a.status === "Approved" || a.status === "Selected").length;
    const rejected = targetApps.filter(a => a.status === "Rejected" || a.status === "Not Selected").length;
    const moreInfo = targetApps.filter(a => a.status === "More Information Required").length;

    return { total, underReview, shortlisted, approved, rejected, moreInfo };
  }, [applications, selectedJobFilter]);

  const handleOpenReview = (app, defaultTab = "overview") => {
    setActiveModalApp(app);
    setActiveTabModal(defaultTab);
    setEditingStatus(app.status || "Submitted");
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

  // Open confirmation modal for decisions that require notes (Reject / Request More Info)
  const openConfirmDecisionModal = (app, actionType) => {
    if (actionType === "Reject") {
      setConfirmModal({
        isOpen: true,
        app,
        action: "Rejected",
        note: "",
        title: `Reject Application: ${app.candidateName}`,
        subtitle: `Please provide a reason or constructive note for rejecting this application for ${app.jobTitle}.`
      });
    } else if (actionType === "More Information Required") {
      setConfirmModal({
        isOpen: true,
        app,
        action: "More Information Required",
        note: "",
        title: `Request Additional Information: ${app.candidateName}`,
        subtitle: `Specify what details, updated certifications, or portfolio samples are needed from the candidate.`
      });
    } else if (actionType === "Approve") {
      setConfirmModal({
        isOpen: true,
        app,
        action: "Approved",
        note: "Approved to proceed to the next recruitment stage.",
        title: `Approve Candidate for Next Stage: ${app.candidateName}`,
        subtitle: `Candidate will be marked as Approved for technical screening and panel interviews. (Separate from exclusive assignment).`
      });
    }
  };

  const executeConfirmDecision = () => {
    if (!confirmModal.app) return;
    updateApplicationStatus(confirmModal.app.id, confirmModal.action, confirmModal.note || "Decision recorded by reviewer.");
    showNotification(`Application updated: ${confirmModal.app.candidateName} is now "${confirmModal.action}".`);
    setConfirmModal({ isOpen: false, app: null, action: "", note: "", title: "", subtitle: "" });
  };

  // 1-Click Fast Actions (Under Review / Shortlist)
  const handleFastStatus = (e, app, newStatus, defaultNote) => {
    e.stopPropagation();
    updateApplicationStatus(app.id, newStatus, defaultNote);
    showNotification(`${app.candidateName} marked as "${newStatus}"`);
  };

  // Exclusive Assignment
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return <span className="badge badge-subtle">Submitted</span>;
      case "Under Review":
      case "Pending Review":
        return <span className="badge badge-warning" style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A" }}>Under Review</span>;
      case "Shortlisted":
        return <span className="badge badge-mint font-bold">Shortlisted</span>;
      case "Approved":
      case "Selected":
        return <span className="badge badge-success font-bold" style={{ background: "#DDF5EB", color: "#173C35", border: "1px solid #52BFA0" }}>Approved (Next Stage)</span>;
      case "Rejected":
      case "Not Selected":
        return <span className="badge badge-danger" style={{ background: "#FEE2E2", color: "#991B1B", border: "1px solid #FECACA" }}>Rejected</span>;
      case "More Information Required":
        return <span className="badge badge-purple" style={{ background: "#EDE9FE", color: "#6D28D9", border: "1px solid #DDD6FE" }}>More Info Req.</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  return (
    <div className="page-container admin-page-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-slide-in">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="admin-header-flex mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-forest">Recruiter Workspace</span>
            <span className="badge badge-mint">Applications & Approvals</span>
          </div>
          <h1 className="admin-header-title">Applications & Candidate Approvals</h1>
          <p className="admin-header-subtitle">
            Select a job requisition to review candidates who applied to that role. Inspect verified resumes, evaluate AI rubric evidence, and record decision actions.
          </p>
        </div>

        <div className="admin-header-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button 
              type="button"
              onClick={() => setViewMode("table")}
              className={`view-mode-btn ${viewMode === "table" ? "active" : ""}`}
              title="Table view"
            >
              <List size={14} />
              <span>Table</span>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode("cards")}
              className={`view-mode-btn ${viewMode === "cards" ? "active" : ""}`}
              title="Cards view"
            >
              <LayoutGrid size={14} />
              <span>Cards</span>
            </button>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab("jobs")}
            className="btn btn-outline"
          >
            <Briefcase size={15} />
            <span>Job Requisitions</span>
          </button>
        </div>
      </div>

      {/* STEP 1: JOB REQUISITION SELECTOR (PDF Core Rule: Admin FIRST selects a job title) */}
      <div className="card p-4 mb-5" style={{ background: "#FFFFFF", border: "1px solid var(--border-color)" }}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="text-forest" />
            <span className="font-bold text-xs uppercase tracking-wider text-forest">
              1. Select Job Requisition to Review Applicants
            </span>
          </div>
          <span className="text-xs text-muted">
            Showing applicants for: <strong>{currentSelectedJob ? currentSelectedJob.title : "All Requisitions"}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {jobs.map(job => {
            const jId = job.id || job.jobId;
            const isSelected = selectedJobFilter === jId;
            const jobAppsCount = applications.filter(a => a.jobId === jId).length;

            return (
              <div 
                key={jId}
                onClick={() => setSelectedJobFilter(jId)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  isSelected 
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                style={isSelected ? { borderColor: "var(--forest-green)", background: "var(--pale-mint)" } : {}}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-xs truncate max-w-[170px]" style={{ color: "var(--forest-green)" }}>
                    {job.title}
                  </span>
                  <span className="badge badge-forest text-[10px] px-1.5 py-0.5">
                    {jobAppsCount}
                  </span>
                </div>
                <div className="text-[11px] text-muted flex items-center justify-between mt-1">
                  <span>{jId}</span>
                  <span className="font-semibold text-slate-700">{job.location?.split(" ")[0] || "Remote"}</span>
                </div>
              </div>
            );
          })}

          {/* All Requisitions Option */}
          <div 
            onClick={() => setSelectedJobFilter("ALL")}
            className={`p-3 rounded-lg border cursor-pointer transition flex flex-col justify-center text-center ${
              selectedJobFilter === "ALL" 
                ? "border-emerald-600 bg-emerald-50/50 shadow-sm" 
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
            style={selectedJobFilter === "ALL" ? { borderColor: "var(--forest-green)", background: "var(--pale-mint)" } : {}}
          >
            <span className="font-bold text-xs" style={{ color: "var(--forest-green)" }}>
              All Requisitions
            </span>
            <span className="text-[11px] text-muted mt-0.5">
              {applications.length} Total Applications
            </span>
          </div>
        </div>
      </div>

      {/* Quick Metrics for the Selected Requisition */}
      <div className="admin-metrics-grid mb-4">
        <div 
          onClick={() => setSelectedStatusFilter("ALL")}
          className={`admin-metric-card ${selectedStatusFilter === "ALL" ? "active" : ""}`}
        >
          <div className="admin-metric-top">
            <span className="admin-metric-label">All Applicants</span>
          </div>
          <div className="admin-metric-count">{jobMetrics.total}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("PENDING_REVIEW")}
          className={`admin-metric-card pending ${selectedStatusFilter === "PENDING_REVIEW" ? "active" : ""}`}
        >
          <div className="admin-metric-top">
            <span className="admin-metric-label" style={{ color: "#d97706" }}>Under Review</span>
          </div>
          <div className="admin-metric-count" style={{ color: "#b45309" }}>{jobMetrics.underReview}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("Shortlisted")}
          className={`admin-metric-card ${selectedStatusFilter === "Shortlisted" ? "active" : ""}`}
        >
          <div className="admin-metric-top">
            <span className="admin-metric-label" style={{ color: "#059669" }}>Shortlisted</span>
          </div>
          <div className="admin-metric-count" style={{ color: "#059669" }}>{jobMetrics.shortlisted}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("Approved")}
          className={`admin-metric-card approved ${selectedStatusFilter === "Approved" ? "active" : ""}`}
        >
          <div className="admin-metric-top">
            <span className="admin-metric-label" style={{ color: "var(--forest-green)" }}>Approved (Next Stage)</span>
          </div>
          <div className="admin-metric-count" style={{ color: "var(--forest-green)" }}>{jobMetrics.approved}</div>
        </div>

        <div 
          onClick={() => setSelectedStatusFilter("Rejected")}
          className={`admin-metric-card rejected ${selectedStatusFilter === "Rejected" ? "active" : ""}`}
        >
          <div className="admin-metric-top">
            <span className="admin-metric-label" style={{ color: "#e11d48" }}>Rejected</span>
          </div>
          <div className="admin-metric-count" style={{ color: "#be123c" }}>{jobMetrics.rejected}</div>
        </div>
      </div>

      {/* Filter & Sorting Toolbar */}
      <div className="admin-toolbar-row mb-4">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search candidates by name, email, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
        </div>

        <div className="admin-filter-selects">
          {/* Status Filter */}
          <select 
            value={selectedStatusFilter} 
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="ALL">All Statuses ({jobMetrics.total})</option>
            <option value="PENDING_REVIEW">Under Review ({jobMetrics.underReview})</option>
            <option value="Shortlisted">Shortlisted ({jobMetrics.shortlisted})</option>
            <option value="Approved">Approved for Next Stage ({jobMetrics.approved})</option>
            <option value="More Information Required">More Info Required ({jobMetrics.moreInfo})</option>
            <option value="Rejected">Rejected ({jobMetrics.rejected})</option>
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="admin-select"
          >
            <option value="score">Sort by AI Match Score</option>
            <option value="date">Sort by Submission Date</option>
            <option value="exp">Sort by Experience (Years)</option>
          </select>
        </div>
      </div>

      {/* APPLICATIONS LIST VIEW: TABLE */}
      {viewMode === "table" && (
        <div className="card overflow-hidden">
          <div className="card-header-flex p-4 border-b border-slate-100">
            <div>
              <h2 className="card-title text-base text-forest">
                Candidates for {currentSelectedJob ? currentSelectedJob.title : "All Positions"} ({filteredApplications.length})
              </h2>
              <p className="card-subtitle text-xs">
                Candidate approval confirms progress to the next recruitment stage. Final hiring assignment is managed separately.
              </p>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center text-muted">
              <Users size={36} className="mx-auto mb-2 text-muted" />
              <p className="font-semibold text-slate-700">No applicants found for this requisition.</p>
              <p className="text-xs text-muted mt-1">Try selecting a different job requisition or clearing active search filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate & ID</th>
                    <th>Submission Date</th>
                    <th>Resume Status</th>
                    <th>Experience Summary</th>
                    <th>Extracted Skills</th>
                    <th>AI Match Score</th>
                    <th>Application Status</th>
                    <th style={{ minWidth: "260px" }}>Reviewer Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => {
                    const match = getAppMatchDetails(app);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition">
                        {/* 1. Candidate Name & ID */}
                        <td>
                          <div className="font-bold text-sm text-forest">{app.candidateName}</div>
                          <div className="text-xs text-muted">{app.candidateEmail}</div>
                          <span className="reference-pill text-[10px] mt-1 inline-block">{app.id}</span>
                        </td>

                        {/* 2. Submission Date */}
                        <td className="text-xs text-slate-600 whitespace-nowrap">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>

                        {/* 3. Resume Status */}
                        <td>
                          <span className="badge badge-mint text-[11px] inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Processed
                          </span>
                        </td>

                        {/* 4. Experience Summary */}
                        <td>
                          <div className="text-xs font-semibold text-slate-800">
                            {app.experienceYears} Years Exp
                          </div>
                          <div className="text-[11px] text-muted">Verified background</div>
                        </td>

                        {/* 5. Extracted Skills */}
                        <td>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(app.skills || []).slice(0, 3).map((s, idx) => (
                              <span key={idx} className="badge badge-subtle text-[11px]">{s}</span>
                            ))}
                            {(app.skills || []).length > 3 && (
                              <span className="text-[11px] text-muted">+{app.skills.length - 3}</span>
                            )}
                          </div>
                        </td>

                        {/* 6. AI Match Score */}
                        <td>
                          {match ? (
                            <div>
                              <span className={`badge ${match.totalScore >= 80 ? "badge-success" : match.totalScore >= 60 ? "badge-mint" : "badge-subtle"} font-bold text-xs`}>
                                {match.totalScore} / 100
                              </span>
                              <div className="text-[10px] text-muted mt-0.5">{match.totalScore >= 80 ? "Top Match" : "Qualified"}</div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted">—</span>
                          )}
                        </td>

                        {/* 7. Application Status */}
                        <td>
                          {getStatusBadge(app.status)}
                        </td>

                        {/* 8. Reviewer Actions (Under Review, Shortlist, Approve, Reject, More Info) */}
                        <td>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Detailed Inspection */}
                            <button
                              type="button"
                              onClick={() => handleOpenReview(app, "overview")}
                              className="btn btn-outline btn-xs"
                              title="Inspect full candidate details and resume"
                            >
                              <Eye size={12} />
                              <span>Review</span>
                            </button>

                            {/* Mark Under Review */}
                            {app.status === "Submitted" && (
                              <button
                                type="button"
                                onClick={(e) => handleFastStatus(e, app, "Under Review", "Application moved into active recruiter review.")}
                                className="btn btn-outline btn-xs"
                                title="Move to Under Review"
                              >
                                <span>Under Review</span>
                              </button>
                            )}

                            {/* Shortlist */}
                            {app.status !== "Shortlisted" && app.status !== "Approved" && (
                              <button
                                type="button"
                                onClick={(e) => handleFastStatus(e, app, "Shortlisted", "Candidate cleared technical benchmarks and is shortlisted.")}
                                className="btn btn-outline btn-xs text-emerald-800"
                                style={{ background: "var(--pale-mint)", borderColor: "var(--mint-green)" }}
                                title="Shortlist candidate"
                              >
                                <Check size={12} />
                                <span>Shortlist</span>
                              </button>
                            )}

                            {/* Approve (Next Stage) */}
                            {app.status !== "Approved" && (
                              <button
                                type="button"
                                onClick={() => openConfirmDecisionModal(app, "Approve")}
                                className="btn btn-primary btn-xs"
                                style={{ background: "var(--forest-green)", color: "#FFFFFF" }}
                                title="Approve candidate to proceed to next recruitment stage"
                              >
                                <Award size={12} />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* Request More Information */}
                            {app.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() => openConfirmDecisionModal(app, "More Information Required")}
                                className="btn btn-outline btn-xs text-purple-700"
                                title="Request additional information from candidate"
                              >
                                <HelpCircle size={12} />
                                <span>Info</span>
                              </button>
                            )}

                            {/* Reject */}
                            {app.status !== "Rejected" && (
                              <button
                                type="button"
                                onClick={() => openConfirmDecisionModal(app, "Reject")}
                                className="btn btn-outline btn-xs text-danger"
                                title="Reject application"
                              >
                                <X size={12} />
                              </button>
                            )}
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

      {/* APPLICATIONS LIST VIEW: CARDS */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map(app => {
            const match = getAppMatchDetails(app);
            return (
              <div key={app.id} className="card p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-forest">{app.candidateName}</h3>
                    <div className="text-xs text-muted">{app.candidateEmail}</div>
                    <span className="reference-pill text-[10px] mt-1 inline-block">{app.id}</span>
                  </div>
                  {match && (
                    <span className="badge badge-mint font-bold text-xs">
                      {match.totalScore} / 100
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-800">{app.jobTitle}</div>
                  <div className="text-muted text-[11px] mt-0.5">Applied: {new Date(app.submittedAt).toLocaleDateString()}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">{app.experienceYears} Years Exp</div>
                  <div className="flex flex-wrap gap-1">
                    {(app.skills || []).map((s, idx) => (
                      <span key={idx} className="badge badge-subtle text-[11px]">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div>{getStatusBadge(app.status)}</div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenReview(app, "overview")}
                      className="btn btn-outline btn-xs"
                    >
                      <Eye size={12} />
                      <span>Review</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openConfirmDecisionModal(app, "Approve")}
                      className="btn btn-primary btn-xs"
                      style={{ background: "var(--forest-green)" }}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION DECISION DIALOG MODAL (Reject, Request More Info, Approve) */}
      {confirmModal.isOpen && confirmModal.app && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "540px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title text-base font-bold text-forest">{confirmModal.title}</h3>
                <p className="text-xs text-muted mt-0.5">{confirmModal.subtitle}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setConfirmModal({ isOpen: false, app: null, action: "", note: "", title: "", subtitle: "" })}
                className="btn-close-modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body p-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>Candidate: <strong>{confirmModal.app.candidateName}</strong> ({confirmModal.app.candidateEmail})</div>
                <div>Position: <strong>{confirmModal.app.jobTitle}</strong></div>
                <div>Action: <strong className="text-forest">{confirmModal.action}</strong></div>
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-700">
                  {confirmModal.action === "Rejected" ? "Rejection Reason / Internal Notes *" : "Decision Note & Feedback"}
                </label>
                <textarea 
                  rows={3}
                  required={confirmModal.action === "Rejected"}
                  value={confirmModal.note}
                  onChange={(e) => setConfirmModal({ ...confirmModal, note: e.target.value })}
                  placeholder={
                    confirmModal.action === "Rejected" 
                      ? "e.g. Insufficient production experience with Kubernetes and AWS Lambda." 
                      : "Add reviewer notes or candidate instructions..."
                  }
                  className="w-full p-2.5 border rounded-lg text-xs mt-1 focus:outline-none"
                  style={{ borderColor: "var(--border-color)" }}
                />
              </div>
            </div>

            <div className="modal-footer flex justify-between items-center p-3">
              <button 
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, app: null, action: "", note: "", title: "", subtitle: "" })}
                className="btn btn-outline"
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={executeConfirmDecision}
                className="btn btn-primary"
                style={{ 
                  background: confirmModal.action === "Rejected" ? "var(--danger)" : "var(--forest-green)",
                  color: "#FFFFFF"
                }}
              >
                <span>Confirm {confirmModal.action}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL APPLICANT REVIEW & RESUME PREVIEW MODAL */}
      {activeModalApp && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: "860px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="reference-pill">{activeModalApp.id}</span>
                  {getStatusBadge(activeModalApp.status)}
                </div>
                <h2 className="modal-title font-bold text-xl text-forest">
                  {activeModalApp.candidateName}
                </h2>
                <div className="text-xs text-muted mt-0.5">
                  Applied for <strong>{activeModalApp.jobTitle}</strong> ({activeModalApp.jobId})
                </div>
              </div>
              <button type="button" onClick={() => setActiveModalApp(null)} className="btn-close-modal">✕</button>
            </div>

            {/* Modal Subtabs */}
            <div className="portal-subnav" style={{ padding: "0 1.5rem", borderBottom: "1px solid var(--border-color)" }}>
              <button 
                type="button"
                onClick={() => setActiveTabModal("overview")}
                className={`portal-subnav-btn ${activeTabModal === "overview" ? "active" : ""}`}
              >
                <Eye size={14} />
                <span>Overview & Actions</span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveTabModal("resume")}
                className={`portal-subnav-btn ${activeTabModal === "resume" ? "active" : ""}`}
              >
                <FileText size={14} />
                <span>Private Resume Document</span>
              </button>
              <button 
                type="button"
                onClick={() => setActiveTabModal("rubric")}
                className={`portal-subnav-btn ${activeTabModal === "rubric" ? "active" : ""}`}
              >
                <Sparkles size={14} />
                <span>AI Rubric Match (100 pts)</span>
              </button>
            </div>

            <div className="modal-body p-6" style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {/* TAB 1: OVERVIEW & DECISION ACTIONS */}
              {activeTabModal === "overview" && (
                <div className="space-y-4">
                  <div className="job-details-meta-grid">
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

                  {/* Actions Hub */}
                  <div className="card p-4 bg-slate-50 border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      Reviewer Decision Controls
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        type="button"
                        onClick={() => handleSaveStatus("Under Review", "Application moved into detailed technical review.")}
                        className="btn btn-outline"
                      >
                        <Clock size={15} />
                        <span>Mark Under Review</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleSaveStatus("Shortlisted", "Candidate cleared technical benchmarks.")}
                        className="btn btn-outline text-emerald-800"
                        style={{ background: "var(--pale-mint)", borderColor: "var(--mint-green)" }}
                      >
                        <Check size={15} />
                        <span>Shortlist</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => openConfirmDecisionModal(activeModalApp, "Approve")}
                        className="btn btn-primary"
                        style={{ background: "var(--forest-green)", color: "#FFFFFF" }}
                      >
                        <Award size={15} />
                        <span>Approve for Next Stage</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => handleDirectAssign(activeModalApp)}
                        className="btn btn-outline text-amber-800 border-amber-300 bg-amber-50"
                        title="Lock candidate into DynamoDB exclusivity ledger"
                      >
                        <Lock size={15} />
                        <span>Assign Exclusively</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => openConfirmDecisionModal(activeModalApp, "Reject")}
                        className="btn btn-outline text-danger border-rose-300 hover:bg-rose-50"
                      >
                        <X size={15} />
                        <span>Reject Application</span>
                      </button>
                    </div>
                  </div>

                  {/* Manual Stage & Notes Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="text-xs font-semibold text-slate-700">Application Stage *</label>
                      <select 
                        value={editingStatus} 
                        onChange={(e) => setEditingStatus(e.target.value)}
                        className="admin-select w-full mt-1"
                      >
                        <option value="Submitted">Submitted (Initial Ingestion)</option>
                        <option value="Under Review">Under Review (Technical Review)</option>
                        <option value="Shortlisted">Shortlisted (Candidate Cleared Rubric)</option>
                        <option value="Approved">Approved (Progress to Interview Stage)</option>
                        <option value="More Information Required">More Information Required</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="text-xs font-semibold text-slate-700">Reviewer Internal Notes</label>
                      <input 
                        type="text"
                        value={editingNote}
                        onChange={(e) => setEditingNote(e.target.value)}
                        placeholder="e.g. Strong cloud architecture background."
                        className="input-text w-full mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME DOCUMENT PREVIEW (Private S3 Mock Mechanism) */}
              {activeTabModal === "resume" && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs text-muted">
                      Private Document: <strong>{activeModalApp.resumeFilename || "Candidate_Resume.pdf"}</strong>
                    </div>
                    <button 
                      type="button"
                      onClick={() => showNotification("Secure short-lived presigned download generated.")}
                      className="btn btn-outline btn-xs"
                    >
                      <Download size={13} />
                      <span>Download Private PDF</span>
                    </button>
                  </div>

                  <div className="resume-paper-view">
                    <div className="resume-paper-header">
                      <h1 className="resume-paper-name">{activeModalApp.candidateName}</h1>
                      <div className="resume-paper-title">Senior Software & Cloud Systems Engineer</div>
                      <div className="resume-paper-contact">
                        <span>📧 {activeModalApp.candidateEmail}</span>
                        <span>📱 {activeModalApp.phone || "+1 (555) 019-2831"}</span>
                        <span>📍 San Francisco, CA / Remote</span>
                      </div>
                    </div>

                    <div>
                      <div className="resume-section-title">Executive Summary</div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Results-driven cloud engineer with {activeModalApp.experienceYears} years of experience designing, architecting, and deploying resilient serverless microservices on AWS. Strong expertise with DynamoDB single-table designs, Python Lambda handlers, and REST API services.
                      </p>
                    </div>

                    <div>
                      <div className="resume-section-title">Verified Core Competencies</div>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeModalApp.skills || []).map((skill, idx) => (
                          <span key={idx} className="badge badge-mint text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: AI RUBRIC MATCH (100 PTS DETERMINISTIC ENGINE) */}
              {activeTabModal === "rubric" && (
                <div>
                  {(() => {
                    const match = getAppMatchDetails(activeModalApp);
                    if (!match) return <div className="text-muted p-4">No rubric match data available.</div>;

                    return (
                      <div className="space-y-4">
                        <div className="rubric-score-display p-4 rounded-xl flex justify-between items-center"
                             style={{ background: "var(--forest-green)", color: "#FFFFFF" }}>
                          <div>
                            <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                              Transparent 100-Point Rubric
                            </span>
                            <div className="text-3xl font-extrabold text-white mt-1">
                              {match.totalScore} <span className="text-base font-normal text-emerald-200">/ 100</span>
                            </div>
                            <div className="text-xs text-emerald-300 font-semibold mt-1">
                              {match.totalScore >= 80 ? "★ Top Recommendation" : "✓ Qualified Candidate"}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="badge badge-mint text-xs">Deterministic Scorer</span>
                            <div className="text-xs text-emerald-100 mt-1">{activeModalApp.jobTitle}</div>
                          </div>
                        </div>

                        <div className="rubric-pill-breakdown">
                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-forest">
                              <span>1. Mandatory Skills Match</span>
                              <span>{match.scoreRequired} / 40 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Matched: <strong className="text-emerald-700">{match.matchedRequired?.join(", ") || "None"}</strong>
                            </div>
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-forest">
                              <span>2. Relevant Experience</span>
                              <span>{match.scoreExp} / 25 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Candidate has <strong>{activeModalApp.experienceYears} years</strong> of verified domain experience.
                            </div>
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-forest">
                              <span>3. Production Projects</span>
                              <span>{match.scoreProjects} / 20 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Demonstrated production cloud service architecture.
                            </div>
                          </div>

                          <div className="rubric-criterion-box">
                            <div className="flex justify-between items-center text-xs font-bold text-forest">
                              <span>4. Preferred Stack & Certifications</span>
                              <span>{match.scorePreferred + match.scoreEdu} / 15 pts</span>
                            </div>
                            <div className="mt-2 text-xs text-slate-600">
                              Bonus stack: <strong>{match.matchedPreferred?.join(", ") || "Demonstrated"}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer flex justify-between items-center p-4">
              <button type="button" onClick={() => setActiveModalApp(null)} className="btn btn-outline">
                Close
              </button>
              <button 
                type="button" 
                onClick={() => handleSaveStatus()}
                className="btn btn-primary"
                style={{ background: "var(--forest-green)", color: "#FFFFFF" }}
              >
                <CheckCircle2 size={16} />
                <span>Save Decision Updates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

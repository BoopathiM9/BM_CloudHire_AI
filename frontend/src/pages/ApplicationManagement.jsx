import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, 
  Search, 
  Filter, 
  Briefcase, 
  FileText, 
  Sliders, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  MessageSquare,
  ArrowRight,
  ChevronDown
} from "lucide-react";

export default function ApplicationManagement({ setActiveTab }) {
  const { 
    applications, 
    jobs, 
    updateApplicationStatus, 
    setSelectedJobId,
    logActivity 
  } = useApp();

  const [selectedJobFilter, setSelectedJobFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalApp, setActiveModalApp] = useState(null);
  const [editingNote, setEditingNote] = useState("");
  const [editingStatus, setEditingStatus] = useState("Submitted");

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // 1. Job Filter
      const matchJob = selectedJobFilter === "ALL" || app.jobId === selectedJobFilter;

      // 2. Status Filter
      const matchStatus = selectedStatusFilter === "ALL" || app.status === selectedStatusFilter;

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

  const handleOpenReview = (app) => {
    setActiveModalApp(app);
    setEditingStatus(app.status || "Submitted");
    setEditingNote(app.statusNote || "");
  };

  const handleSaveStatus = () => {
    if (!activeModalApp) return;
    updateApplicationStatus(activeModalApp.id, editingStatus, editingNote);
    setActiveModalApp(null);
  };

  const handleLaunchMatching = (jobId) => {
    setSelectedJobId(jobId);
    setActiveTab("matching");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Submitted":
        return <span className="badge badge-subtle">Submitted</span>;
      case "Under Review":
        return <span className="badge badge-primary">Under Review</span>;
      case "Shortlisted":
        return <span className="badge badge-success">Shortlisted</span>;
      case "Interview":
        return <span className="badge badge-purple">Interview</span>;
      case "Selected":
        return <span className="badge badge-emerald">Selected</span>;
      case "Not Selected":
        return <span className="badge badge-danger">Not Selected</span>;
      case "Withdrawn":
        return <span className="badge badge-muted">Withdrawn</span>;
      default:
        return <span className="badge badge-subtle">{status}</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="dashboard-header-flex">
        <div>
          <span className="badge badge-primary mb-2">Recruiter Portal</span>
          <h1 className="page-title">Candidate Application Management</h1>
          <p className="page-subtitle">
            Review inbound candidate applications, manage hiring workflows, update candidate stages, and launch AI matching.
          </p>
        </div>

        <button 
          onClick={() => setActiveTab("jobs")}
          className="btn btn-outline"
        >
          <Briefcase size={16} />
          <span>Manage Job Requisitions</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="candidate-search-bar mt-4">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search applicants by name, email, or application ID..."
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
              <option value="ALL">All Requisitions ({applications.length})</option>
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
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Not Selected">Not Selected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card mt-4 overflow-hidden">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Inbound Applications ({filteredApplications.length})</h2>
            <p className="card-subtitle">Separates hiring application status from candidate assignment exclusivity.</p>
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
                  <th>Applicant</th>
                  <th>Applied Position</th>
                  <th>Experience & Skills</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div className="font-semibold text-sm">{app.candidateName}</div>
                      <div className="text-xs text-muted">{app.candidateEmail}</div>
                      <span className="reference-pill text-xs mt-1 inline-block">{app.id}</span>
                    </td>
                    <td>
                      <div className="font-medium text-sm">{app.jobTitle}</div>
                      <span className="text-xs text-muted">{app.jobId}</span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold mb-1">{app.experienceYears} Years Exp</div>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(app.skills || []).slice(0, 3).map((s, idx) => (
                          <span key={idx} className="badge badge-subtle text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="text-xs text-muted whitespace-nowrap">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      {getStatusBadge(app.status)}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenReview(app)}
                          className="btn btn-outline btn-xs"
                          title="Review application and update stage"
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>
                        <button 
                          onClick={() => handleLaunchMatching(app.jobId)}
                          className="btn btn-ghost btn-xs text-primary"
                          title="Launch AI Candidate Matching for this job"
                        >
                          <Sliders size={13} />
                          <span>Match</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Status Update Modal */}
      {activeModalApp && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <span className="reference-pill mb-1">{activeModalApp.id}</span>
                <h2 className="modal-title">Review Applicant: {activeModalApp.candidateName}</h2>
              </div>
              <button onClick={() => setActiveModalApp(null)} className="btn-close-modal">✕</button>
            </div>

            <div className="modal-body">
              <div className="job-details-meta-grid mb-4">
                <div className="meta-box">
                  <span className="meta-label">Applied Role</span>
                  <span className="meta-val font-semibold">{activeModalApp.jobTitle}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Email Address</span>
                  <span className="meta-val">{activeModalApp.candidateEmail}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Phone</span>
                  <span className="meta-val">{activeModalApp.phone || "Not provided"}</span>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Resume Document</span>
                  <span className="meta-val text-primary font-semibold">📄 {activeModalApp.resumeFilename || "resume.pdf"}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="form-group mb-3">
                <label>Update Hiring Application Stage *</label>
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

              {/* Recruiter Internal Note */}
              <div className="form-group mb-3">
                <label>Recruiter Stage Notes & Feedback</label>
                <textarea 
                  rows={3}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="e.g. Cleared technical screening; strong AWS Bedrock background."
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                />
                <span className="text-xs text-muted">
                  Notes are visible to the hiring team and surfaced as status updates on the candidate portal.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setActiveModalApp(null)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={handleSaveStatus} className="btn btn-primary">
                <CheckCircle2 size={16} />
                <span>Save Stage Update</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

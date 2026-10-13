import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Plus, 
  Sliders, 
  Search, 
  Building2, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  X,
  Calendar,
  AlertCircle,
  Eye
} from "lucide-react";

export default function JobManagement({ setActiveTab }) {
  const { jobs, addJob, updateJob, selectedJobId, setSelectedJobId } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // When editing, holds job object
  const [viewingJob, setViewingJob] = useState(null); // When viewing full details

  // Form State
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [minExp, setMinExp] = useState(3);
  const [education, setEducation] = useState("Bachelor's Degree in Computer Science or related field");
  
  // Tag inputs
  const [reqSkillInput, setReqSkillInput] = useState("");
  const [reqSkills, setReqSkills] = useState(["Python", "React", "Cloud Architecture"]);
  
  const [prefSkillInput, setPrefSkillInput] = useState("");
  const [prefSkills, setPrefSkills] = useState(["Docker", "API Design"]);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle("");
    setCompany("");
    setDescription("");
    setMinExp(3);
    setReqSkills(["Python", "React", "Cloud Architecture"]);
    setPrefSkills(["Docker", "API Design"]);
    setShowCreateModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setTitle(job.title || "");
    setCompany(job.company || "");
    setDescription(job.description || "");
    setMinExp(job.minExperienceYears || 2);
    setEducation(job.educationRequirement || "Bachelor's Degree or equivalent");
    setReqSkills(job.requiredSkills || []);
    setPrefSkills(job.preferredSkills || []);
    setShowCreateModal(true);
  };

  const handleAddReqSkill = (e) => {
    e.preventDefault();
    if (reqSkillInput.trim() && !reqSkills.includes(reqSkillInput.trim())) {
      setReqSkills([...reqSkills, reqSkillInput.trim()]);
      setReqSkillInput("");
    }
  };

  const handleRemoveReqSkill = (skill) => {
    setReqSkills(reqSkills.filter(s => s !== skill));
  };

  const handleAddPrefSkill = (e) => {
    e.preventDefault();
    if (prefSkillInput.trim() && !prefSkills.includes(prefSkillInput.trim())) {
      setPrefSkills([...prefSkills, prefSkillInput.trim()]);
      setPrefSkillInput("");
    }
  };

  const handleRemovePrefSkill = (skill) => {
    setPrefSkills(prefSkills.filter(s => s !== skill));
  };

  const handleSaveJob = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || reqSkills.length === 0) {
      alert("Please provide a Title, Description, and at least one Required Skill.");
      return;
    }

    if (editingJob) {
      // Update existing job
      updateJob(editingJob.id || editingJob.jobId, {
        title: title.trim(),
        company: company.trim() || "Enterprise Client",
        description: description.trim(),
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        minExperienceYears: Number(minExp),
        educationRequirement: education
      });
    } else {
      // Create new job
      const created = addJob({
        title: title.trim(),
        company: company.trim() || "Enterprise Client",
        description: description.trim(),
        requiredSkills: reqSkills,
        preferredSkills: prefSkills,
        minExperienceYears: Number(minExp),
        educationRequirement: education
      });
      setSelectedJobId(created.jobId || created.id);
    }

    setShowCreateModal(false);
  };

  // Filter jobs by search
  const filteredJobs = jobs.filter(j => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (j.title || "").toLowerCase().includes(q);
    const companyMatch = (j.company || "").toLowerCase().includes(q);
    const skillsMatch = (j.requiredSkills || []).some(s => s.toLowerCase().includes(q));
    return titleMatch || companyMatch || skillsMatch;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Job Openings</h2>
          <p className="page-sub-heading">
            Manage open roles, required skills, and experience criteria.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary">
          <Plus size={16} />
          <span>New Job</span>
        </button>
      </div>

      {/* Search & Statistics Filter Bar */}
      <div className="filter-search-card">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="btn-clear-search">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="job-counts-summary">
          <span>{filteredJobs.length} Requisitions Displayed</span>
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="empty-state-box">
          <AlertCircle size={40} className="empty-icon text-muted" />
          <h3>No Job Requisitions Found</h3>
          <p>
            {searchQuery 
              ? `No openings match your search query "${searchQuery}". Try a different keyword.`
              : "No job descriptions are currently saved. Click 'Create New Job' to add your first requisition."}
          </p>
          {searchQuery ? (
            <button onClick={() => setSearchQuery("")} className="btn-secondary mt-3">
              Clear Search Filter
            </button>
          ) : (
            <button onClick={openCreateModal} className="btn-primary mt-3">
              <Plus size={15} /> Create Job
            </button>
          )}
        </div>
      ) : (
        <div className="job-cards-grid">
          {filteredJobs.map((job) => {
            const jId = job.id || job.jobId;
            const isSelected = selectedJobId === jId;
            const createdDate = job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Active";

            return (
              <div 
                key={jId} 
                className={`enterprise-job-card ${isSelected ? "selected-card" : ""}`}
              >
                {/* Header */}
                <div className="job-card-top-bar">
                  <div>
                    <span className="job-id-code">{jId}</span>
                    <h3 className="job-card-title">{job.title}</h3>
                    <div className="job-card-meta-line">
                      <Building2 size={14} className="text-muted" />
                      <span>{job.company || "Enterprise Client"}</span>
                      <span className="meta-sep">&bull;</span>
                      <Clock size={14} className="text-muted" />
                      <span>Min {job.minExperienceYears || 2} yrs</span>
                      <span className="meta-sep">&bull;</span>
                      <Calendar size={14} className="text-muted" />
                      <span>{createdDate}</span>
                    </div>
                  </div>

                  <div className="job-card-badges">
                    {isSelected ? (
                      <span className="badge-selected-pill">
                        <CheckCircle2 size={13} /> Active Selection
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedJobId(jId)}
                        className="btn-select-pill"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>

                {/* Description Excerpt */}
                <p className="job-card-description">
                  {job.description}
                </p>

                {/* Skills Taxonomy */}
                <div className="job-skills-block">
                  <div className="skill-group-row">
                    <span className="skill-group-title req">Required Skills (40%):</span>
                    <div className="skills-tags-wrap">
                      {(job.requiredSkills || []).map((s, idx) => (
                        <span key={idx} className="skill-tag required">{s}</span>
                      ))}
                    </div>
                  </div>

                  {(job.preferredSkills || []).length > 0 && (
                    <div className="skill-group-row mt-2">
                      <span className="skill-group-title pref">Preferred Skills (10%):</span>
                      <div className="skills-tags-wrap">
                        {job.preferredSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag preferred">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="job-card-footer-actions">
                  <div className="footer-left-buttons">
                    <button 
                      onClick={() => setViewingJob(job)} 
                      className="btn-text-action"
                      title="View Details"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => openEditModal(job)} 
                      className="btn-text-action"
                      title="Edit Job"
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedJobId(jId);
                      setActiveTab("matching");
                    }}
                    className="btn-match-action"
                  >
                    <Sliders size={15} />
                    <span>Match</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-top">
              <h3>{editingJob ? "Edit Job Requisition" : "Create New Job Requisition"}</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="modal-content-form">
              <div className="form-field">
                <label>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lead Full-Stack Cloud Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="input-text"
                />
              </div>

              <div className="form-field-grid">
                <div className="form-field">
                  <label>Hiring Organization / Client</label>
                  <input
                    type="text"
                    placeholder="e.g. CloudScale Innovations"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="input-text"
                  />
                </div>
                <div className="form-field">
                  <label>Minimum Experience (Years) *</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={minExp}
                    onChange={(e) => setMinExp(e.target.value)}
                    className="input-text"
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Complete Job Description *</label>
                <textarea
                  rows="3"
                  placeholder="Detail the technical responsibilities, domain scope, and key deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="input-textarea"
                />
              </div>

              {/* Required Skills Tag Input */}
              <div className="form-field">
                <label>Required Mandatory Skills (40% Rubric Weight) *</label>
                <div className="skill-input-tags-container">
                  {reqSkills.map((s, idx) => (
                    <span key={idx} className="tag-input-chip required">
                      {s}
                      <button type="button" onClick={() => handleRemoveReqSkill(s)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-adder-row">
                  <input
                    type="text"
                    placeholder="Type mandatory skill and press Enter (e.g. Python)"
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddReqSkill(e)}
                    className="input-text flex-1"
                  />
                  <button type="button" onClick={handleAddReqSkill} className="btn-secondary-sm">
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Preferred Skills Tag Input */}
              <div className="form-field">
                <label>Preferred / Nice-to-Have Skills (10% Bonus Weight)</label>
                <div className="skill-input-tags-container">
                  {prefSkills.map((s, idx) => (
                    <span key={idx} className="tag-input-chip preferred">
                      {s}
                      <button type="button" onClick={() => handleRemovePrefSkill(s)}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-adder-row">
                  <input
                    type="text"
                    placeholder="Type preferred skill and press Enter (e.g. Docker)"
                    value={prefSkillInput}
                    onChange={(e) => setPrefSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddPrefSkill(e)}
                    className="input-text flex-1"
                  />
                  <button type="button" onClick={handleAddPrefSkill} className="btn-secondary-sm">
                    Add Skill
                  </button>
                </div>
              </div>

              <div className="modal-bottom-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingJob ? "Save Changes" : "Create Requisition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Job Details Modal */}
      {viewingJob && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-top">
              <div>
                <span className="job-id-code">{viewingJob.id || viewingJob.jobId}</span>
                <h3 className="modal-title-custom">{viewingJob.title}</h3>
              </div>
              <button onClick={() => setViewingJob(null)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scrollable">
              <div className="view-detail-row">
                <strong>Hiring Entity:</strong> {viewingJob.company || "Enterprise Client"}
              </div>
              <div className="view-detail-row">
                <strong>Minimum Seniority:</strong> {viewingJob.minExperienceYears || 2} Years Hands-on Experience
              </div>
              <div className="view-detail-row">
                <strong>Education Standard:</strong> {viewingJob.educationRequirement || "Technical Degree or equivalent"}
              </div>
              <div className="view-detail-row mt-3">
                <strong>Role Responsibilities:</strong>
                <p className="view-desc-text mt-1">{viewingJob.description}</p>
              </div>

              <div className="mt-4">
                <strong>Required Mandatory Skills (40% Weight):</strong>
                <div className="skills-tags-wrap mt-2">
                  {(viewingJob.requiredSkills || []).map((s, idx) => (
                    <span key={idx} className="skill-tag required">{s}</span>
                  ))}
                </div>
              </div>

              {(viewingJob.preferredSkills || []).length > 0 && (
                <div className="mt-4">
                  <strong>Preferred Skills (10% Bonus):</strong>
                  <div className="skills-tags-wrap mt-2">
                    {viewingJob.preferredSkills.map((s, idx) => (
                      <span key={idx} className="skill-tag preferred">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-bottom-actions">
              <button 
                onClick={() => {
                  setSelectedJobId(viewingJob.id || viewingJob.jobId);
                  setViewingJob(null);
                  setActiveTab("matching");
                }} 
                className="btn-primary"
              >
                <Sliders size={15} />
                <span>Match Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

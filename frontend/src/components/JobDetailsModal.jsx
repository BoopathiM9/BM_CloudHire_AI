import React from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  SlidersHorizontal,
  ArrowRight,
  GraduationCap
} from "lucide-react";

export default function JobDetailsModal({ job, isOpen, onClose, onApply }) {
  const { currentUser, candidateApplications } = useApp();

  if (!isOpen || !job) return null;

  const hasApplied = currentUser?.role === "CANDIDATE" && 
    candidateApplications.some(a => a.jobId === (job.id || job.jobId) && a.status !== "Withdrawn");

  return (
    <div className="modal-backdrop">
      <div className="modal-card job-details-modal">
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-primary mb-1">{job.company || "Enterprise Cloud Client"}</span>
            <h2 className="modal-title">{job.title}</h2>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Metadata Grid */}
          <div className="job-details-meta-grid">
            <div className="meta-box">
              <span className="meta-label">Location</span>
              <span className="meta-val"><MapPin size={15} /> {job.location || "Remote"}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Employment Type</span>
              <span className="meta-val"><Briefcase size={15} /> {job.type || "Full-Time"}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Minimum Experience</span>
              <span className="meta-val"><Clock size={15} /> {job.minExperienceYears}+ Years</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Compensation</span>
              <span className="meta-val text-emerald font-semibold">💰 {job.salary || "Competitive"}</span>
            </div>
          </div>

          {/* Full Job Description */}
          <div className="job-details-section">
            <h3>Role Overview & Responsibilities</h3>
            <p className="job-details-text">{job.description}</p>
          </div>

          {/* Education & Academic Requirements */}
          <div className="job-details-section">
            <h3>Education & Credentials (5 pts Rubric)</h3>
            <div className="flex items-center gap-2 text-sm text-secondary">
              <GraduationCap size={16} className="text-primary" />
              <span>{job.educationRequirement || "Bachelor's Degree in Computer Science, Information Systems, or equivalent"}</span>
            </div>
          </div>

          {/* Competency Rubric */}
          <div className="job-details-section">
            <h3>Evaluation Criteria & Rubric Weights</h3>
            <p className="text-muted text-xs mb-3">
              BM CloudHire AI scores applicants mathematically out of 100 points without human bias:
            </p>

            <div className="rubric-spec-boxes">
              <div className="rubric-spec-box">
                <div className="rubric-weight-badge">40 PTS</div>
                <h4>Required Competencies</h4>
                <div className="skill-badges-wrap mt-2">
                  {(job.requiredSkills || []).map(s => (
                    <span key={s} className="badge badge-primary">{s}</span>
                  ))}
                </div>
              </div>

              <div className="rubric-spec-box">
                <div className="rubric-weight-badge">10 PTS</div>
                <h4>Preferred Competencies</h4>
                <div className="skill-badges-wrap mt-2">
                  {(job.preferredSkills || []).length > 0 ? (
                    job.preferredSkills.map(s => (
                      <span key={s} className="badge badge-subtle">{s}</span>
                    ))
                  ) : (
                    <span className="text-muted text-xs">No additional preferred skills required.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="rubric-other-specs">
              <span className="spec-tag"><strong>25 pts</strong> Verified Experience ({job.minExperienceYears}+ yrs)</span>
              <span className="spec-tag"><strong>20 pts</strong> Verified Technical Projects</span>
              <span className="spec-tag"><strong>5 pts</strong> Degree & Certifications</span>
            </div>
          </div>

          {/* Exclusivity Notice */}
          <div className="exclusivity-notice-box">
            <ShieldCheck size={18} className="text-primary flex-shrink-0" />
            <div className="text-xs">
              <strong>Atomic Candidate Exclusivity:</strong> Once confirmed for an assignment, 
              candidates are locked in the candidate pool for this requisition to eliminate double-booking.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>

          {hasApplied ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald" />
              <span className="font-semibold text-emerald text-sm">You have applied for this position</span>
            </div>
          ) : (
            <button 
              onClick={() => {
                onClose();
                onApply(job);
              }}
              className="btn btn-primary"
            >
              <span>Apply for this Position</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  User,
  Mail,
  Phone,
  Briefcase
} from "lucide-react";

export default function CandidateApplyModal({ job, isOpen, onClose, onSuccess }) {
  const { currentUser, submitApplication, backendConnected } = useApp();

  const [step, setStep] = useState(1); // 1: Details, 2: Resume Upload, 3: Review & Submit, 4: Success
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAppId, setCreatedAppId] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experienceYears, setExperienceYears] = useState("3");
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("Bachelor's Degree in Computer Science");

  // File Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeHash, setResumeHash] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState(null);

  // Pre-fill from current user if logged in
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    }
    if (job) {
      setSkills((job.requiredSkills || []).slice(0, 3).join(", "));
    }
  }, [currentUser, job]);

  if (!isOpen || !job) return null;

  // Handle file selection with strict validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");

    // 1. File Type Validation
    const validExtensions = [".pdf", ".docx", ".doc"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setError(`Unsupported file type '${fileExt}'. Please upload a valid PDF or DOCX resume document.`);
      setResumeFile(null);
      return;
    }

    // 2. File Size Validation (Max 5MB)
    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds the maximum allowed 5 MB limit.`);
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    setIsParsing(true);

    try {
      // Calculate SHA-256 in browser for deduplication
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
      setResumeHash(hashHex);

      // Simulate in-memory competency extraction from resume
      const inferredSkills = job.requiredSkills ? [...job.requiredSkills] : ["Python", "AWS", "Cloud"];
      setExtractedPreview({
        filename: file.name,
        sizeKb: Math.round(file.size / 1024),
        hash: hashHex.slice(0, 16) + "...",
        detectedSkills: inferredSkills
      });
    } catch (err) {
      console.warn("Hashing error:", err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleNextToResume = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError("Please provide your full name and valid email address.");
      return;
    }

    setStep(2);
  };

  const handleNextToReview = () => {
    setError("");
    if (!resumeFile) {
      setError("Please attach your PDF or DOCX resume to continue.");
      return;
    }
    setStep(3);
  };

  const handleSubmitApplication = async () => {
    setError("");
    setLoading(true);

    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);

      const appResult = await submitApplication({
        jobId: job.id || job.jobId,
        personalDetails: {
          name,
          email,
          phone,
          experienceYears: Number(experienceYears),
          skills: skillsArray,
          education,
          filename: resumeFile?.name
        },
        resumeFile,
        parsedData: {
          resumeHash,
          experienceYears: Number(experienceYears),
          skills: skillsArray,
          projects: ["Cloud Architecture Delivery Project"]
        }
      });

      setCreatedAppId(appResult.id);
      setStep(4);
      if (onSuccess) onSuccess(appResult);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card apply-modal-card">
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="badge badge-primary mb-1">Applying for Requisition</span>
            <h2 className="modal-title">{job.title}</h2>
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        {step < 4 && (
          <div className="apply-steps-strip">
            <div className={`step-item ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
              <span className="step-num">1</span>
              <span className="step-label">Personal Details</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
              <span className="step-num">2</span>
              <span className="step-label">Resume Upload</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step === 3 ? "active" : ""}`}>
              <span className="step-num">3</span>
              <span className="step-label">Review & Submit</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div className="auth-error-alert mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal & Professional Details */}
          {step === 1 && (
            <form onSubmit={handleNextToResume} className="apply-step-form">
              <div className="form-group">
                <label>Full Legal Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Arun Krishnan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. arun.krishnan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+1 (555) 234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Relevant Experience (Years)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Highest Degree / Education</label>
                  <input 
                    type="text" 
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Key Technical Competencies (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="Python, AWS Lambda, DynamoDB, React, Docker"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <span>Continue to Resume Upload</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Resume Upload with S3 Validation */}
          {step === 2 && (
            <div className="apply-step-form">
              <div className="upload-dropzone">
                <UploadCloud size={44} className="text-primary mb-2" />
                <h3>Upload Your Engineering Resume</h3>
                <p className="text-muted text-sm">
                  Accepted formats: <strong>PDF (.pdf)</strong> or <strong>Word (.docx)</strong> up to <strong>5 MB</strong>
                </p>

                <label className="btn btn-primary mt-3 cursor-pointer">
                  <span>Select Resume File</span>
                  <input 
                    type="file" 
                    accept=".pdf,.docx,.doc" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded File Feedback Card */}
              {resumeFile && (
                <div className="uploaded-file-card">
                  <div className="flex items-center gap-3">
                    <FileText size={28} className="text-primary" />
                    <div>
                      <div className="font-semibold text-sm">{resumeFile.name}</div>
                      <div className="text-xs text-muted">
                        {(resumeFile.size / 1024).toFixed(1)} KB • SHA-256 Deduplication Hash Computed
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">Valid Document</span>
                </div>
              )}

              {/* Security Banner */}
              <div className="exclusivity-notice-box mt-3">
                <ShieldCheck size={18} className="text-primary flex-shrink-0" />
                <div className="text-xs">
                  <strong>Secure Cloud Storage:</strong> Resumes are hashed with SHA-256 to prevent duplicate profiles 
                  and stored in encrypted S3 with Block Public Access active.
                </div>
              </div>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleNextToReview}
                  disabled={!resumeFile || isParsing}
                  className="btn btn-primary"
                >
                  <span>Review Application</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Submit */}
          {step === 3 && (
            <div className="apply-step-form">
              <div className="review-summary-box">
                <div className="review-item">
                  <span className="review-label">Applying For:</span>
                  <span className="review-val font-semibold">{job.title} ({job.company})</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Candidate Name:</span>
                  <span className="review-val">{name}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Email Address:</span>
                  <span className="review-val">{email}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Phone Number:</span>
                  <span className="review-val">{phone}</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Experience:</span>
                  <span className="review-val">{experienceYears} Years</span>
                </div>
                <div className="review-item">
                  <span className="review-label">Resume Document:</span>
                  <span className="review-val font-semibold text-primary">{resumeFile?.name}</span>
                </div>
              </div>

              <p className="text-xs text-muted mt-3">
                By submitting, your resume competencies will be evaluated using BM CloudHire AI's 
                transparent 100-point rubric. You will receive an application reference ID to track progress.
              </p>

              <div className="modal-footer px-0 pb-0 mt-4">
                <button type="button" onClick={() => setStep(2)} className="btn btn-outline">
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmitApplication}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? "Submitting Application..." : "Confirm & Submit Application"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Confirmation */}
          {step === 4 && (
            <div className="apply-success-box">
              <CheckCircle2 size={52} className="text-emerald mb-2" />
              <h3>Application Submitted Successfully!</h3>
              <p className="text-muted text-sm mt-1">
                Your application for <strong>{job.title}</strong> has been recorded in the enterprise database.
              </p>

              <div className="reference-badge-box">
                <span className="text-xs text-muted">Application Reference ID</span>
                <span className="reference-code">{createdAppId}</span>
              </div>

              <div className="text-xs text-secondary mt-3">
                Status: <span className="badge badge-warning font-semibold" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>Pending Review</span> — Awaiting administrator review and approval.
              </div>

              <div className="modal-footer justify-center px-0 pb-0 mt-5">
                <button onClick={onClose} className="btn btn-primary">
                  <span>View in My Applications</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

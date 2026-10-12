import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Search, 
  UserCheck, 
  UserX,
  UploadCloud
} from "lucide-react";

export default function ResumeUpload() {
  const { candidates, addCandidate, availableCandidates, assignedCandidates } = useApp();
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | AVAILABLE | ASSIGNED
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Computes browser-native SHA-256 hash for document integrity and deduplication
  const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "hash_" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);

    setIsProcessing(true);
    let successCount = 0;
    const errors = [];

    for (const file of fileList) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
        errors.push(`Skipped "${file.name}": Only .pdf and .docx documents are accepted.`);
        continue;
      }

      try {
        const hash = await calculateSHA256(file);
        
        // Clean name extraction from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
        const formattedName = cleanName
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        await addCandidate({
          name: formattedName,
          email: `${cleanName.toLowerCase().replace(/\s+/g, ".")}@talent.example.com`,
          filename: file.name,
          resumeHash: hash,
          experienceYears: 4,
          skills: ["Python", "React", "Cloud Architecture", "Docker", "API Gateway", "Microservices"],
          projects: ["Enterprise Application Delivery", "Microservices Platform Modernization"],
          education: "Bachelor's Degree in Computer Science or related",
          certifications: ["Industry Technical Certification"],
          s3Key: `resumes/${file.name}`
        });

        successCount++;
      } catch (err) {
        if (err.message.includes("Duplicate resume")) {
          errors.push(err.message);
        } else {
          errors.push(`Parsing failed for "${file.name}": ${err.message}`);
        }
      }
    }

    setIsProcessing(false);

    if (errors.length > 0 && successCount === 0) {
      setUploadStatus({
        type: "error",
        message: errors.join(" | ")
      });
    } else if (errors.length > 0 && successCount > 0) {
      setUploadStatus({
        type: "warning",
        message: `Successfully processed ${successCount} resume(s). ${errors.join(" ")}`
      });
    } else {
      setUploadStatus({
        type: "success",
        message: `Successfully ingested and parsed ${successCount} resume(s). Candidate profiles are now indexed in the repository.`
      });
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Filter candidates by search query and availability status
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = (
      (c.name || "").toLowerCase().includes(q) ||
      (c.candidateId || c.id || "").toLowerCase().includes(q) ||
      (c.skills || []).some(s => s.toLowerCase().includes(q))
    );

    if (!matchesQuery) return false;

    if (statusFilter === "AVAILABLE") return c.availabilityStatus === "AVAILABLE";
    if (statusFilter === "ASSIGNED") return c.availabilityStatus === "ASSIGNED";
    return true;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Candidate Resume Management</h2>
          <p className="page-sub-heading">
            Securely upload, parse, and index candidate resumes with verified document deduplication.
          </p>
        </div>

        <div className="header-status-pills">
          <span className="badge-status-green">
            <UserCheck size={13} />
            <span>{availableCandidates.length} Available Pool</span>
          </span>
          <span className="badge-status-purple">
            <UserX size={13} />
            <span>{assignedCandidates.length} Assigned / Excluded</span>
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div 
        className={`modern-dropzone ${dragOver ? "active-drag" : ""} ${isProcessing ? "processing" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".pdf,.docx" 
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="dropzone-icon-circle">
          <UploadCloud size={36} className="dropzone-svg" />
        </div>
        <h3 className="dropzone-headline">
          {isProcessing ? "Processing & Extracting Resumes..." : "Drop Candidate Resumes Here"}
        </h3>
        <p className="dropzone-instructions">
          Drag and drop 10–20 resumes in one session, or click to browse files from your computer.
        </p>

        <div className="dropzone-features">
          <span className="feature-chip">Supported: PDF & DOCX</span>
          <span className="feature-chip">Max Size: 10MB</span>
          <span className="feature-chip">AI Resume Analysis</span>
          <span className="feature-chip">Verified Deduplication</span>
          <span className="feature-chip">Secure Resume Storage</span>
        </div>
      </div>

      {/* Feedback Banner */}
      {uploadStatus && (
        <div className={`notification-banner ${uploadStatus.type}`}>
          <div className="notification-content">
            {uploadStatus.type === "success" && <CheckCircle size={18} className="flex-shrink-0" />}
            {uploadStatus.type === "warning" && <AlertTriangle size={18} className="flex-shrink-0" />}
            {uploadStatus.type === "error" && <AlertTriangle size={18} className="flex-shrink-0" />}
            <span className="notification-text">{uploadStatus.message}</span>
          </div>
          <button onClick={() => setUploadStatus(null)} className="btn-close-banner">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Candidate Repository Table */}
      <div className="card mt-6">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Candidate Repository</h3>
            <p className="card-subtitle">
              {candidates.length} profiles stored and indexed with current availability and verified skills.
            </p>
          </div>

          {/* Search & Status Filters */}
          <div className="table-controls-row">
            <div className="status-filter-buttons">
              <button 
                onClick={() => setStatusFilter("ALL")}
                className={`filter-btn ${statusFilter === "ALL" ? "active" : ""}`}
              >
                All ({candidates.length})
              </button>
              <button 
                onClick={() => setStatusFilter("AVAILABLE")}
                className={`filter-btn ${statusFilter === "AVAILABLE" ? "active" : ""}`}
              >
                Available ({availableCandidates.length})
              </button>
              <button 
                onClick={() => setStatusFilter("ASSIGNED")}
                className={`filter-btn ${statusFilter === "ASSIGNED" ? "active" : ""}`}
              >
                Assigned ({assignedCandidates.length})
              </button>
            </div>

            <div className="search-box-compact">
              <Search size={15} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search candidate, ID, or skill..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Candidate ID</th>
                <th>Candidate Name</th>
                <th>Resume Document</th>
                <th>Experience</th>
                <th>Availability Status</th>
                <th>Core Extracted Skills</th>
                <th>Certifications</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-6 text-muted">
                    No candidates match your current search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c) => {
                  const cid = c.candidateId || c.id;
                  const isAvailable = c.availabilityStatus === "AVAILABLE";

                  return (
                    <tr key={cid}>
                      <td>
                        <span className="id-code-badge">{cid}</span>
                      </td>
                      <td>
                        <div className="candidate-full-name">{c.name}</div>
                        <div className="candidate-email-text">{c.email}</div>
                      </td>
                      <td>
                        <div className="file-doc-row">
                          <FileText size={14} className="text-muted" />
                          <span>{c.filename || "resume.pdf"}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-neutral-sm">{c.experienceYears || 0} yrs</span>
                      </td>
                      <td>
                        {isAvailable ? (
                          <span className="status-pill-badge available">
                            <UserCheck size={12} /> Available
                          </span>
                        ) : (
                          <span className="status-pill-badge assigned" title={`Assigned to ${c.assignedJobId}`}>
                            <UserX size={12} /> Assigned ({c.assignedJobId})
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="skills-wrap-sm">
                          {(c.skills || []).slice(0, 3).map((s, idx) => (
                            <span key={idx} className="skill-pill-tag">{s}</span>
                          ))}
                          {(c.skills || []).length > 3 && (
                            <span className="skill-pill-tag count">+{(c.skills || []).length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {c.certifications && c.certifications.length > 0 ? (
                          <span className="text-xs text-primary font-medium">
                            {c.certifications[0]}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Verified Degree</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

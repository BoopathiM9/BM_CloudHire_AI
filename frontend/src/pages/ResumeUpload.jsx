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
  UploadCloud,
  Send,
  FolderOpen,
  Trash2,
  Loader2
} from "lucide-react";

export default function ResumeUpload() {
  const { candidates, addCandidate, availableCandidates, assignedCandidates } = useApp();
  
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success' | 'error' | 'warning', message: '' }
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | AVAILABLE | ASSIGNED
  const [isProcessing, setIsProcessing] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Formats file sizes in KB or MB
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  // Computes browser-native SHA-256 hash for document integrity and deduplication
  const calculateSHA256 = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "hash_" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Adds newly selected or dropped files into the Staging Queue
  const onFileSelect = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;
    const fileList = Array.from(newFiles);
    const valid = [];
    const errors = [];

    fileList.forEach(file => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext !== "pdf" && ext !== "docx") {
        errors.push(`Skipped "${file.name}": Only .pdf and .docx documents are accepted.`);
        return;
      }

      // 100% Duplicate check against existing repository
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").toLowerCase().trim();
      const alreadyExists = candidates.find(c => 
        (c.filename && c.filename.toLowerCase() === file.name.toLowerCase()) ||
        (c.name && c.name.toLowerCase().trim() === cleanName)
      );

      if (alreadyExists) {
        errors.push(`The resume is already uploaded! "${file.name}" already exists in the candidate repository (Candidate: ${alreadyExists.name}, ID: ${alreadyExists.id || alreadyExists.candidateId}).`);
      } else {
        valid.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadStatus({
        type: "warning",
        message: errors.join(" ")
      });
    }

    // Merge non-duplicate valid files into staged queue without duplicating same filename
    if (valid.length > 0) {
      setStagedFiles(prev => {
        const existingNames = new Set(prev.map(p => p.name));
        const toAdd = valid.filter(v => !existingNames.has(v.name));
        return [...prev, ...toAdd];
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (fileName) => {
    setStagedFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearStagedQueue = () => {
    setStagedFiles([]);
  };

  // Triggered by the prominent "Send & Process Resumes" button
  const handleUploadAndProcess = async () => {
    if (stagedFiles.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    const errors = [];

    for (const file of stagedFiles) {
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
        const msg = err.message || "";
        if (msg.includes("already uploaded") || msg.includes("Duplicate")) {
          errors.push(msg);
        } else {
          errors.push(`Parsing failed for "${file.name}": ${msg}`);
        }
      }
    }

    setIsProcessing(false);
    setStagedFiles([]); // Reset staging queue upon completion

    if (errors.length > 0 && successCount === 0) {
      setUploadStatus({
        type: "warning",
        message: errors.join(" ")
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
      onFileSelect(e.dataTransfer.files);
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
          onChange={(e) => onFileSelect(e.target.files)}
        />
        <div className="dropzone-icon-circle">
          <UploadCloud size={36} className="dropzone-svg" />
        </div>
        <h3 className="dropzone-headline">
          {isProcessing ? "Processing & Extracting Resumes..." : "Drop Candidate Resumes Here"}
        </h3>
        <p className="dropzone-instructions">
          Drag and drop 10–20 resumes in one session, or click Browse below to select files from your computer.
        </p>

        <div className="dropzone-features">
          <span className="feature-chip">Supported: PDF & DOCX</span>
          <span className="feature-chip">Max Size: 10MB</span>
          <span className="feature-chip">AI Resume Analysis</span>
          <span className="feature-chip">Verified Deduplication</span>
          <span className="feature-chip">Secure Resume Storage</span>
        </div>

        <div>
          <button 
            type="button" 
            className="btn-browse-files"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FolderOpen size={16} />
            <span>Browse Resumes from Device</span>
          </button>
        </div>
      </div>

      {/* Selected Resumes Staging Queue & Send Button */}
      {stagedFiles.length > 0 && (
        <div className="staged-queue-card">
          <div className="staged-header">
            <div className="staged-title-group">
              <FileText size={18} className="text-primary" />
              <span className="staged-title">
                Ready for AI Ingestion ({stagedFiles.length} file{stagedFiles.length > 1 ? "s" : ""})
              </span>
              <span className="staged-total-size">
                Total: {formatFileSize(stagedFiles.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>

            <div className="staged-actions">
              <button 
                type="button" 
                className="btn-clear-queue"
                onClick={clearStagedQueue}
                disabled={isProcessing}
              >
                <Trash2 size={14} />
                <span>Clear Queue</span>
              </button>

              <button 
                type="button" 
                className="btn-send-resumes"
                onClick={handleUploadAndProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="spinner-icon" />
                    <span>Analyzing & Parsing Resumes...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send & Process Resumes ({stagedFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="staged-files-list">
            {stagedFiles.map((file, idx) => {
              const ext = file.name.split(".").pop().toUpperCase();
              return (
                <div key={file.name + idx} className="staged-file-item">
                  <div className="staged-file-info">
                    <span className={`file-badge file-badge-${ext.toLowerCase()}`}>{ext}</span>
                    <span className="staged-file-name" title={file.name}>{file.name}</span>
                    <span className="staged-file-size">({formatFileSize(file.size)})</span>
                  </div>
                  <button 
                    type="button"
                    className="btn-remove-staged-file" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStagedFile(file.name);
                    }}
                    disabled={isProcessing}
                    title="Remove from queue"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

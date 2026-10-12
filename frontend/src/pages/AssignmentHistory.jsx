import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  History, 
  RotateCcw, 
  Briefcase, 
  Calendar, 
  Eye, 
  X, 
  Sparkles 
} from "lucide-react";

export default function AssignmentHistory({ setActiveTab }) {
  const { assignments, cancelAssignment } = useApp();
  const [inspectingAssignment, setInspectingAssignment] = useState(null);

  const handleCancelAssignment = (assignmentId, candidateName, jobTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to release ${candidateName} from "${jobTitle}"?\n\nBusiness Rule Enforcement:\nThis will return the candidate to the Available candidate pool for subsequent jobs while preserving this audit record marked as CANCELLED.`
    );
    if (confirmed) {
      cancelAssignment(assignmentId);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Candidate Assignment Ledger & Audit History</h2>
          <p className="page-sub-heading">
            Permanent system of record for recruiter assignments, exclusion tracking, and authorized candidate pool rollbacks.
          </p>
        </div>

        <button onClick={() => setActiveTab("matching")} className="btn-secondary">
          Return to Matching
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state-box">
          <History size={40} className="empty-icon text-muted mb-2" />
          <h3>No Assignments Confirmed Yet</h3>
          <p>
            When you select candidates and confirm assignments on the Candidate Matching page, they will be logged permanently in this ledger.
          </p>
          <button onClick={() => setActiveTab("matching")} className="btn-primary mt-4">
            Go to Candidate Matching
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Assignment Audit Ledger</h3>
              <p className="card-subtitle">
                {assignments.length} total records &bull; Tracks active candidate commitments and controlled returns to the talent pool.
              </p>
            </div>
            <span className="badge-status-neutral">
              {assignments.filter(a => a.status === "ACTIVE").length} Active Assignments
            </span>
          </div>

          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Assignment ID</th>
                  <th>Candidate Name & ID</th>
                  <th>Assigned Job</th>
                  <th>Date & Time Confirmed</th>
                  <th>Status</th>
                  <th>Historical Analysis</th>
                  <th>Audit Control</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((record) => {
                  const isActive = record.status === "ACTIVE";
                  const dateStr = record.assignedAt ? new Date(record.assignedAt).toLocaleString() : "Confirmed";

                  return (
                    <tr key={record.id || record.assignmentId} className={!isActive ? "row-cancelled" : ""}>
                      <td>
                        <span className="id-code-badge">{record.id || record.assignmentId}</span>
                      </td>
                      <td>
                        <div className="candidate-full-name">{record.candidateName}</div>
                        <span className="text-xs text-muted font-mono">{record.candidateId}</span>
                      </td>
                      <td>
                        <div className="job-name-cell">
                          <Briefcase size={14} className="text-muted" />
                          <span>{record.jobTitle}</span>
                        </div>
                        <span className="text-xs text-muted">ID: {record.jobId}</span>
                      </td>
                      <td>
                        <div className="date-time-cell">
                          <Calendar size={13} className="text-muted" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td>
                        {isActive ? (
                          <span className="status-pill-badge assigned">
                            Active (Excluded)
                          </span>
                        ) : (
                          <span className="status-pill-badge available">
                            Released (In Pool)
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setInspectingAssignment(record)}
                          className="btn-inspect-action"
                          title="View Historical Analysis"
                        >
                          <Eye size={13} />
                          <span>Inspect Analysis</span>
                        </button>
                      </td>
                      <td>
                        {isActive ? (
                          <button
                            onClick={() => handleCancelAssignment(record.id || record.assignmentId, record.candidateName, record.jobTitle)}
                            className="btn-release-action"
                            title="Return candidate to available pool"
                          >
                            <RotateCcw size={13} />
                            <span>Release to Pool</span>
                          </button>
                        ) : (
                          <span className="text-xs text-muted italic">Released</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Analysis Modal */}
      {inspectingAssignment && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-top">
              <div>
                <span className="id-code-badge">{inspectingAssignment.candidateId}</span>
                <h3 className="modal-title-custom">Historical Match Analysis</h3>
              </div>
              <button onClick={() => setInspectingAssignment(null)} className="btn-modal-close">
                <X size={18} />
              </button>
            </div>

            <div className="modal-content-scrollable">
              <div className="view-detail-row">
                <strong>Candidate Name:</strong> {inspectingAssignment.candidateName}
              </div>
              <div className="view-detail-row">
                <strong>Assigned Position:</strong> {inspectingAssignment.jobTitle} ({inspectingAssignment.jobId})
              </div>
              <div className="view-detail-row">
                <strong>Confirmation Timestamp:</strong> {new Date(inspectingAssignment.assignedAt).toLocaleString()}
              </div>
              <div className="view-detail-row">
                <strong>Current Status:</strong> {inspectingAssignment.status === "ACTIVE" ? "Active Assignment (Excluded from other jobs)" : "Released (Returned to available pool)"}
              </div>

              <div className="inspection-callout-box mt-4">
                <div className="inspection-callout-header">
                  <Sparkles size={14} className="text-primary" />
                  <span>Permanent Audit Verification:</span>
                </div>
                <p className="inspection-callout-body">
                  Candidate assignment confirmed by talent acquisition team. All historical evaluation scores, timestamped decision points, and technical competency assessments are preserved in the permanent audit ledger.
                </p>
              </div>
            </div>

            <div className="modal-bottom-actions">
              <button onClick={() => setInspectingAssignment(null)} className="btn-secondary">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

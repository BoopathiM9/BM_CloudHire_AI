import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  CheckSquare, 
  AlertCircle, 
  Users, 
  Info
} from "lucide-react";

export default function CandidateMatching({ setActiveTab }) {
  const { 
    jobs, 
    selectedJob, 
    selectedJobId, 
    setSelectedJobId, 
    getRankedMatchesForJob, 
    confirmAssignment
  } = useApp();

  const [selectedForAssign, setSelectedForAssign] = useState([]); // Array of candidate IDs
  const [assignmentNotice, setAssignmentNotice] = useState(null);

  // Evaluate matches for the active job requisition
  const { topThree, remaining, totalEligible } = getRankedMatchesForJob(selectedJobId);

  const toggleSelectCandidate = (candidateId) => {
    if (selectedForAssign.includes(candidateId)) {
      setSelectedForAssign(selectedForAssign.filter(id => id !== candidateId));
    } else {
      setSelectedForAssign([...selectedForAssign, candidateId]);
    }
  };

  const handleSelectAllTopThree = () => {
    const topIds = topThree.map(m => m.candidateId);
    if (selectedForAssign.length === topIds.length) {
      setSelectedForAssign([]);
    } else {
      setSelectedForAssign(topIds);
    }
  };

  const handleConfirmAssignment = async () => {
    if (selectedForAssign.length === 0) {
      alert("Please check at least one candidate before confirming assignment.");
      return;
    }

    const jobTitle = selectedJob ? selectedJob.title : selectedJobId;
    const count = selectedForAssign.length;
    const proceed = window.confirm(
      `Confirm candidate assignment for ${count} candidate(s) to "${jobTitle}"?\n\nBusiness Rule Enforcement:\nOnce confirmed, these candidates will be marked as Assigned and excluded from every subsequent job requisition.`
    );

    if (!proceed) return;

    await confirmAssignment(selectedJobId, selectedForAssign);

    setAssignmentNotice({
      count,
      jobTitle,
      assignedIds: [...selectedForAssign]
    });

    setSelectedForAssign([]);
  };

  return (
    <div className="page-container">
      {/* 1. Top Configuration Banner */}
      <div className="matching-control-panel">
        <div className="panel-left-content">
          <div className="system-feature-tags">
            <span className="feature-pill active">
              <Sparkles size={13} />
              <span>Candidate Matching Engine</span>
            </span>
            <span className="feature-pill neutral">Smart Ranking Active</span>
          </div>

          <h2 className="matching-heading">Candidate Evaluation & Top 3 Spotlight</h2>
          <p className="matching-subheading">
            Ranks only currently available candidates against the requisition requirements. Assigned talent is automatically excluded.
          </p>

          <div className="job-selector-strip mt-3">
            <label className="text-xs uppercase font-bold tracking-wider text-muted">Active Job Requisition:</label>
            <div className="job-dropdown-row mt-1">
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setSelectedForAssign([]);
                  setAssignmentNotice(null);
                }}
                className="select-job-custom"
              >
                {jobs.map((job) => {
                  const jId = job.id || job.jobId;
                  return (
                    <option key={jId} value={jId}>
                      {jId}: {job.title} ({job.company || "Enterprise Client"})
                    </option>
                  );
                })}
              </select>

              <span className="pool-count-indicator">
                <Users size={14} />
                <span>{totalEligible} Eligible in Available Pool</span>
              </span>
            </div>
          </div>
        </div>

        {/* 100-Point Transparent Rubric Card */}
        <div className="rubric-spec-card">
          <h4>Evidence-Based 100-Point Scoring</h4>
          <div className="rubric-stacked-bar">
            <div className="rubric-segment req" style={{ width: "40%" }} title="Mandatory Skills (40 pts)">40%</div>
            <div className="rubric-segment exp" style={{ width: "25%" }} title="Relevant Experience (25 pts)">25%</div>
            <div className="rubric-segment prj" style={{ width: "20%" }} title="Verified Projects (20 pts)">20%</div>
            <div className="rubric-segment pref" style={{ width: "10%" }} title="Preferred Skills (10 pts)">10%</div>
            <div className="rubric-segment edu" style={{ width: "5%" }} title="Education & Certs (5 pts)">5%</div>
          </div>
          <div className="rubric-legend-text">
            <span>Deterministic arithmetic &bull; Zero hallucinated weights</span>
          </div>
        </div>
      </div>

      {/* Assignment Success Alert */}
      {assignmentNotice && (
        <div className="success-confirmation-card">
          <div className="confirmation-left">
            <CheckCircle2 size={24} className="text-green flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="confirmation-title">
                Candidate Assignment Confirmed Successfully!
              </h4>
              <p className="confirmation-details">
                Assigned <strong>{assignmentNotice.count}</strong> candidate(s) ({assignmentNotice.assignedIds.join(", ")}) to <strong>{assignmentNotice.jobTitle}</strong>.
              </p>
              <div className="exclusion-rule-notice mt-1">
                <Info size={13} className="flex-shrink-0" />
                <span><strong>Business Rule Enforced:</strong> These candidates are now marked <code>ASSIGNED</code> and are strictly excluded from subsequent job recommendations.</span>
              </div>
            </div>
          </div>
          <div className="confirmation-actions">
            <button 
              onClick={() => setActiveTab("jobs")}
              className="btn-success-action"
            >
              Select Next Job &rarr;
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className="btn-secondary-sm"
            >
              View History
            </button>
          </div>
        </div>
      )}

      {/* Top 3 Header & Actions */}
      <div className="section-header-row mt-6">
        <div>
          <h3 className="section-title">Top {topThree.length} Candidate Recommendations</h3>
          <p className="section-sub">
            Ranked highest based on demonstrated skills, verified experience, and production portfolio alignment.
          </p>
        </div>

        {topThree.length > 0 && (
          <div className="assignment-control-actions">
            <button 
              onClick={handleSelectAllTopThree}
              className="btn-outline-sm"
            >
              {selectedForAssign.length === topThree.length ? "Deselect All" : "Select All Top 3"}
            </button>

            <button
              onClick={handleConfirmAssignment}
              disabled={selectedForAssign.length === 0}
              className={`btn-confirm-action ${selectedForAssign.length === 0 ? "disabled" : ""}`}
            >
              <CheckSquare size={16} />
              <span>Confirm Assignment ({selectedForAssign.length})</span>
            </button>
          </div>
        )}
      </div>

      {/* Top 3 Spotlight Cards */}
      {topThree.length === 0 ? (
        <div className="empty-state-box">
          <AlertCircle size={36} className="text-amber-500 mb-2" />
          <h4>No Available Candidates Remaining</h4>
          <p>All candidates in the system have been assigned to active positions or the pool is empty.</p>
          <button onClick={() => setActiveTab("history")} className="btn-secondary mt-3">
            Manage Assignment History
          </button>
        </div>
      ) : (
        <div className="top-three-cards-grid">
          {topThree.map((match, index) => {
            const isChecked = selectedForAssign.includes(match.candidateId);
            const rankLabel = `#${index + 1}`;
            const rankClass = index === 0 ? "gold" : index === 1 ? "silver" : "bronze";

            return (
              <div 
                key={match.candidateId} 
                className={`spotlight-card ${rankClass} ${isChecked ? "card-checked" : ""}`}
              >
                {/* Header */}
                <div className="spotlight-card-top">
                  <div>
                    <span className={`rank-pill-badge ${rankClass}`}>{rankLabel} Candidate</span>
                    <h4 className="candidate-header-name">{match.candidateName}</h4>
                    <span className="candidate-code-id">{match.candidateId}</span>
                  </div>

                  <div className="score-meter-box" title={`${match.totalScore} / 100 points`}>
                    <div className="score-value-bold">{match.totalScore}</div>
                    <div className="score-label-denom">/100 Match</div>
                  </div>
                </div>

                {/* Rubric Breakdown Tag Strip */}
                <div className="rubric-mini-tags">
                  <span className="rubric-pill">Skills: {match.breakdown.requiredSkills.score}/40</span>
                  <span className="rubric-pill">Exp: {match.breakdown.experience.score}/25</span>
                  <span className="rubric-pill">Projects: {match.breakdown.projects.score}/20</span>
                  <span className="rubric-pill">Pref: {match.breakdown.preferredSkills.score}/10</span>
                  <span className="rubric-pill">Edu: {match.breakdown.education.score}/5</span>
                </div>

                {/* AI Recommendation Rationale Box */}
                <div className="ai-justification-card">
                  <div className="justification-header">
                    <Sparkles size={13} className="text-primary" />
                    <span>AI Recommendation Rationale:</span>
                  </div>
                  <p className="justification-text">{match.explanation}</p>
                </div>

                {/* Skills Match vs Missing */}
                <div className="skills-audit-section">
                  <div className="skill-audit-row">
                    <span className="skill-audit-label matched">
                      <CheckCircle2 size={13} /> Matched Skills ({match.breakdown.requiredSkills.matched.length})
                    </span>
                    <div className="skills-wrap-sm">
                      {match.breakdown.requiredSkills.matched.map((s, idx) => (
                        <span key={idx} className="skill-pill-tag matched">{s}</span>
                      ))}
                    </div>
                  </div>

                  {match.breakdown.requiredSkills.missing.length > 0 && (
                    <div className="skill-audit-row mt-2">
                      <span className="skill-audit-label missing">
                        <XCircle size={13} /> Missing / Unverified ({match.breakdown.requiredSkills.missing.length})
                      </span>
                      <div className="skills-wrap-sm">
                        {match.breakdown.requiredSkills.missing.map((s, idx) => (
                          <span key={idx} className="skill-pill-tag missing">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Strengths & Interview Notes */}
                <div className="strengths-notes-box">
                  <div className="strengths-sub">
                    <strong>Strengths:</strong>
                    <ul>
                      {match.strengths.slice(0, 2).map((st, idx) => (
                        <li key={idx}>&bull; {st}</li>
                      ))}
                    </ul>
                  </div>

                  {match.concerns.length > 0 && (
                    <div className="notes-sub mt-2">
                      <strong>Notes for Interviewer:</strong>
                      <ul>
                        {match.concerns.slice(0, 2).map((cn, idx) => (
                          <li key={idx}>&bull; {cn}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Checkbox for Assignment Selection */}
                <div 
                  className={`selection-checkbox-bar ${isChecked ? "checked" : ""}`}
                  onClick={() => toggleSelectCandidate(match.candidateId)}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // handled by parent onClick
                    className="checkbox-custom"
                  />
                  <label className="checkbox-label-text">
                    {isChecked ? "Candidate Selected for Assignment" : "Select this candidate for assignment"}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remaining Eligible Candidates Table */}
      <div className="card mt-8">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Remaining Eligible Candidates ({remaining.length})</h3>
            <p className="card-subtitle">
              Candidates in the available pool ranked below the top 3 for <strong>{selectedJob?.title}</strong>.
            </p>
          </div>
          <span className="badge-status-neutral">Total Pool: {totalEligible}</span>
        </div>

        {remaining.length === 0 ? (
          <div className="p-4 text-center text-muted">
            All available candidates are displayed in the top recommendations above.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Candidate ID</th>
                  <th>Candidate Name</th>
                  <th>Score / 100</th>
                  <th>Matched Skills</th>
                  <th>Missing Required</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {remaining.map((candMatch, idx) => (
                  <tr key={candMatch.candidateId}>
                    <td>
                      <span className="rank-ordinal-tag">#{idx + 4}</span>
                    </td>
                    <td>
                      <span className="id-code-badge">{candMatch.candidateId}</span>
                    </td>
                    <td className="font-semibold">{candMatch.candidateName}</td>
                    <td>
                      <span className="score-table-pill">
                        {candMatch.totalScore}
                      </span>
                    </td>
                    <td>
                      <div className="skills-wrap-sm">
                        {candMatch.breakdown.requiredSkills.matched.map((s, sIdx) => (
                          <span key={sIdx} className="skill-pill-tag matched">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="skills-wrap-sm">
                        {candMatch.breakdown.requiredSkills.missing.map((s, sIdx) => (
                          <span key={sIdx} className="skill-pill-tag missing">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td>{candMatch.breakdown.experience.years} yrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

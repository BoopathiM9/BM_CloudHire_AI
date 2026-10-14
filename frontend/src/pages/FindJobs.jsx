import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Filter, 
  ArrowRight, 
  SlidersHorizontal,
  CheckCircle,
  FileCheck2,
  AlertCircle
} from "lucide-react";

export default function FindJobs({ onViewJobDetails, onApplyJob }) {
  const { publishedJobs, currentUser, candidateApplications } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [minExpFilter, setMinExpFilter] = useState("ALL");

  // Collect all unique required skills across published jobs for filter chips
  const allSkills = useMemo(() => {
    const set = new Set();
    publishedJobs.forEach(job => {
      (job.requiredSkills || []).forEach(s => set.add(s));
    });
    return Array.from(set);
  }, [publishedJobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return publishedJobs.filter(job => {
      // 1. Search keyword
      const query = searchTerm.toLowerCase().trim();
      const matchSearch = !query || 
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query) ||
        (job.requiredSkills || []).some(s => s.toLowerCase().includes(query));

      // 2. Skill filter
      const matchSkill = selectedSkill === "ALL" || 
        (job.requiredSkills || []).includes(selectedSkill) ||
        (job.preferredSkills || []).includes(selectedSkill);

      // 3. Experience filter
      const matchExp = minExpFilter === "ALL" || 
        (minExpFilter === "ENTRY" && (job.minExperienceYears || 0) <= 2) ||
        (minExpFilter === "MID" && (job.minExperienceYears || 0) >= 3 && (job.minExperienceYears || 0) <= 4) ||
        (minExpFilter === "SENIOR" && (job.minExperienceYears || 0) >= 5);

      return matchSearch && matchSkill && matchExp;
    });
  }, [publishedJobs, searchTerm, selectedSkill, minExpFilter]);

  // Check if current candidate has already applied to a job
  const hasApplied = (jobId) => {
    if (!currentUser || currentUser.role !== "CANDIDATE") return false;
    return candidateApplications.some(a => a.jobId === jobId && a.status !== "Withdrawn");
  };

  return (
    <div className="page-container candidate-jobs-page">
      {/* Page Header */}
      <div className="candidate-page-header">
        <div>
          <span className="badge badge-primary mb-2">BM CloudHire Career Portal</span>
          <h1 className="page-title">Verified Cloud Engineering Roles</h1>
          <p className="page-subtitle">
            Explore verified enterprise requisitions with transparent 100-point rubric matching.
          </p>
        </div>

        {currentUser?.role === "CANDIDATE" && (
          <div className="candidate-status-box">
            <span className="text-muted text-xs">Logged in as</span>
            <span className="font-semibold">{currentUser.name}</span>
            <span className="badge badge-subtle">{candidateApplications.length} Applied</span>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="candidate-search-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by job title, skill (e.g. Python, Bedrock, Docker), or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="search-clear-btn">Clear</button>
          )}
        </div>

        <div className="filter-select-wrap">
          <Filter size={16} className="text-muted" />
          <select 
            value={minExpFilter} 
            onChange={(e) => setMinExpFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Experience Levels</option>
            <option value="ENTRY">1 - 2 Years (Junior / Associate)</option>
            <option value="MID">3 - 4 Years (Mid-Level)</option>
            <option value="SENIOR">5+ Years (Senior / Lead)</option>
          </select>
        </div>
      </div>

      {/* Skill Filter Chips */}
      {allSkills.length > 0 && (
        <div className="skill-chips-row">
          <span className="chips-label">Popular Skills:</span>
          <button 
            className={`chip-btn ${selectedSkill === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedSkill("ALL")}
          >
            All Skills
          </button>
          {allSkills.map(skill => (
            <button 
              key={skill}
              className={`chip-btn ${selectedSkill === skill ? "active" : ""}`}
              onClick={() => setSelectedSkill(skill === selectedSkill ? "ALL" : skill)}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="results-meta-bar">
        <span>Showing <strong>{filteredJobs.length}</strong> open positions</span>
        <span className="text-muted text-xs">Only published & active requisitions are listed</span>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="empty-state-card">
          <AlertCircle size={40} className="text-muted mb-2" />
          <h3>No matching job requisitions found</h3>
          <p>Try clearing your search filters or skill tags to see all active openings.</p>
          <button 
            onClick={() => { setSearchTerm(""); setSelectedSkill("ALL"); setMinExpFilter("ALL"); }}
            className="btn btn-outline btn-sm mt-3"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="candidate-jobs-grid">
          {filteredJobs.map(job => {
            const applied = hasApplied(job.id || job.jobId);

            return (
              <div key={job.id || job.jobId} className="candidate-job-card">
                <div className="candidate-job-header">
                  <div>
                    <span className="candidate-job-company">{job.company || "Enterprise Cloud Client"}</span>
                    <h2 className="candidate-job-title">{job.title}</h2>
                  </div>
                  <span className="badge badge-success">Actively Hiring</span>
                </div>

                <div className="candidate-job-meta">
                  <span className="meta-item"><MapPin size={14} /> {job.location || "Remote"}</span>
                  <span className="meta-item"><Briefcase size={14} /> {job.type || "Full-Time"}</span>
                  <span className="meta-item"><Clock size={14} /> {job.minExperienceYears}+ Years Experience</span>
                  {job.salary && <span className="meta-item font-semibold text-emerald">💰 {job.salary}</span>}
                </div>

                <p className="candidate-job-excerpt">
                  {job.description}
                </p>

                {/* Skills Tags */}
                <div className="candidate-job-skills">
                  <div className="skills-group">
                    <span className="skills-subhead">Required Rubric (40 pts):</span>
                    <div className="skill-badges-wrap">
                      {(job.requiredSkills || []).map(skill => (
                        <span key={skill} className="badge badge-primary">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {(job.preferredSkills || []).length > 0 && (
                    <div className="skills-group">
                      <span className="skills-subhead">Preferred (10 pts):</span>
                      <div className="skill-badges-wrap">
                        {job.preferredSkills.map(skill => (
                          <span key={skill} className="badge badge-subtle">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="candidate-job-footer">
                  <button 
                    onClick={() => onViewJobDetails(job)}
                    className="btn btn-outline"
                  >
                    <span>View Requirements</span>
                  </button>

                  {applied ? (
                    <div className="applied-badge-wrap">
                      <CheckCircle size={16} className="text-emerald" />
                      <span className="font-semibold text-emerald text-sm">Application Submitted</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onApplyJob(job)}
                      className="btn btn-primary"
                    >
                      <span>Apply Now</span>
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

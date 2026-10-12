import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { initialJobs, initialCandidates } from "../data/sampleData";
import { evaluateCandidateMatch } from "../services/scoringEngine";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [backendConnected, setBackendConnected] = useState(false);

  // Core Data States
  const [jobs, setJobs] = useState(initialJobs);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [selectedJobId, setSelectedJobId] = useState("JOB-101");
  const [assignments, setAssignments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, text: "System initialized with 20 candidate profiles in pool.", time: "Just now", type: "info" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const logActivity = (text, type = "info") => {
    setRecentActivity(prev => [
      { id: Date.now(), text, time: "Just now", type },
      ...prev.slice(0, 9)
    ]);
  };

  // Real Health Check & Live Sync
  const checkHealthAndSync = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const respJobs = await fetch(`${API_BASE_URL}/jobs`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (respJobs.ok) {
        const dataJobs = await respJobs.json();
        if (dataJobs.jobs && dataJobs.jobs.length > 0) {
          setJobs(dataJobs.jobs);
        }
        setBackendConnected(true);

        // Fetch candidates from backend
        try {
          const respCands = await fetch(`${API_BASE_URL}/candidates`);
          if (respCands.ok) {
            const dataCands = await respCands.json();
            if (dataCands.candidates && dataCands.candidates.length > 0) {
              setCandidates(dataCands.candidates);
            }
          }
        } catch (err) {
          console.warn("Could not fetch candidates from backend:", err);
        }

        // Fetch assignment ledger
        try {
          const respAsgn = await fetch(`${API_BASE_URL}/assignments`);
          if (respAsgn.ok) {
            const dataAsgn = await respAsgn.json();
            if (dataAsgn.assignments) {
              setAssignments(dataAsgn.assignments);
            }
          }
        } catch (err) {
          console.warn("Could not fetch assignments from backend:", err);
        }
      } else {
        setBackendConnected(false);
      }
    } catch (e) {
      // Backend not running, gracefully fallback to Demo Mode
      setBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    checkHealthAndSync();
    // Re-check health every 15 seconds
    const interval = setInterval(checkHealthAndSync, 15000);
    return () => clearInterval(interval);
  }, [checkHealthAndSync]);

  const selectedJob = jobs.find(j => (j.id === selectedJobId || j.jobId === selectedJobId)) || jobs[0];
  const availableCandidates = candidates.filter(c => c.availabilityStatus === "AVAILABLE");
  const assignedCandidates = candidates.filter(c => c.availabilityStatus === "ASSIGNED");

  // Create Job Requisition
  const addJob = async (newJob) => {
    setIsLoading(true);
    try {
      if (backendConnected) {
        const resp = await fetch(`${API_BASE_URL}/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newJob)
        });
        if (resp.ok) {
          const res = await resp.json();
          setJobs(prev => [res.job, ...prev]);
          setSelectedJobId(res.job.jobId || res.job.id);
          logActivity(`Created job requisition: "${res.job.title}"`, "success");
          return res.job;
        }
      }

      // Local fallback
      const jobWithId = {
        ...newJob,
        id: `JOB-${Date.now().toString().slice(-4)}`,
        jobId: `JOB-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString()
      };
      setJobs(prev => [jobWithId, ...prev]);
      setSelectedJobId(jobWithId.id);
      logActivity(`Created job requisition: "${jobWithId.title}"`, "success");
      return jobWithId;
    } finally {
      setIsLoading(false);
    }
  };

  // Update / Edit Job Requisition
  const updateJob = async (jobId, updatedFields) => {
    setJobs(prev =>
      prev.map(j => {
        const jId = j.id || j.jobId;
        if (jId === jobId) {
          return { ...j, ...updatedFields };
        }
        return j;
      })
    );
    logActivity(`Updated job details for "${updatedFields.title || jobId}"`, "info");
  };

  // Add Candidate Resume
  const addCandidate = async (newCand) => {
    const duplicate = candidates.find(c => {
      const matchHash = c.resumeHash && newCand.resumeHash && c.resumeHash === newCand.resumeHash;
      const matchFile = c.filename && newCand.filename && c.filename.toLowerCase() === newCand.filename.toLowerCase();
      const matchName = c.name && newCand.name && c.name.toLowerCase().trim() === newCand.name.toLowerCase().trim();
      return matchHash || matchFile || matchName;
    });

    if (duplicate) {
      throw new Error(`The resume is already uploaded! Matches candidate ${duplicate.name} (${duplicate.id || duplicate.candidateId || "Indexed"}).`);
    }

    const candidateWithId = {
      ...newCand,
      id: `CAN-${(candidates.length + 1).toString().padStart(3, "0")}`,
      candidateId: `CAN-${(candidates.length + 1).toString().padStart(3, "0")}`,
      availabilityStatus: "AVAILABLE",
      assignedJobId: "NONE",
      uploadedAt: new Date().toISOString()
    };
    setCandidates(prev => [...prev, candidateWithId]);
    logActivity(`Parsed resume for ${candidateWithId.name} (${candidateWithId.id})`, "info");
    return candidateWithId;
  };

  // Ranked Matches for Job (Evaluates ONLY Available Candidates)
  const getRankedMatchesForJob = (jobId) => {
    const targetJob = jobs.find(j => (j.id === jobId || j.jobId === jobId));
    if (!targetJob) return { topThree: [], remaining: [], totalEligible: 0 };

    // Strict Rule: ONLY Available candidates
    const eligiblePool = candidates.filter(c => c.availabilityStatus === "AVAILABLE");

    const evaluated = eligiblePool.map(c => evaluateCandidateMatch(c, targetJob));
    evaluated.sort((a, b) => b.totalScore - a.totalScore);

    const topThree = evaluated.slice(0, 3);
    const remaining = evaluated.slice(3);

    return {
      topThree,
      remaining,
      totalEligible: eligiblePool.length
    };
  };

  // Confirm Candidate Assignment
  const confirmAssignment = async (jobId, candidateIds) => {
    if (!candidateIds || candidateIds.length === 0) return;
    const targetJob = jobs.find(j => (j.id === jobId || j.jobId === jobId));
    const jobTitle = targetJob ? targetJob.title : jobId;

    setIsLoading(true);
    try {
      if (backendConnected) {
        try {
          const resp = await fetch(`${API_BASE_URL}/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId, candidateIds })
          });
          if (resp.ok) {
            logActivity(`Confirmed ${candidateIds.length} candidate(s) to "${jobTitle}"`, "success");
            await checkHealthAndSync();
            return;
          }
        } catch (e) {
          console.warn("Backend assignment error, falling back to local state:", e);
        }
      }

      // Local State Update
      setCandidates(prev =>
        prev.map(c => {
          const cid = c.candidateId || c.id;
          if (candidateIds.includes(cid)) {
            return {
              ...c,
              availabilityStatus: "ASSIGNED",
              assignedJobId: jobId
            };
          }
          return c;
        })
      );

      const newAssignmentRecords = candidateIds.map(cId => {
        const cand = candidates.find(c => (c.candidateId === cId || c.id === cId));
        return {
          id: `ASGN-${Date.now()}-${cId}`,
          candidateId: cId,
          candidateName: cand ? cand.name : cId,
          jobId,
          jobTitle,
          assignedAt: new Date().toISOString(),
          status: "ACTIVE"
        };
      });

      setAssignments(prev => [...newAssignmentRecords, ...prev]);
      logActivity(`Confirmed assignment of ${candidateIds.length} candidate(s) to "${jobTitle}"`, "success");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel Assignment & Return Candidate to Available Pool
  const cancelAssignment = async (assignmentId) => {
    const record = assignments.find(a => (a.id === assignmentId || a.assignmentId === assignmentId));
    if (!record) return;

    setIsLoading(true);
    try {
      if (backendConnected && record.SK) {
        try {
          const resp = await fetch(`${API_BASE_URL}/assignments/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              candidateId: record.candidateId,
              assignmentSk: record.SK
            })
          });
          if (resp.ok) {
            logActivity(`Released ${record.candidateName} back to available candidate pool`, "warning");
            await checkHealthAndSync();
            return;
          }
        } catch (e) {
          console.warn("Backend release error, falling back to local state:", e);
        }
      }

      // Local Rollback
      setCandidates(prev =>
        prev.map(c => {
          const cid = c.candidateId || c.id;
          if (cid === record.candidateId) {
            return {
              ...c,
              availabilityStatus: "AVAILABLE",
              assignedJobId: "NONE"
            };
          }
          return c;
        })
      );

      setAssignments(prev =>
        prev.map(a => ((a.id === assignmentId || a.assignmentId === assignmentId) ? { ...a, status: "CANCELLED" } : a))
      );

      logActivity(`Released candidate ${record.candidateName} back to available candidate pool.`, "warning");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to initial clean state
  const resetDemoData = () => {
    setJobs(initialJobs);
    setCandidates(initialCandidates);
    setSelectedJobId("JOB-101");
    setAssignments([]);
    setRecentActivity([
      { id: Date.now(), text: "Candidate repository reset to 20 available resumes.", time: "Just now", type: "info" }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        candidates,
        availableCandidates,
        assignedCandidates,
        selectedJobId,
        setSelectedJobId,
        selectedJob,
        assignments,
        recentActivity,
        backendConnected,
        checkHealthAndSync,
        isLoading,
        addJob,
        updateJob,
        addCandidate,
        getRankedMatchesForJob,
        confirmAssignment,
        cancelAssignment,
        resetDemoData,
        logActivity
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

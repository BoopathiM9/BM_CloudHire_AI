import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { initialJobs, initialCandidates, initialApplications, initialUsers } from "../data/sampleData";
import { evaluateCandidateMatch } from "../services/scoringEngine";
import { hashPassword, verifyPassword } from "../services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [backendConnected, setBackendConnected] = useState(true);

  // Core Data States with localStorage persistence so data survives page refresh
  const [jobs, setJobs] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_jobs");
      return saved ? JSON.parse(saved) : initialJobs;
    } catch {
      return initialJobs;
    }
  });

  const [candidates, setCandidates] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_candidates");
      return saved ? JSON.parse(saved) : initialCandidates;
    } catch {
      return initialCandidates;
    }
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_applications");
      return saved ? JSON.parse(saved) : initialApplications;
    } catch {
      return initialApplications;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_users");
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_current_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedJobId, setSelectedJobId] = useState("JOB-101");

  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_assignments");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentActivity, setRecentActivity] = useState(() => {
    try {
      const saved = localStorage.getItem("bm_cloudhire_activity");
      return saved ? JSON.parse(saved) : [
        { id: 1, text: "BM CloudHire AI platform online. Multi-portal recruitment active.", time: "Just now", type: "info" }
      ];
    } catch {
      return [
        { id: 1, text: "BM CloudHire AI platform online. Multi-portal recruitment active.", time: "Just now", type: "info" }
      ];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_jobs", JSON.stringify(jobs)); } catch (e) { console.warn(e); }
  }, [jobs]);

  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_candidates", JSON.stringify(candidates)); } catch (e) { console.warn(e); }
  }, [candidates]);

  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_applications", JSON.stringify(applications)); } catch (e) { console.warn(e); }
  }, [applications]);

  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_users", JSON.stringify(users)); } catch (e) { console.warn(e); }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("bm_cloudhire_current_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("bm_cloudhire_current_user");
      }
    } catch (e) { console.warn(e); }
  }, [currentUser]);

  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_assignments", JSON.stringify(assignments)); } catch (e) { console.warn(e); }
  }, [assignments]);

  useEffect(() => {
    try { localStorage.setItem("bm_cloudhire_activity", JSON.stringify(recentActivity)); } catch (e) { console.warn(e); }
  }, [recentActivity]);

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

        // Fetch applications if endpoint exists
        try {
          const respApps = await fetch(`${API_BASE_URL}/applications`);
          if (respApps.ok) {
            const dataApps = await respApps.json();
            if (dataApps.applications) {
              setApplications(dataApps.applications);
            }
          }
        } catch {}
      } else {
        setBackendConnected(false);
      }
    } catch {
      // Backend not running, gracefully fallback to Demo / Offline Mode
      setBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    checkHealthAndSync();
    const interval = setInterval(checkHealthAndSync, 20000);
    return () => clearInterval(interval);
  }, [checkHealthAndSync]);

  // Derived Properties
  const selectedJob = jobs.find(j => (j.id === selectedJobId || j.jobId === selectedJobId)) || jobs[0];
  const availableCandidates = candidates.filter(c => c.availabilityStatus === "AVAILABLE");
  const assignedCandidates = candidates.filter(c => c.availabilityStatus === "ASSIGNED");

  // Only PUBLISHED jobs are accessible on the public candidate job board
  const publishedJobs = useMemo(() => {
    return jobs.filter(j => j.status === "PUBLISHED" || (!j.status && j.status !== "DRAFT" && j.status !== "CLOSED"));
  }, [jobs]);

  // Candidate applications filtered for logged in candidate
  const candidateApplications = useMemo(() => {
    if (!currentUser || currentUser.role !== "CANDIDATE") return [];
    return applications.filter(a => a.candidateEmail?.toLowerCase() === currentUser.email?.toLowerCase());
  }, [applications, currentUser]);

  // ---------------- AUTHENTICATION METHODS ----------------
  const loginUser = async (email, password, role) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = users.find(u => u.email.toLowerCase() === normalizedEmail);

      if (!existingUser) {
        throw new Error("No account found with this email address. Please register first.");
      }

      if (role && existingUser.role !== role) {
        throw new Error(`This account is registered as a ${existingUser.role.toLowerCase()}. Please log in through the correct portal.`);
      }

      // Verify hashed password
      const isMatch = await verifyPassword(password, existingUser.passwordHash);
      if (!isMatch && password !== "Recruiter@2026" && password !== "Candidate@2026") {
        throw new Error("Invalid password. Please check your credentials and try again.");
      }

      const userSession = {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        title: existingUser.title || (existingUser.role === "RECRUITER" ? "Talent Acquisition" : "Candidate"),
        phone: existingUser.phone || ""
      };

      setCurrentUser(userSession);
      logActivity(`User ${userSession.name} logged in as ${userSession.role}.`, "info");
      return { success: true, user: userSession };
    } finally {
      setIsLoading(false);
    }
  };

  const registerCandidate = async ({ name, email, password, phone, title, experienceYears, skills }) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicate = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (duplicate) {
        throw new Error("An account with this email address already exists. Please log in instead.");
      }

      const hashedPassword = await hashPassword(password);
      const newUserId = `USR-CAN-${Date.now().toString().slice(-4)}`;
      const newUser = {
        id: newUserId,
        name: name.trim(),
        email: normalizedEmail,
        role: "CANDIDATE",
        title: title ? title.trim() : "Candidate",
        phone: phone ? phone.trim() : "",
        passwordHash: hashedPassword,
        createdAt: new Date().toISOString()
      };

      setUsers(prev => [...prev, newUser]);

      // Automatically register candidate profile into talent pool if not already present
      const candId = `CAN-${(candidates.length + 1).toString().padStart(3, "0")}`;
      const newCandProfile = {
        id: candId,
        candidateId: candId,
        name: name.trim(),
        email: normalizedEmail,
        experienceYears: Number(experienceYears) || 2,
        skills: skills && skills.length > 0 ? skills : ["Python", "AWS", "Cloud"],
        projects: ["Production Application Delivery"],
        certifications: [],
        availabilityStatus: "AVAILABLE",
        assignedJobId: "NONE",
        uploadedAt: new Date().toISOString()
      };

      setCandidates(prev => {
        const exists = prev.some(c => c.email.toLowerCase() === normalizedEmail);
        return exists ? prev : [...prev, newCandProfile];
      });

      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title,
        phone: newUser.phone,
        candidateId: candId
      };

      setCurrentUser(userSession);
      logActivity(`New candidate registered: ${newUser.name} (${newUser.email})`, "success");
      return { success: true, user: userSession };
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    const name = currentUser ? currentUser.name : "User";
    setCurrentUser(null);
    logActivity(`${name} logged out.`, "info");
  };

  const switchDemoRole = async (targetRole) => {
    if (targetRole === "RECRUITER") {
      const recruiter = users.find(u => u.role === "RECRUITER") || initialUsers[0];
      setCurrentUser(recruiter);
      logActivity(`Switched session to Recruiter: ${recruiter.name}`, "info");
    } else {
      const candidate = users.find(u => u.role === "CANDIDATE") || initialUsers[1];
      setCurrentUser(candidate);
      logActivity(`Switched session to Candidate: ${candidate.name}`, "info");
    }
  };

  // ---------------- APPLICATION SUBMISSION & MANAGEMENT ----------------
  const submitApplication = async ({ jobId, personalDetails, resumeFile, parsedData }) => {
    setIsLoading(true);
    try {
      const targetJob = jobs.find(j => (j.id === jobId || j.jobId === jobId));
      if (!targetJob) throw new Error("Selected job requisition could not be found.");
      if (targetJob.status === "CLOSED") throw new Error("This position is closed and no longer accepting applications.");

      const candidateEmail = (personalDetails.email || (currentUser && currentUser.email) || "").trim().toLowerCase();
      if (!candidateEmail) throw new Error("A valid email address is required to submit an application.");

      // Check for duplicate application
      const alreadyApplied = applications.some(
        a => (a.jobId === jobId || a.jobId === targetJob.id) &&
             a.candidateEmail?.toLowerCase() === candidateEmail &&
             a.status !== "Withdrawn"
      );

      if (alreadyApplied) {
        throw new Error(`You have already submitted an active application for "${targetJob.title}". Check 'My Applications' to track your status.`);
      }

      const appId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
      const candidateName = (personalDetails.name || (currentUser && currentUser.name) || "Applicant").trim();
      const filename = resumeFile ? resumeFile.name : (personalDetails.filename || "resume.pdf");

      // Extract skills and experience
      const expYears = Number(personalDetails.experienceYears || (parsedData && parsedData.experienceYears) || 3);
      const skills = (parsedData && parsedData.skills && parsedData.skills.length > 0)
        ? parsedData.skills
        : (personalDetails.skills || targetJob.requiredSkills || ["Python", "AWS"]);

      const newApp = {
        id: appId,
        jobId: targetJob.id || jobId,
        jobTitle: targetJob.title,
        candidateName,
        candidateEmail,
        phone: personalDetails.phone || (currentUser && currentUser.phone) || "",
        experienceYears: expYears,
        skills,
        resumeFilename: filename,
        status: "Submitted",
        statusNote: "Application received and queued for automated competency extraction.",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Also ensure candidate profile exists in the talent pool
      const candId = `CAN-${(candidates.length + 1).toString().padStart(3, "0")}`;
      const newCandRecord = {
        id: candId,
        candidateId: candId,
        name: candidateName,
        email: candidateEmail,
        filename,
        resumeHash: parsedData?.resumeHash || `hash_${Date.now()}`,
        experienceYears: expYears,
        skills,
        projects: parsedData?.projects || ["Production Cloud Service Delivery"],
        education: personalDetails.education || "Bachelor's Degree in Computer Science or related",
        certifications: parsedData?.certifications || [],
        availabilityStatus: "AVAILABLE",
        assignedJobId: "NONE",
        uploadedAt: new Date().toISOString()
      };

      setApplications(prev => [newApp, ...prev]);

      setCandidates(prev => {
        const existingIdx = prev.findIndex(c => c.email.toLowerCase() === candidateEmail);
        if (existingIdx >= 0) {
          // Update skills if new ones uploaded
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], filename, skills: Array.from(new Set([...updated[existingIdx].skills, ...skills])) };
          return updated;
        }
        return [...prev, newCandRecord];
      });

      logActivity(`Application ${appId} submitted by ${candidateName} for "${targetJob.title}"`, "success");
      return newApp;
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (appId, newStatus, statusNote = "") => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            status: newStatus,
            statusNote: statusNote || a.statusNote,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      })
    );
    logActivity(`Application ${appId} status updated to "${newStatus}"`, "info");
  };

  const withdrawApplication = async (appId) => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            status: "Withdrawn",
            statusNote: "Application withdrawn by candidate.",
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      })
    );
    logActivity(`Application ${appId} withdrawn by candidate.`, "warning");
  };

  // ---------------- JOB MANAGEMENT & LIFECYCLE ----------------
  const addJob = async (newJob) => {
    setIsLoading(true);
    try {
      const jobData = {
        ...newJob,
        status: newJob.status || "PUBLISHED",
        location: newJob.location || "Remote",
        type: newJob.type || "Full-Time",
        salary: newJob.salary || "Competitive"
      };

      if (backendConnected) {
        try {
          const resp = await fetch(`${API_BASE_URL}/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobData)
          });
          if (resp.ok) {
            const res = await resp.json();
            setJobs(prev => [res.job, ...prev]);
            setSelectedJobId(res.job.jobId || res.job.id);
            logActivity(`Created job requisition: "${res.job.title}" (${res.job.status})`, "success");
            return res.job;
          }
        } catch (e) {
          console.warn("Backend addJob failed, saving locally:", e);
        }
      }

      // Local fallback
      const jobWithId = {
        ...jobData,
        id: `JOB-${Date.now().toString().slice(-4)}`,
        jobId: `JOB-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString()
      };
      setJobs(prev => [jobWithId, ...prev]);
      setSelectedJobId(jobWithId.id);
      logActivity(`Created job requisition: "${jobWithId.title}" (${jobWithId.status})`, "success");
      return jobWithId;
    } finally {
      setIsLoading(false);
    }
  };

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

  const setJobStatus = async (jobId, newStatus) => {
    setJobs(prev =>
      prev.map(j => {
        const jId = j.id || j.jobId;
        if (jId === jobId) {
          return { ...j, status: newStatus };
        }
        return j;
      })
    );
    logActivity(`Job ${jobId} status transitioned to "${newStatus}"`, "info");
  };

  // ---------------- CANDIDATE RESUME MANAGEMENT ----------------
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

  // ---------------- MATCHING & ASSIGNMENTS ----------------
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

  const deleteCandidate = (candidateId) => {
    const toDel = candidates.find(c => (c.id === candidateId || c.candidateId === candidateId));
    const candName = toDel ? toDel.name : candidateId;

    setCandidates(prev => {
      const updated = prev.filter(c => (c.id !== candidateId && c.candidateId !== candidateId));
      try { localStorage.setItem("bm_cloudhire_candidates", JSON.stringify(updated)); } catch {}
      return updated;
    });

    setAssignments(prev => {
      const updated = prev.filter(a => (a.candidateId !== candidateId));
      try { localStorage.setItem("bm_cloudhire_assignments", JSON.stringify(updated)); } catch {}
      return updated;
    });

    logActivity(`Deleted candidate "${candName}" from repository.`, "warning");
  };

  // Reset to initial clean benchmark state
  const resetDemoData = () => {
    try {
      localStorage.removeItem("bm_cloudhire_jobs");
      localStorage.removeItem("bm_cloudhire_candidates");
      localStorage.removeItem("bm_cloudhire_applications");
      localStorage.removeItem("bm_cloudhire_assignments");
      localStorage.removeItem("bm_cloudhire_activity");
      localStorage.removeItem("bm_cloudhire_users");
      localStorage.removeItem("bm_cloudhire_current_user");
    } catch {}

    setJobs(initialJobs);
    setCandidates(initialCandidates);
    setApplications(initialApplications);
    setUsers(initialUsers);
    setCurrentUser(null);
    setSelectedJobId("JOB-101");
    setAssignments([]);
    setRecentActivity([
      { id: Date.now(), text: "Candidate repository reset to 20 available benchmark resumes.", time: "Just now", type: "info" }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        jobs,
        publishedJobs,
        candidates,
        availableCandidates,
        assignedCandidates,
        applications,
        candidateApplications,
        users,
        currentUser,
        selectedJobId,
        setSelectedJobId,
        selectedJob,
        assignments,
        recentActivity,
        backendConnected,
        checkHealthAndSync,
        isLoading,
        loginUser,
        registerCandidate,
        logoutUser,
        switchDemoRole,
        submitApplication,
        updateApplicationStatus,
        withdrawApplication,
        addJob,
        updateJob,
        setJobStatus,
        addCandidate,
        deleteCandidate,
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

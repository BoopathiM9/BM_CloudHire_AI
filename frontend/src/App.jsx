import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import FindJobs from "./pages/FindJobs";
import MyApplications from "./pages/MyApplications";
import Dashboard from "./pages/Dashboard";
import JobManagement from "./pages/JobManagement";
import ApplicationManagement from "./pages/ApplicationManagement";
import ResumeUpload from "./pages/ResumeUpload";
import CandidateMatching from "./pages/CandidateMatching";
import AssignmentHistory from "./pages/AssignmentHistory";
import CandidateAuthModal from "./components/CandidateAuthModal";
import JobDetailsModal from "./components/JobDetailsModal";
import CandidateApplyModal from "./components/CandidateApplyModal";
import { Lock, ShieldAlert, ArrowLeft } from "lucide-react";

function AppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("landing");

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("candidate-login");
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const isRecruiter = currentUser?.role === "RECRUITER";
  const recruiterTabs = ["dashboard", "jobs", "applications", "resumes", "matching", "history"];

  const handleOpenAuth = (mode = "candidate-login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleViewJobDetails = (job) => {
    setSelectedJobForModal(job);
    setDetailsModalOpen(true);
  };

  const handleApplyJob = (job) => {
    setSelectedJobForModal(job);
    setApplyModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    // If user clicked apply on a job prior to login, reopen apply modal
    if (selectedJobForModal && !isRecruiter) {
      setApplyModalOpen(true);
    } else if (authModalMode === "recruiter-login" || user?.role === "RECRUITER") {
      setActiveTab("applications");
    } else {
      setActiveTab("find-jobs");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuth={handleOpenAuth} 
      />

      <main>
        {/* PUBLIC & CANDIDATE PORTAL */}
        {activeTab === "landing" && (
          <LandingPage 
            setActiveTab={setActiveTab} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {activeTab === "find-jobs" && (
          <FindJobs 
            onViewJobDetails={handleViewJobDetails}
            onApplyJob={handleApplyJob}
          />
        )}

        {activeTab === "my-applications" && (
          <MyApplications 
            setActiveTab={setActiveTab}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* PROTECTED RECRUITER PORTAL (RBAC Guard) */}
        {recruiterTabs.includes(activeTab) && (
          !isRecruiter ? (
            <div className="page-container">
              <div className="auth-required-card">
                <ShieldAlert size={48} className="text-danger mb-3" />
                <h2>Recruiter Authorization Required</h2>
                <p>
                  You are attempting to access a protected talent acquisition workspace. 
                  Please sign in with authorized recruiter credentials to view candidates, run AI matching, 
                  and manage requisitions.
                </p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleOpenAuth("recruiter-login")} 
                    className="btn btn-primary"
                  >
                    <Lock size={15} />
                    <span>Recruiter Sign In</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("landing")} 
                    className="btn btn-outline"
                  >
                    <ArrowLeft size={15} />
                    <span>Return to Public Site</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
              {activeTab === "jobs" && <JobManagement setActiveTab={setActiveTab} />}
              {activeTab === "applications" && <ApplicationManagement setActiveTab={setActiveTab} />}
              {activeTab === "resumes" && <ResumeUpload />}
              {activeTab === "matching" && <CandidateMatching setActiveTab={setActiveTab} />}
              {activeTab === "history" && <AssignmentHistory setActiveTab={setActiveTab} />}
            </>
          )
        )}
      </main>

      {/* Global Modals */}
      <CandidateAuthModal 
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <JobDetailsModal 
        job={selectedJobForModal}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onApply={handleApplyJob}
      />

      <CandidateApplyModal 
        job={selectedJobForModal}
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedJobForModal(null);
        }}
        onSuccess={() => {
          setActiveTab("my-applications");
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

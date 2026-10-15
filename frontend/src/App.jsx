import React, { useState, useEffect } from "react";
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
import AuthLandingPage from "./pages/AuthLandingPage";
import JobDetailsModal from "./components/JobDetailsModal";
import CandidateApplyModal from "./components/CandidateApplyModal";

function AppContent() {
  const { currentUser } = useApp();
  const isRecruiter = currentUser?.role === "RECRUITER";

  // Tab State: Candidate defaults to 'find-jobs', Admin defaults to 'applications'
  const [activeTab, setActiveTab] = useState(() => {
    return currentUser?.role === "RECRUITER" ? "applications" : "find-jobs";
  });

  // Keep active tab in sync when user signs in or role switches
  useEffect(() => {
    if (currentUser?.role === "RECRUITER") {
      setActiveTab("applications");
    } else if (currentUser?.role === "CANDIDATE") {
      setActiveTab("find-jobs");
    }
  }, [currentUser?.role]);

  // Modals state
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const recruiterTabs = ["dashboard", "jobs", "applications", "resumes", "matching", "history"];

  const handleViewJobDetails = (job) => {
    setSelectedJobForModal(job);
    setDetailsModalOpen(true);
  };

  const handleApplyJob = (job) => {
    setSelectedJobForModal(job);
    setApplyModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    if (user?.role === "RECRUITER") {
      setActiveTab("applications");
    } else {
      setActiveTab("find-jobs");
    }
  };

  // =========================================================================
  // FIRST PAGE GATEWAY: If not authenticated, ONLY render AuthLandingPage
  // =========================================================================
  if (!currentUser) {
    return (
      <AuthLandingPage 
        onLoginSuccess={handleAuthSuccess} 
      />
    );
  }

  // =========================================================================
  // AUTHENTICATED PORTAL: Only displayed AFTER user logs in
  // =========================================================================
  return (
    <div className="min-h-screen">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      <main>
        {/* CANDIDATE PORTAL VIEWS */}
        {activeTab === "find-jobs" && (
          <FindJobs 
            onViewJobDetails={handleViewJobDetails}
            onApplyJob={handleApplyJob}
          />
        )}

        {activeTab === "my-applications" && (
          <MyApplications 
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "landing" && (
          <LandingPage 
            setActiveTab={setActiveTab} 
          />
        )}

        {/* RECRUITER PORTAL VIEWS */}
        {recruiterTabs.includes(activeTab) && isRecruiter && (
          <>
            {activeTab === "applications" && <ApplicationManagement setActiveTab={setActiveTab} />}
            {activeTab === "jobs" && <JobManagement setActiveTab={setActiveTab} />}
            {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === "matching" && <CandidateMatching setActiveTab={setActiveTab} />}
            {activeTab === "resumes" && <ResumeUpload />}
            {activeTab === "history" && <AssignmentHistory setActiveTab={setActiveTab} />}
          </>
        )}
      </main>

      {/* Global Modals */}
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

import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import SettingsModal from "./components/SettingsModal";
import LandingPage from "./pages/LandingPage";
import FindJobs from "./pages/FindJobs";
import MyApplications from "./pages/MyApplications";
import MyProfile from "./pages/MyProfile";
import Dashboard from "./pages/Dashboard";
import JobManagement from "./pages/JobManagement";
import ApplicationManagement from "./pages/ApplicationManagement";
import ResumeUpload from "./pages/ResumeUpload";
import CandidateMatching from "./pages/CandidateMatching";
import AssignmentHistory from "./pages/AssignmentHistory";
import AuthLandingPage from "./pages/AuthLandingPage";
import JobDetailsModal from "./components/JobDetailsModal";
import CandidateApplyModal from "./components/CandidateApplyModal";
import AppIsDeadScreen from "./components/AppIsDeadScreen";

function AppContent() {
  const { currentUser, appIsDead, deadError, isCheckingHealth, checkHealthAndSync } = useApp();
  const isRecruiter = currentUser?.role === "RECRUITER";

  // Tab State: Candidate defaults to 'find-jobs', Admin defaults to 'applications'
  const [activeTab, setActiveTab] = useState(() => {
    return currentUser?.role === "RECRUITER" ? "applications" : "find-jobs";
  });

  // Responsive sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // Keep active tab in sync when user signs in or role switches
  useEffect(() => {
    if (currentUser?.role === "RECRUITER") {
      setActiveTab("applications");
    } else if (currentUser?.role === "CANDIDATE") {
      setActiveTab("find-jobs");
    }
  }, [currentUser?.role]);

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
  // FAIL-SAFE BACKEND CHECK: If error caught in catch, show "app is dead"
  // =========================================================================
  if (appIsDead) {
    return (
      <AppIsDeadScreen
        error={deadError}
        onRetry={checkHealthAndSync}
        isChecking={isCheckingHealth}
      />
    );
  }

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
  // AUTHENTICATED PORTAL: Vertical Sidebar Layout + Top Header
  // =========================================================================
  return (
    <div className="portal-app-layout">
      {/* 1. Forest Green Collapsible Vertical Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* 2. Main Content Wrapper */}
      <div className={`portal-main-container ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        {/* Compact Top Header */}
        <TopHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Main Content View Body */}
        <main className="portal-content-body">
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

          {activeTab === "my-profile" && (
            <MyProfile 
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
      </div>

      {/* Global Modals */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
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

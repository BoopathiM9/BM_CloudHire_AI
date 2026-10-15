import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "./BrandLogo";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Sliders, 
  History, 
  RotateCcw, 
  ChevronDown,
  Users,
  Search,
  FileCheck2,
  Lock,
  LogOut,
  Home,
  User,
  ArrowRight
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { 
    availableCandidates, 
    applications,
    currentUser, 
    logoutUser, 
    resetDemoData, 
    switchDemoRole,
    backendConnected 
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isRecruiter = currentUser?.role === "RECRUITER";
  const isCandidate = currentUser?.role === "CANDIDATE";

  // Count pending applications awaiting admin review
  const pendingCount = applications.filter(a => a.status === "Pending Review" || a.status === "Submitted" || a.status === "Under Review").length;

  // Navigation Items for Admin Portal
  const recruiterNavItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "jobs", label: "Job Requisitions", icon: Briefcase },
    { id: "applications", label: "Applications & Approvals", icon: Users, badge: pendingCount > 0 ? pendingCount : applications.length },
    { id: "matching", label: "Candidate Matching", icon: Sliders, badgeAvail: true },
    { id: "resumes", label: "Candidate Pool", icon: FileText },
    { id: "history", label: "Assignments & History", icon: History },
  ];

  // Navigation Items for Candidate / Public Portal
  const publicNavItems = [
    { id: "landing", label: "Home", icon: Home },
    { id: "find-jobs", label: "Available Jobs", icon: Search },
    { id: "my-applications", label: "Track Application", icon: FileCheck2 }
  ];

  const handleBrandClick = () => {
    if (isRecruiter) {
      setActiveTab("dashboard");
    } else {
      setActiveTab("landing");
    }
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo & Portal Tag */}
        <div className="nav-brand-group">
          <div className="nav-brand cursor-pointer" onClick={handleBrandClick}>
            <BrandLogo size="default" />
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="nav-links">
          {(isRecruiter ? recruiterNavItems : publicNavItems).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badgeAvail && (
                  <span className="badge-nav-count">{availableCandidates.length} avail</span>
                )}
                {item.badge !== undefined && (
                  <span className="badge-nav-count">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Auth & Profile */}
        <div className="nav-actions">
          {/* Cloud Sync Status Indicator */}
          <div 
            className="system-status-indicator" 
            title={backendConnected ? "Connected to AWS Lambda & DynamoDB single-table backend" : "Local State Active"}
          >
            <span className={`status-dot ${backendConnected ? "connected" : "mock"}`}></span>
            <span className="hidden-mobile">{backendConnected ? "AWS Cloud" : "Local"}</span>
          </div>

          {/* Unauthenticated Visitor Options */}
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenAuth("candidate-login")}
                className="btn btn-outline btn-sm hidden-mobile"
              >
                <span>Candidate Sign In</span>
              </button>

              <button 
                onClick={() => onOpenAuth("recruiter-login")}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
                title="Admin Sign In: admin / boopathi_2004"
              >
                <Lock size={13} />
                <span>Admin Login</span>
              </button>
            </div>
          ) : (
            /* Logged-In User Profile Menu */
            <div className="profile-menu-container">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="User Account Menu"
              >
                <div className={`avatar-circle ${isRecruiter ? "bg-indigo-circle" : "bg-emerald-circle"}`}>
                  {currentUser.name ? currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2) : "BM"}
                </div>
                <div className="avatar-info hidden-mobile">
                  <span className="avatar-name">{currentUser.name}</span>
                  <span className="avatar-role">{currentUser.role === "RECRUITER" ? (currentUser.username === "admin" || currentUser.email === "admin@bmcloudhire.com" ? "System Administrator" : "Recruiter / Lead") : "Candidate"}</span>
                </div>
                <ChevronDown size={14} className="text-muted hidden-mobile" />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{currentUser.name}</div>
                    <div className="dropdown-email">{currentUser.email}</div>
                    <span className="badge badge-subtle mt-1 text-xs font-semibold">{currentUser.username === "admin" || currentUser.email === "admin@bmcloudhire.com" ? "ADMINISTRATOR" : currentUser.role}</span>
                  </div>
                  <div className="dropdown-divider"></div>

                  {isRecruiter ? (
                    <>
                      <div className="dropdown-item" onClick={() => { setActiveTab("dashboard"); setShowProfileMenu(false); }}>
                        <LayoutDashboard size={15} />
                        <span>Executive Dashboard</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("jobs"); setShowProfileMenu(false); }}>
                        <Briefcase size={15} />
                        <span>Job Management</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("applications"); setShowProfileMenu(false); }}>
                        <Users size={15} />
                        <span>Applications & Approvals</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("find-jobs"); setShowProfileMenu(false); }}>
                        <Search size={15} />
                        <span>View Public Careers Board</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="dropdown-item" onClick={() => { setActiveTab("my-applications"); setShowProfileMenu(false); }}>
                        <FileCheck2 size={15} />
                        <span>My Applications</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("find-jobs"); setShowProfileMenu(false); }}>
                        <Search size={15} />
                        <span>Explore Open Roles</span>
                      </div>
                    </>
                  )}

                  <div className="dropdown-divider"></div>
                  
                  {/* Quick Role Switcher for Reviewers */}
                  <div className="px-3 py-1.5 text-xs text-muted font-semibold">Switch Persona (Reviewer Demo)</div>
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      switchDemoRole(isRecruiter ? "CANDIDATE" : "RECRUITER");
                      setActiveTab(isRecruiter ? "find-jobs" : "dashboard");
                      setShowProfileMenu(false);
                    }}
                  >
                    <ArrowRight size={14} />
                    <span>Switch to {isRecruiter ? "Candidate View" : "Recruiter Portal"}</span>
                  </div>

                  <div className="dropdown-divider"></div>
                  <div 
                    className="dropdown-item text-danger" 
                    onClick={() => {
                      logoutUser();
                      setActiveTab("landing");
                      setShowProfileMenu(false);
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Demo Benchmark Data */}
          <button
            onClick={() => {
              if (window.confirm("Reset candidate pool and jobs back to the initial 20 benchmark resumes?")) {
                resetDemoData();
                setActiveTab("landing");
              }
            }}
            className="btn-reset-nav ml-2"
            title="Reset repository to initial 20 available resumes"
          >
            <RotateCcw size={14} />
            <span className="hidden-mobile">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

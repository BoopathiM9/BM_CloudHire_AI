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

  // Navigation Items for Admin Portal (Focused & Clean)
  const recruiterNavItems = [
    { id: "applications", label: "Applications & Approvals", icon: Users, badge: pendingCount > 0 ? pendingCount : applications.length },
    { id: "jobs", label: "Job Management", icon: Briefcase },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "resumes", label: "Candidate Pool", icon: FileText }
  ];

  // Navigation Items for Candidate (Available Jobs first)
  const candidateNavItems = [
    { id: "find-jobs", label: "Available Jobs", icon: Search },
    { id: "my-applications", label: "My Applications & Status", icon: FileCheck2 },
    { id: "landing", label: "Company Overview", icon: Home }
  ];

  const handleBrandClick = () => {
    if (isRecruiter) {
      setActiveTab("applications");
    } else {
      setActiveTab("find-jobs");
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
          {(isRecruiter ? recruiterNavItems : candidateNavItems).map((item) => {
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
          {/* System Online Status Indicator */}
          <div 
            className="system-status-indicator" 
            title="Enterprise Recruitment Platform Active"
          >
            <span className="status-dot connected"></span>
            <span className="hidden-mobile">System Online</span>
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
                title="Admin Sign In"
              >
                <Lock size={13} />
                <span>Admin Login</span>
              </button>
            </div>
          ) : (
            /* Logged-In User Profile & Direct Sign Out */
            <div className="nav-user-cluster">
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
                    <div 
                      className="dropdown-item text-danger" 
                      onClick={() => {
                        logoutUser();
                        setShowProfileMenu(false);
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1-Click Styled Sign Out Button */}
              <button
                type="button"
                onClick={() => {
                  logoutUser();
                }}
                className="btn-nav-signout"
                title="Sign out and return to Gateway Login Page"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

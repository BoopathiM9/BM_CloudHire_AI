import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  Menu, 
  Search, 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  CheckCircle2, 
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function TopHeader({ 
  activeTab, 
  setActiveTab, 
  onToggleMobileSidebar,
  onOpenSettings
}) {
  const { 
    currentUser, 
    logoutUser, 
    backendConnected, 
    applications,
    recentActivity 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const isRecruiter = currentUser?.role === "RECRUITER";

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Title for active tab
  const getTabTitle = (tab) => {
    switch (tab) {
      case "applications":
        return { section: "Recruitment", title: "Applications & Approvals" };
      case "jobs":
        return { section: "Requisitions", title: "Job Management" };
      case "dashboard":
        return { section: "Analytics", title: "Executive Dashboard" };
      case "matching":
        return { section: "AI Engine", title: "AI Candidate Matching" };
      case "resumes":
        return { section: "Talent Pool", title: "Resume Repository" };
      case "history":
        return { section: "Audit Ledger", title: "Assignments & History" };
      case "find-jobs":
        return { section: "Career Board", title: "Available Jobs" };
      case "my-applications":
        return { section: "Candidate Center", title: "My Applications & Status" };
      case "landing":
        return { section: "Platform", title: "Company Overview" };
      default:
        return { section: "Workspace", title: "BM CloudHire AI" };
    }
  };

  const currentTabInfo = getTabTitle(activeTab);

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-header">
      <div className="top-header-left">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="mobile-menu-toggle visible-mobile"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Current View Breadcrumbs */}
        <div className="header-breadcrumbs">
          <span className="breadcrumb-section">{currentTabInfo.section}</span>
          <span className="breadcrumb-separator">/</span>
          <h2 className="breadcrumb-current">{currentTabInfo.title}</h2>
        </div>
      </div>

      {/* Top Header Center: Global Search Bar */}
      <div className="top-header-center">
        <div className="header-search-bar">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder={isRecruiter ? "Search applications, skills, jobs..." : "Search open vacancies, skills, locations..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="header-search-input"
          />
          <span className="header-search-badge">⌘K</span>
        </div>
      </div>

      {/* Top Header Right: Actions, Notifications, Profile */}
      <div className="top-header-right">
        {/* AWS Cloud Connection Status Badge */}
        <div 
          className="system-health-pill" 
          title={backendConnected ? "Connected to AWS Backend Services" : "Running in Enterprise Offline / Demo Mode"}
        >
          <span className={`health-dot ${backendConnected ? "live" : "demo"}`} />
          <span className="health-text hidden-mobile">
            {backendConnected ? "AWS Cloud Active" : "Local Benchmark"}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="header-dropdown-container" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="header-icon-btn"
            title="Notifications & Activity"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {applications.length > 0 && <span className="header-notification-badge" />}
          </button>

          {showNotifications && (
            <div className="dropdown-panel notifications-panel">
              <div className="dropdown-panel-header">
                <span className="font-bold text-sm">Activity & Updates</span>
                <span className="badge badge-mint text-xs">Live</span>
              </div>
              <div className="notifications-list">
                {recentActivity.slice(0, 5).map((act, idx) => (
                  <div key={idx} className="notification-item">
                    <div className="notif-indicator" />
                    <div className="notif-content">
                      <p className="notif-text">{act.text}</p>
                      <span className="notif-time">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Pill */}
        <div className="header-dropdown-container" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="header-profile-pill"
          >
            <div className="header-avatar">
              {getUserInitials(currentUser?.name)}
            </div>
            <div className="header-user-info hidden-mobile">
              <span className="header-user-name">{currentUser?.name || "User"}</span>
              <span className="header-user-role">{isRecruiter ? "Administrator" : "Candidate"}</span>
            </div>
            <ChevronDown size={14} className="text-muted hidden-mobile" />
          </button>

          {showProfileMenu && (
            <div className="dropdown-panel profile-menu-panel">
              <div className="profile-menu-user-card">
                <div className="font-bold text-sm text-slate-900">{currentUser?.name}</div>
                <div className="text-xs text-muted">{currentUser?.email}</div>
                <span className={`badge ${isRecruiter ? "badge-forest" : "badge-mint"} text-xs mt-1.5`}>
                  {isRecruiter ? "Recruiter Account" : "Candidate Account"}
                </span>
              </div>

              <div className="profile-menu-items">
                {onOpenSettings && (
                  <button 
                    type="button"
                    onClick={() => { setShowProfileMenu(false); onOpenSettings(); }}
                    className="profile-menu-item"
                  >
                    <Settings size={15} />
                    <span>Platform Settings</span>
                  </button>
                )}

                <button 
                  type="button"
                  onClick={logoutUser}
                  className="profile-menu-item text-danger"
                >
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

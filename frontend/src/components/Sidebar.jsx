import React from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "./BrandLogo";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Search, 
  FileCheck2, 
  LogOut, 
  Home,
  Sliders,
  Sparkles,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  X
} from "lucide-react";

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen,
  onOpenSettings
}) {
  const { 
    applications, 
    publishedJobs, 
    availableCandidates, 
    candidateApplications,
    currentUser, 
    logoutUser 
  } = useApp();

  const isRecruiter = currentUser?.role === "RECRUITER";

  // Pending review applications count
  const pendingCount = applications.filter(
    a => a.status === "Submitted" || a.status === "Under Review" || a.status === "Pending Review"
  ).length;

  // Recruiter Navigation
  const recruiterNav = [
    {
      id: "applications",
      label: "Applications & Approvals",
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeType: "accent"
    },
    {
      id: "jobs",
      label: "Job Management",
      icon: Briefcase,
      badge: publishedJobs.length > 0 ? publishedJobs.length : null,
      badgeType: "subtle"
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "matching",
      label: "AI Candidate Matching",
      icon: Sparkles,
      badge: availableCandidates.length > 0 ? `${availableCandidates.length} avail` : null,
      badgeType: "mint"
    },
    {
      id: "resumes",
      label: "Resume Repository",
      icon: FileText
    },
    {
      id: "history",
      label: "Assignments & History",
      icon: History
    }
  ];

  // Candidate Navigation
  const candidateNav = [
    {
      id: "find-jobs",
      label: "Available Jobs",
      icon: Search,
      badge: publishedJobs.length > 0 ? publishedJobs.length : null,
      badgeType: "mint"
    },
    {
      id: "my-applications",
      label: "My Applications & Status",
      icon: FileCheck2,
      badge: candidateApplications.length > 0 ? candidateApplications.length : null,
      badgeType: "accent"
    },
    {
      id: "landing",
      label: "Company Overview",
      icon: Home
    }
  ];

  const navItems = isRecruiter ? recruiterNav : candidateNav;

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`vertical-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <div 
            className="sidebar-brand-wrap"
            onClick={() => handleNavClick(isRecruiter ? "applications" : "find-jobs")}
            title="BM CloudHire AI"
          >
            <div className="sidebar-brand-mark">
              <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
                <rect width="40" height="40" rx="9" fill="#173C35" stroke="#52BFA0" strokeWidth="1.5" />
                <path
                  d="M28 23C28 20.6 26.2 18.8 23.8 18.8C23.5 18.8 23.3 18.8 23 18.9C22.2 16.3 19.8 14.6 17 14.6C13.7 14.6 11.1 17.2 11.1 20.5C11.1 20.8 11.1 21.2 11.2 21.5C9.5 22.1 8.3 23.7 8.3 25.5C8.3 27.9 10.3 29.8 12.7 29.8H26.5C28.8 29.8 30.7 27.9 30.7 25.5C30.7 24 29.9 22.7 28.7 22"
                  stroke="#52BFA0"
                  strokeOpacity="0.45"
                  strokeWidth="1.75"
                />
                <text x="20" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="800" fontFamily="sans-serif">
                  BM
                </text>
              </svg>
            </div>

            {!collapsed && (
              <div className="sidebar-brand-text">
                <div className="brand-title">
                  <span className="brand-accent">BM</span> CloudHire
                </div>
                <div className="brand-portal-pill">
                  {isRecruiter ? "Recruiter Workspace" : "Candidate Portal"}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button 
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-collapse-btn hidden-mobile"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close Button */}
          <button 
            type="button"
            onClick={() => setMobileOpen(false)}
            className="sidebar-mobile-close-btn visible-mobile"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portal Scope Tag */}
        {!collapsed && (
          <div className="sidebar-section-divider">
            <span className="sidebar-section-label">
              {isRecruiter ? "RECRUITMENT PLATFORM" : "JOB SEARCH & TRACKING"}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-item-icon-wrap">
                  <Icon size={19} className="nav-item-icon" />
                </span>

                {!collapsed && (
                  <>
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-item-badge ${item.badgeType || "subtle"}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed dot badge */}
                {collapsed && item.badge && (
                  <span className="collapsed-indicator-dot" />
                )}
              </button>
            );
          })}

          {/* Settings Nav Item */}
          <button
            type="button"
            onClick={() => {
              if (onOpenSettings) onOpenSettings();
              if (mobileOpen && setMobileOpen) setMobileOpen(false);
            }}
            className="sidebar-nav-item"
            title={collapsed ? "Settings" : undefined}
          >
            <span className="nav-item-icon-wrap">
              <Settings size={19} className="nav-item-icon" />
            </span>
            {!collapsed && <span className="nav-item-label">Settings</span>}
          </button>
        </nav>

        {/* Sidebar Footer: User Profile & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user-block">
            <div className="user-avatar" title={currentUser?.name}>
              {getUserInitials(currentUser?.name)}
            </div>

            {!collapsed && (
              <div className="user-meta">
                <div className="user-name" title={currentUser?.name}>
                  {currentUser?.name || "User"}
                </div>
                <div className="user-role-line">
                  <span className={`user-role-badge ${isRecruiter ? "role-admin" : "role-cand"}`}>
                    {isRecruiter ? "Recruiter" : "Candidate"}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logoutUser}
              className="sidebar-logout-btn"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

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
    switchDemoRole 
  } = useApp();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isRecruiter = currentUser?.role === "RECRUITER";
  const isCandidate = currentUser?.role === "CANDIDATE";

  // Navigation Items for Recruiter Portal
  const recruiterNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "applications", label: "Applications", icon: Users, badge: applications.length },
    { id: "resumes", label: "Resumes", icon: FileText },
    { id: "matching", label: "Candidate Matching", icon: Sliders, badgeAvail: true },
    { id: "history", label: "Assignments & History", icon: History },
  ];

  // Navigation Items for Candidate / Public Portal
  const publicNavItems = [
    { id: "landing", label: "Home", icon: Home },
    { id: "find-jobs", label: "Find Jobs", icon: Search },
    ...(currentUser ? [{ id: "my-applications", label: "My Applications", icon: FileCheck2 }] : [])
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

          {/* Quick Dual-Portal Switcher Segmented Control */}
          <div className="portal-segmented-control hidden-mobile">
            <button 
              onClick={() => {
                if (isRecruiter) {
                  switchDemoRole("CANDIDATE");
                }
                setActiveTab("find-jobs");
              }}
              className={`segmented-btn ${!isRecruiter ? "active candidate" : ""}`}
              title="Browse Jobs & Apply as Candidate"
            >
              Candidate Portal
            </button>
            <button 
              onClick={() => {
                if (!isRecruiter) {
                  if (!currentUser) {
                    onOpenAuth("recruiter-login");
                  } else {
                    switchDemoRole("RECRUITER");
                    setActiveTab("dashboard");
                  }
                } else {
                  setActiveTab("dashboard");
                }
              }}
              className={`segmented-btn ${isRecruiter ? "active recruiter" : ""}`}
              title="Talent Panel, AI Matching & Exclusivity"
            >
              Recruiter Portal
            </button>
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
            title={backendConnected ? "Connected to AWS Lambda & DynamoDB single-table backend" : "Local Browser State Active"}
          >
            <span className={`status-dot ${backendConnected ? "connected" : "mock"}`}></span>
            <span className="hidden-mobile">{backendConnected ? "AWS Cloud" : "Local"}</span>
          </div>

          {/* Unauthenticated Visitor Options */}
          {!currentUser ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenAuth("candidate-login")}
                className="btn btn-outline btn-sm"
              >
                <span>Candidate Sign In</span>
              </button>

              <button 
                onClick={() => onOpenAuth("recruiter-login")}
                className="btn btn-primary btn-sm"
              >
                <Lock size={13} />
                <span>Recruiter Portal</span>
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
                  <span className="avatar-role">{currentUser.role === "RECRUITER" ? "Recruiter / Lead" : "Candidate"}</span>
                </div>
                <ChevronDown size={14} className="text-muted hidden-mobile" />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-name">{currentUser.name}</div>
                    <div className="dropdown-email">{currentUser.email}</div>
                    <span className="badge badge-subtle mt-1 text-xs">{currentUser.role}</span>
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
                        <span>Job Requisitions</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("applications"); setShowProfileMenu(false); }}>
                        <Users size={15} />
                        <span>Inbound Applications</span>
                      </div>
                      <div className="dropdown-item" onClick={() => { setActiveTab("find-jobs"); setShowProfileMenu(false); }}>
                        <Search size={15} />
                        <span>View Public Job Board</span>
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

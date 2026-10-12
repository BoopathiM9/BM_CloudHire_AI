import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "./BrandLogo";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Sparkles, 
  History, 
  RotateCcw, 
  ChevronDown
} from "lucide-react";

export default function Navbar({ activeTab, setActiveTab }) {
  const { availableCandidates, resetDemoData, backendConnected, checkHealthAndSync } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "resumes", label: "Resumes", icon: FileText },
    { id: "matching", label: "Candidate Matching", icon: Sparkles },
    { id: "history", label: "Assignments & History", icon: History },
  ];

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => setActiveTab("dashboard")}>
          <BrandLogo size="default" />
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-btn ${isActive ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.id === "matching" && (
                  <span className="badge-nav-count">{availableCandidates.length} avail</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: System Status & User Profile */}
        <div className="nav-actions">
          {/* Business-Friendly System Status Indicator */}
          <div 
            className="system-status-indicator" 
            title={backendConnected ? "Live connection active" : "Operating in local simulation mode"}
            onClick={checkHealthAndSync}
          >
            <span className={`status-dot ${backendConnected ? "connected" : "demo"}`}></span>
            <span className="status-text">{backendConnected ? "Connected" : "Demo Mode"}</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm("Reset candidate pool and jobs back to the initial 20 benchmark resumes?")) {
                resetDemoData();
              }
            }}
            className="btn-reset-nav"
            title="Reset repository to 20 available resumes"
          >
            <RotateCcw size={14} />
            <span className="hidden-mobile">Reset</span>
          </button>

          {/* User Profile Avatar Menu */}
          <div className="profile-menu-container">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              aria-label="User Account Menu"
            >
              <div className="avatar-circle">BM</div>
              <div className="avatar-info hidden-mobile">
                <span className="avatar-name">Boopathi M</span>
                <span className="avatar-role">Talent Lead</span>
              </div>
              <ChevronDown size={14} className="text-muted hidden-mobile" />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-name">Boopathi M</div>
                  <div className="dropdown-email">boopathi.m@enterprise.internal</div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={() => { setActiveTab("dashboard"); setShowProfileMenu(false); }}>
                  <LayoutDashboard size={15} />
                  <span>Executive Overview</span>
                </div>
                <div className="dropdown-item" onClick={() => { setActiveTab("jobs"); setShowProfileMenu(false); }}>
                  <Briefcase size={15} />
                  <span>Job Requisitions</span>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-footer">
                  <span className="text-xs text-muted">BM CloudHire AI &bull; v2.4 SaaS</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

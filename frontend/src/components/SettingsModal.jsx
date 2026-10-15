import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Settings, 
  X, 
  Check, 
  Shield, 
  Bell, 
  Database, 
  Cpu, 
  User, 
  RotateCcw,
  Sparkles,
  CheckCircle2
} from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    currentUser, 
    backendConnected, 
    resetDemoData, 
    logActivity 
  } = useApp();

  const [activeTab, setActiveTab] = useState("general");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoMatching, setAutoMatching] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaveSuccess(true);
    logActivity("Updated platform configuration and preferences.", "success");
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const isRecruiter = currentUser?.role === "RECRUITER";

  return (
    <div className="modal-backdrop">
      <div className="modal-card settings-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2.5">
            <div className="settings-header-icon-box">
              <Settings size={20} className="text-forest" />
            </div>
            <div>
              <h2 className="modal-title">Platform Settings & Preferences</h2>
              <p className="text-xs text-muted">Configure your BM CloudHire AI account and environment.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-close-modal">✕</button>
        </div>

        {/* Modal Tab Navigation */}
        <div className="settings-tabs-bar">
          <button 
            type="button"
            onClick={() => setActiveTab("general")}
            className={`settings-tab-btn ${activeTab === "general" ? "active" : ""}`}
          >
            <User size={15} />
            <span>Profile & Account</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("ai-engine")}
            className={`settings-tab-btn ${activeTab === "ai-engine" ? "active" : ""}`}
          >
            <Cpu size={15} />
            <span>AWS Bedrock AI</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("environment")}
            className={`settings-tab-btn ${activeTab === "environment" ? "active" : ""}`}
          >
            <Database size={15} />
            <span>Infrastructure</span>
          </button>
        </div>

        {/* Modal Body (Single Smooth Scroll) */}
        <div className="settings-modal-body">
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="card p-4 border" style={{ background: "var(--page-bg)", borderColor: "var(--border-color)" }}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Signed In Identity</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-base text-forest">{currentUser?.name}</div>
                    <div className="text-xs text-muted">{currentUser?.email}</div>
                  </div>
                  <span className={`badge ${isRecruiter ? "badge-forest" : "badge-mint"}`}>
                    {isRecruiter ? "Administrator" : "Candidate"}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="text-sm font-semibold text-forest">Email Notifications</label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white mt-1">
                  <div>
                    <div className="text-xs font-bold text-forest">Application Updates</div>
                    <div className="text-xs text-muted">Receive status alerts when candidate stages change.</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled} 
                    onChange={(e) => setNotificationsEnabled(e.target.checked)} 
                    style={{ accentColor: "var(--mint-green)", width: "18px", height: "18px", cursor: "pointer" }}
                  />
                </div>
              </div>

              {isRecruiter && (
                <div className="form-group">
                  <label className="text-sm font-semibold text-forest">Reset Candidate Benchmark Data</label>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white mt-1">
                    <div>
                      <div className="text-xs font-bold text-danger">Reset Repository</div>
                      <div className="text-xs text-muted">Restore the 20 benchmark candidates and demo requisitions.</div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        resetDemoData();
                        handleSave();
                      }}
                      className="btn btn-outline btn-xs text-danger"
                    >
                      <RotateCcw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "ai-engine" && (
            <div className="space-y-4">
              <div className="card p-4 border" style={{ background: "var(--pale-mint)", borderColor: "var(--mint-green)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-forest" />
                  <span className="font-bold text-sm text-forest">Amazon Bedrock Nova Micro</span>
                </div>
                <p className="text-xs text-forest leading-relaxed">
                  Deterministic transparent 100-point rubric formula scoring engine is active.
                  All candidate evaluations are benchmarked against Required Skills (40 pts), Experience (25 pts), Production Projects (20 pts), and Preferred Stack (15 pts).
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                <div>
                  <div className="text-xs font-bold text-forest">Automated Rubric Matching</div>
                  <div className="text-xs text-muted">Auto-score inbound resumes immediately upon upload.</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={autoMatching} 
                  onChange={(e) => setAutoMatching(e.target.checked)} 
                  style={{ accentColor: "var(--mint-green)", width: "18px", height: "18px", cursor: "pointer" }}
                />
              </div>
            </div>
          )}

          {activeTab === "environment" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 border rounded-lg bg-white">
                  <span className="text-muted block mb-1">Hosting Platform</span>
                  <span className="font-bold text-forest">AWS Amplify (us-east-1)</span>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <span className="text-muted block mb-1">Database Store</span>
                  <span className="font-bold text-forest">Amazon DynamoDB</span>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <span className="text-muted block mb-1">Document Storage</span>
                  <span className="font-bold text-forest">Amazon S3 (Private Bucket)</span>
                </div>
                <div className="p-3 border rounded-lg bg-white">
                  <span className="text-muted block mb-1">Backend Connection</span>
                  <span className={`font-bold ${backendConnected ? "text-emerald-700" : "text-amber-700"}`}>
                    {backendConnected ? "Live API Connected" : "Local Benchmark Ready"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (Always Visible) */}
        <div className="settings-modal-footer">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="btn-primary"
            style={{ background: "var(--forest-green)", color: "#ffffff" }}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

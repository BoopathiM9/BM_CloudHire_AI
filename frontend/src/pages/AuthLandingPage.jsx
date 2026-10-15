import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "../components/BrandLogo";
import { 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Briefcase
} from "lucide-react";

export default function AuthLandingPage({ onLoginSuccess }) {
  const { loginUser, registerCandidate } = useApp();

  // Active portal tab: 'candidate' | 'admin'
  const [activePortal, setActivePortal] = useState("candidate");

  // Candidate mode: 'login' | 'register'
  const [candidateMode, setCandidateMode] = useState("login");

  // Admin Form fields (NO credentials displayed anywhere)
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Candidate Form fields
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [showCandidatePassword, setShowCandidatePassword] = useState(false);

  // Candidate Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regTitle, setRegTitle] = useState("");
  const [regExpYears, setRegExpYears] = useState("3");
  const [regSkills, setRegSkills] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!adminUsername.trim() || !adminPassword) {
        throw new Error("Please enter your admin username and password.");
      }
      const res = await loginUser(adminUsername, adminPassword, "RECRUITER");
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your username and password.");
    } finally {
      setLoading(false);
    }
  };

  // Candidate Login Handler
  const handleCandidateLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!candidateEmail.trim() || !candidatePassword) {
        throw new Error("Please enter your email and password.");
      }
      const res = await loginUser(candidateEmail, candidatePassword, "CANDIDATE");
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Sign in failed. Please verify your credentials or register an account.");
    } finally {
      setLoading(false);
    }
  };

  // Candidate Registration Handler
  const handleCandidateRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError("Please complete all required fields (Name, Email, Password).");
      setLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      setLoading(false);
      return;
    }

    try {
      const skillsArray = regSkills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const res = await registerCandidate({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: "",
        title: regTitle || "Software Engineer",
        experienceYears: regExpYears,
        skills: skillsArray.length > 0 ? skillsArray : ["Python", "AWS", "React", "Cloud Computing"]
      });

      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Registration failed. An account with this email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const isRegistering = activePortal === "candidate" && candidateMode === "register";

  return (
    <div className="login-page-container">
      <div className={`login-page-card ${isRegistering ? "wide" : ""}`}>
        {/* Brand Header */}
        <div className="login-brand-header">
          <BrandLogo size="default" className="brand-logo-dark" />
          <h1 className="login-title">Sign In to BM CloudHire</h1>
          <p className="login-subtitle">
            Enterprise Talent Acquisition & Career Portal
          </p>
        </div>

        {/* Portal Switcher Tabs: Candidate vs Admin */}
        <div className="login-segmented-tabs">
          <button
            type="button"
            onClick={() => { setActivePortal("candidate"); setError(""); }}
            className={`login-tab-btn ${activePortal === "candidate" ? "active" : ""}`}
          >
            <User size={16} />
            <span>Candidate Portal</span>
          </button>

          <button
            type="button"
            onClick={() => { setActivePortal("admin"); setError(""); }}
            className={`login-tab-btn ${activePortal === "admin" ? "active admin-active" : ""}`}
          >
            <ShieldCheck size={16} />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="login-error-banner">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* CANDIDATE PORTAL (LOGIN & REGISTRATION) */}
        {/* ============================================================== */}
        {activePortal === "candidate" && (
          <div>
            {/* Candidate Sub-Toggle: Sign In vs Create Account */}
            <div className="login-sub-tabs">
              <button
                type="button"
                onClick={() => { setCandidateMode("login"); setError(""); }}
                className={`login-sub-tab-btn ${candidateMode === "login" ? "active" : ""}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setCandidateMode("register"); setError(""); }}
                className={`login-sub-tab-btn ${candidateMode === "register" ? "active" : ""}`}
              >
                Create Account
              </button>
            </div>

            {candidateMode === "login" ? (
              /* Candidate Sign In Form */
              <form onSubmit={handleCandidateLogin} className="login-form">
                <div className="login-input-group">
                  <label className="login-label">Email Address</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      className="login-input"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="login-label">Password</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Lock size={16} /></span>
                    <input
                      type={showCandidatePassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      value={candidatePassword}
                      onChange={(e) => setCandidatePassword(e.target.value)}
                      className="login-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCandidatePassword(!showCandidatePassword)}
                      className="login-password-toggle"
                      aria-label="Toggle password visibility"
                    >
                      {showCandidatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  <User size={16} />
                  <span>{loading ? "Signing in..." : "Sign In to Candidate Portal"}</span>
                </button>

                <div className="login-switch-prompt">
                  Don't have an account?
                  <button
                    type="button"
                    onClick={() => { setCandidateMode("register"); setError(""); }}
                    className="login-switch-link"
                  >
                    Create an account
                  </button>
                </div>
              </form>
            ) : (
              /* Candidate Create Account Form */
              <form onSubmit={handleCandidateRegister} className="login-form">
                <div className="login-input-group">
                  <label className="login-label">Full Name *</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Arun Krishnan"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="login-label">Email Address *</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Mail size={16} /></span>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="login-label">Password * (min 6 characters)</label>
                  <div className="login-input-wrapper">
                    <span className="login-input-icon"><Lock size={16} /></span>
                    <input
                      type="password"
                      required
                      placeholder="Create a secure password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </div>

                <div className="login-form-row">
                  <div className="login-input-group">
                    <label className="login-label">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Cloud Engineer"
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      className="login-input no-icon"
                    />
                  </div>

                  <div className="login-input-group">
                    <label className="login-label">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={regExpYears}
                      onChange={(e) => setRegExpYears(e.target.value)}
                      className="login-input no-icon"
                    />
                  </div>
                </div>

                <div className="login-input-group">
                  <label className="login-label">Key Technical Skills</label>
                  <input
                    type="text"
                    placeholder="Python, AWS Lambda, React, Docker"
                    value={regSkills}
                    onChange={(e) => setRegSkills(e.target.value)}
                    className="login-input no-icon"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                >
                  <CheckCircle2 size={16} />
                  <span>{loading ? "Creating Account..." : "Create Account & Continue"}</span>
                </button>

                <div className="login-switch-prompt">
                  Already have an account?
                  <button
                    type="button"
                    onClick={() => { setCandidateMode("login"); setError(""); }}
                    className="login-switch-link"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ADMIN PORTAL LOGIN (CLEAN, SECURE, NO VISIBLE CREDENTIALS) */}
        {/* ============================================================== */}
        {activePortal === "admin" && (
          <form onSubmit={handleAdminLogin} className="login-form">
            <div className="login-input-group">
              <label className="login-label">Administrator Username or Email</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><User size={16} /></span>
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="login-input"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-input-group">
              <label className="login-label">Password</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><Lock size={16} /></span>
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="login-input"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="login-password-toggle"
                  aria-label="Toggle password visibility"
                >
                  {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn admin-btn"
            >
              <ShieldCheck size={16} />
              <span>{loading ? "Authenticating..." : "Sign In to Admin Workspace"}</span>
            </button>
          </form>
        )}

        {/* Card Footer */}
        <div className="login-card-footer">
          <span className="secure-tag">
            <Lock size={12} />
            <span>Enterprise 256-bit Secure Gateway</span>
          </span>
          <span>&copy; 2026 BM CloudHire</span>
        </div>
      </div>
    </div>
  );
}

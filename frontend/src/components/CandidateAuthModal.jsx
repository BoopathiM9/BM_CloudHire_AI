import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "./BrandLogo";
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function CandidateAuthModal({ isOpen, onClose, initialMode = "candidate-login", onSuccess }) {
  const { loginUser, registerCandidate, switchDemoRole } = useApp();
  const [mode, setMode] = useState(initialMode); // 'candidate-login' | 'candidate-register' | 'recruiter-login'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [experienceYears, setExperienceYears] = useState("3");
  const [skills, setSkills] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const targetRole = mode === "recruiter-login" ? "RECRUITER" : "CANDIDATE";
      const res = await loginUser(email, password, targetRole);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields (Name, Email, Password).");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const skillsArr = skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const res = await registerCandidate({
        name,
        email,
        password,
        phone,
        title,
        experienceYears,
        skills: skillsArr
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setError("");
    setLoading(true);
    try {
      await switchDemoRole(role);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card auth-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <BrandLogo size="small" />
          </div>
          <button onClick={onClose} className="btn-close-modal" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${mode === "candidate-login" ? "active" : ""}`}
            onClick={() => { setMode("candidate-login"); setError(""); }}
          >
            Candidate Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${mode === "candidate-register" ? "active" : ""}`}
            onClick={() => { setMode("candidate-register"); setError(""); }}
          >
            Candidate Register
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${mode === "recruiter-login" ? "active" : ""}`}
            onClick={() => { setMode("recruiter-login"); setError(""); }}
          >
            <Lock size={13} className="mr-1 inline" />
            Admin Portal
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body auth-modal-body">
          {error && (
            <div className="auth-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          {mode === "candidate-register" ? (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label>Full Name *</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Arun Krishnan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. arun.krishnan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password * (min 6 characters)</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    required 
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Current / Target Title</label>
                  <div className="input-with-icon">
                    <Briefcase size={16} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="e.g. Full-Stack AWS Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Technical Skills (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="Python, AWS Lambda, DynamoDB, React, Docker"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Complete Registration & Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>
                  {mode === "recruiter-login" ? "Admin Username or Email" : "Candidate Email Address"}
                </label>
                <div className="input-with-icon">
                  {mode === "recruiter-login" ? (
                    <User size={16} className="input-icon" />
                  ) : (
                    <Mail size={16} className="input-icon" />
                  )}
                  <input 
                    type={mode === "recruiter-login" ? "text" : "email"} 
                    required 
                    placeholder={mode === "recruiter-login" ? "admin (or admin@bmcloudhire.com)" : "arun.krishnan@example.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    required 
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? "Authenticating..." : mode === "recruiter-login" ? "Sign In to Admin Portal" : "Sign In to Candidate Portal"}
              </button>

              <div className="auth-footer-help">
                {mode === "candidate-login" ? (
                  <p>
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      className="link-btn"
                      onClick={() => { setMode("candidate-register"); setError(""); }}
                    >
                      Register here
                    </button>
                  </p>
                ) : mode === "recruiter-login" ? (
                  <p className="text-xs text-muted text-center">
                    Authorized administrative access only.
                  </p>
                ) : (
                  <p>
                    Already registered?{" "}
                    <button 
                      type="button" 
                      className="link-btn"
                      onClick={() => { setMode("candidate-login"); setError(""); }}
                    >
                      Sign In here
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

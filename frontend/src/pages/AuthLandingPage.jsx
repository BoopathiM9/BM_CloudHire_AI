import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import BrandLogo from "../components/BrandLogo";
import { 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Clock,
  CheckCircle
} from "lucide-react";

export default function AuthLandingPage({ onLoginSuccess }) {
  const { loginUser, registerCandidate, backendConnected } = useApp();

  // Active portal tab: 'admin' | 'candidate'
  const [activePortal, setActivePortal] = useState("admin");

  // Candidate mode: 'login' | 'register'
  const [candidateMode, setCandidateMode] = useState("login");

  // Form states
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePassword, setCandidatePassword] = useState("");
  const [showCandidatePassword, setShowCandidatePassword] = useState(false);

  // Candidate Registration fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regTitle, setRegTitle] = useState("");
  const [regExpYears, setRegExpYears] = useState("3");
  const [regSkills, setRegSkills] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1-Click Quick Credentials Fillers
  const fillAdminCredentials = () => {
    setActivePortal("admin");
    setAdminUsername("admin");
    setAdminPassword("boopathi_2004");
    setError("");
  };

  const fillCandidateCredentials = () => {
    setActivePortal("candidate");
    setCandidateMode("login");
    setCandidateEmail("arun.krishnan@example.com");
    setCandidatePassword("Candidate@2026");
    setError("");
  };

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!adminUsername.trim() || !adminPassword) {
        throw new Error("Please enter both Admin username and password.");
      }
      const res = await loginUser(adminUsername, adminPassword, "RECRUITER");
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Admin login failed. Please verify username and password.");
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
        throw new Error("Please enter both Candidate email and password.");
      }
      const res = await loginUser(candidateEmail, candidatePassword, "CANDIDATE");
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Candidate login failed. Please check your credentials or register.");
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
      setError("Please complete all required fields (Full Name, Email, Password).");
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
        phone: regPhone,
        title: regTitle || "Software Engineer",
        experienceYears: regExpYears,
        skills: skillsArray.length > 0 ? skillsArray : ["Python", "AWS", "React", "Cloud Computing"]
      });

      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Registration failed. This email may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gateway-page min-h-screen flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="auth-gateway-topbar">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="default" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <span className="text-xs uppercase tracking-wider text-slate-300 font-semibold block">Enterprise Portal</span>
              <span className="text-[11px] text-slate-400">Recruitment & Talent Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="system-status-indicator" title="Cloud Database & Backend Status">
              <span className={`status-dot ${backendConnected ? "connected" : "mock"}`}></span>
              <span className="text-xs text-slate-300 font-medium">
                {backendConnected ? "AWS Cloud Live" : "Local Engine"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="auth-gateway-card w-full max-w-xl mx-auto">
          {/* Card Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Authentication Portal
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Please sign in to access the BM CloudHire AI platform. Select your portal below to continue.
            </p>
          </div>

          {/* Quick Demo Fill Buttons Banner */}
          <div className="auth-quick-fill-box mb-5 p-3 rounded-xl border border-blue-200 bg-blue-50/70">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                <span>1-Click Test Credentials:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Click to pre-fill</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="btn btn-xs btn-primary flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold"
                title="Fill admin / boopathi_2004"
              >
                <ShieldCheck size={13} />
                <span>Fill Admin (admin / boopathi_2004)</span>
              </button>
              <button
                type="button"
                onClick={fillCandidateCredentials}
                className="btn btn-xs btn-outline flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-white"
                title="Fill candidate / Candidate@2026"
              >
                <User size={13} />
                <span>Fill Candidate (Arun Krishnan)</span>
              </button>
            </div>
          </div>

          {/* Main Portal Switcher Tabs */}
          <div className="auth-portal-tabs grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setActivePortal("admin"); setError(""); }}
              className={`portal-tab-btn flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition ${
                activePortal === "admin"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck size={17} className={activePortal === "admin" ? "text-blue-600" : "text-slate-500"} />
              <span>Admin Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setActivePortal("candidate"); setError(""); }}
              className={`portal-tab-btn flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition ${
                activePortal === "candidate"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User size={17} className={activePortal === "candidate" ? "text-emerald-600" : "text-slate-500"} />
              <span>Candidate Portal</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="auth-error-alert mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-shake">
              <AlertCircle size={17} className="flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: ADMIN LOGIN FORM */}
          {/* ============================================================== */}
          {activePortal === "admin" && (
            <div className="portal-content-pane">
              <div className="admin-portal-header mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <KeyRound size={16} className="text-blue-600" />
                  <span>Enterprise Administrator Authentication</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sign in to approve or reject candidate resumes, create and publish job openings, and monitor hiring metrics.
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-mono">
                  Default credentials: <strong>admin</strong> &bull; Password: <strong>boopathi_2004</strong>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="form-group">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Username or Email *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="form-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Password *
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      required
                      placeholder="boopathi_2004"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="form-input w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAdminPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2 rounded-lg transition shadow-sm"
                  style={{ background: '#2563eb' }}
                >
                  <ShieldCheck size={16} />
                  <span>{loading ? "Authenticating Admin..." : "Sign In to Admin Portal"}</span>
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CANDIDATE PORTAL (LOGIN & REGISTER) */}
          {/* ============================================================== */}
          {activePortal === "candidate" && (
            <div className="portal-content-pane">
              {/* Candidate Sub-Tab Toggle */}
              <div className="flex border-b border-slate-200 mb-4">
                <button
                  type="button"
                  onClick={() => { setCandidateMode("login"); setError(""); }}
                  className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                    candidateMode === "login"
                      ? "border-emerald-600 text-emerald-800"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Candidate Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setCandidateMode("register"); setError(""); }}
                  className={`py-2 px-4 font-bold text-xs border-b-2 transition ${
                    candidateMode === "register"
                      ? "border-emerald-600 text-emerald-800"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Register New Candidate
                </button>
              </div>

              {candidateMode === "login" ? (
                /* Candidate Login Form */
                <form onSubmit={handleCandidateLogin} className="space-y-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Candidate Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. arun.krishnan@example.com"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        className="form-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showCandidatePassword ? "text" : "password"}
                        required
                        placeholder="Enter your account password"
                        value={candidatePassword}
                        onChange={(e) => setCandidatePassword(e.target.value)}
                        className="form-input w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCandidatePassword(!showCandidatePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCandidatePassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success btn-block w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2 rounded-lg text-white transition shadow-sm"
                    style={{ background: '#059669' }}
                  >
                    <User size={16} />
                    <span>{loading ? "Signing in..." : "Sign In to Candidate Portal"}</span>
                  </button>

                  <div className="text-center pt-2 text-xs text-slate-600">
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      onClick={() => { setCandidateMode("register"); setError(""); }}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Register here &rarr;
                    </button>
                  </div>
                </form>
              ) : (
                /* Candidate Register Form */
                <form onSubmit={handleCandidateRegister} className="space-y-3">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Legal Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arun Krishnan"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="form-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="arun.krishnan@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="form-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password * (minimum 6 characters)
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Create secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="form-input w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="form-group">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Current / Target Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AWS Cloud Engineer"
                        value={regTitle}
                        onChange={(e) => setRegTitle(e.target.value)}
                        className="form-input w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={regExpYears}
                        onChange={(e) => setRegExpYears(e.target.value)}
                        className="form-input w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Key Technical Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Python, AWS Lambda, DynamoDB, React, Docker"
                      value={regSkills}
                      onChange={(e) => setRegSkills(e.target.value)}
                      className="form-input w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-success btn-block w-full py-2.5 font-bold text-sm flex items-center justify-center gap-2 rounded-lg text-white transition shadow-sm mt-3"
                    style={{ background: '#059669' }}
                  >
                    <CheckCircle size={16} />
                    <span>{loading ? "Creating Candidate Account..." : "Register & Enter Candidate Portal"}</span>
                  </button>

                  <div className="text-center pt-2 text-xs text-slate-600">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => { setCandidateMode("login"); setError(""); }}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      Sign In here &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Feature Highlights Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 text-center text-xs text-slate-600">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Real-Time Status Tracking</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-blue-600" />
              <span>1-Click Admin Approvals</span>
            </div>
          </div>
        </div>
      </main>

      {/* Enterprise Security Footer */}
      <footer className="auth-gateway-footer py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white/70">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-medium text-slate-600">
            BM CloudHire AI Enterprise System &bull; Production Architecture
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Admin: <code className="font-mono text-slate-700">admin</code> / <code className="font-mono text-slate-700">boopathi_2004</code> &bull; Candidate Self-Service &bull; Role-Based Access Control
          </p>
        </div>
      </footer>
    </div>
  );
}

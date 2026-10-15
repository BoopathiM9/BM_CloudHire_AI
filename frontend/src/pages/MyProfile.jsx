import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Download, 
  Edit3, 
  Sparkles, 
  Save, 
  Plus, 
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export default function MyProfile({ setActiveTab }) {
  const { 
    currentUser, 
    candidateApplications, 
    updateUserProfile,
    logActivity 
  } = useApp();

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "+1 (555) 234-5678");
  const [title, setTitle] = useState(currentUser?.title || "Senior Cloud Systems Engineer");
  const [experienceYears, setExperienceYears] = useState(currentUser?.experienceYears || 4);
  const [location, setLocation] = useState("San Francisco, CA (Remote)");
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || "https://linkedin.com/in/cloud-professional");
  const [bio, setBio] = useState(
    currentUser?.bio || "Senior Cloud Engineer with deep expertise across AWS Lambda, DynamoDB, Bedrock AI integrations, and distributed microservices architecture. Dedicated to building reliable, resilient cloud-native applications."
  );

  const [skills, setSkills] = useState([
    "Python", "AWS Lambda", "DynamoDB", "Amazon Bedrock", "Docker", "React", "REST API", "Terraform"
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Resume state
  const [resumeName, setResumeName] = useState(currentUser?.resumeName || "Cloud_Engineer_Resume.pdf");
  const [resumeUploadedAt, setResumeUploadedAt] = useState("2026-10-15");
  const [uploadProgress, setUploadProgress] = useState(null);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);

    if (updateUserProfile) {
      updateUserProfile({
        name,
        phone,
        title,
        experienceYears: Number(experienceYears),
        skills,
        bio,
        location,
        linkedin
      });
    }

    setTimeout(() => {
      setIsSaving(false);
      setSavedNotification(true);
      logActivity("Profile information updated successfully.", "success");
      setTimeout(() => setSavedNotification(false), 3000);
    }, 600);
  };

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(pdf|docx)$/i)) {
      alert("Invalid format: Only PDF or DOCX documents are accepted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large: Max allowed size is 5MB.");
      return;
    }

    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setResumeName(file.name);
          setResumeUploadedAt(new Date().toISOString().split("T")[0]);
          setTimeout(() => setUploadProgress(null), 800);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {savedNotification && (
        <div className="toast-notification animate-slide-in">
          <CheckCircle2 size={16} className="text-emerald" />
          <span>Profile changes saved and persisted successfully!</span>
        </div>
      )}

      {/* Page Header */}
      <div className="dashboard-header-flex mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="badge badge-mint">Candidate Profile</span>
            <span className="badge badge-subtle">Private & Secure</span>
          </div>
          <h1 className="page-title">My Professional Profile</h1>
          <p className="page-subtitle">
            Manage your personal details, verified resume on file, and technical skills used for matching with open requisitions.
          </p>
        </div>

        <button 
          type="button" 
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="btn btn-primary"
          style={{ background: "var(--forest-green)", color: "#FFFFFF" }}
        >
          <Save size={15} />
          <span>{isSaving ? "Saving Changes..." : "Save Profile"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Profile Summary & Resume */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-md"
                 style={{ background: "linear-gradient(135deg, var(--mint-green), var(--forest-green))" }}>
              {name ? name.slice(0, 2).toUpperCase() : "ME"}
            </div>
            <h2 className="text-lg font-bold text-forest">{name || "Candidate Name"}</h2>
            <p className="text-xs text-muted mt-0.5">{title}</p>
            <div className="flex justify-center gap-2 mt-3">
              <span className="badge badge-mint text-xs">Verified Account</span>
              <span className="badge badge-subtle text-xs">{experienceYears} Years Exp</span>
            </div>

            <div className="border-t border-slate-100 mt-5 pt-4 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Mail size={14} className="text-muted" />
                <span className="truncate">{currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone size={14} className="text-muted" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin size={14} className="text-muted" />
                <span>{location}</span>
              </div>
            </div>
          </div>

          {/* Verified Resume on File Card */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-forest" />
                <h3 className="font-bold text-sm text-forest">Resume on File</h3>
              </div>
              <span className="badge badge-mint text-xs">Active</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-3">
              <div className="font-semibold text-xs text-slate-900 truncate">
                📄 {resumeName}
              </div>
              <div className="text-xs text-muted mt-0.5">
                Uploaded: {resumeUploadedAt} • Verified PDF
              </div>
            </div>

            {uploadProgress !== null && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>Uploading to private S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%`, background: "var(--mint-green)" }} />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <label className="btn btn-outline btn-xs flex-1 cursor-pointer text-center justify-center">
                <Upload size={13} />
                <span>Upload New</span>
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  onChange={handleResumeFileChange}
                  className="hidden" 
                />
              </label>

              <button 
                type="button"
                onClick={() => alert(`Downloading verified resume: ${resumeName}`)}
                className="btn btn-outline btn-xs"
                title="Download verified resume"
              >
                <Download size={13} />
              </button>
            </div>
          </div>

          {/* Quick Application Metrics */}
          <div className="card p-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted mb-3">
              Application Activity
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xl font-bold text-forest">{candidateApplications.length}</div>
                <div className="text-xs text-muted">Applied Jobs</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="text-xl font-bold text-emerald-800">
                  {candidateApplications.filter(a => a.status === "Shortlisted" || a.status === "Approved").length}
                </div>
                <div className="text-xs text-emerald-700">Shortlisted/Approved</div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab("my-applications")}
              className="btn btn-ghost btn-xs w-full mt-3 text-forest"
            >
              <span>View All Applications →</span>
            </button>
          </div>
        </div>

        {/* Right Columns: Edit Profile Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="card p-6 space-y-5">
            <div>
              <h3 className="font-bold text-base text-forest">Personal & Contact Information</h3>
              <p className="text-xs text-muted">This information is shared only with recruiters reviewing your applications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="text-xs font-semibold text-slate-700">Full Legal Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-text w-full mt-1"
                  placeholder="Enter your Name"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-700">Email Address (Verified)</label>
                <input 
                  type="email" 
                  disabled
                  value={currentUser?.email || ""}
                  className="input-text w-full mt-1 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-text w-full mt-1"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-semibold text-slate-700">Location / Timezone</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-text w-full mt-1"
                  placeholder="City, State, Country"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-bold text-base text-forest">Professional Background</h3>
              <p className="text-xs text-muted mb-4">Highlight your title, experience, and executive career summary.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-700">Current Professional Title *</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-text w-full mt-1"
                    placeholder="e.g. Senior Full-Stack Cloud Developer"
                  />
                </div>

                <div className="form-group">
                  <label className="text-xs font-semibold text-slate-700">Total Years of Experience *</label>
                  <input 
                    type="number" 
                    min="0"
                    max="40"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="input-text w-full mt-1"
                  />
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="text-xs font-semibold text-slate-700">LinkedIn or Portfolio URL</label>
                <input 
                  type="url" 
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="input-text w-full mt-1"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="form-group mt-4">
                <label className="text-xs font-semibold text-slate-700">Professional Summary / Bio</label>
                <textarea 
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-3 border rounded-lg text-sm mt-1 focus:outline-none"
                  style={{ borderColor: "var(--border-color)" }}
                  placeholder="Briefly describe your core engineering expertise, cloud architecture projects, and career achievements..."
                />
              </div>
            </div>

            {/* Core Technical Skills */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-base text-forest">Key Technical Skills</h3>
                  <p className="text-xs text-muted">Skills are matched against job requirements during evaluation.</p>
                </div>
                <span className="text-xs text-muted">{skills.length} skills added</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 mt-3">
                {skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="badge badge-mint flex items-center gap-1.5 py-1 px-2.5 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-500 hover:text-danger cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); } }}
                  placeholder="Add skill (e.g. Kubernetes, TypeScript, PyTorch)..."
                  className="input-text flex-1"
                />
                <button 
                  type="button"
                  onClick={handleAddSkill}
                  className="btn btn-outline"
                >
                  <Plus size={15} />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="btn btn-primary"
                style={{ background: "var(--forest-green)", color: "#FFFFFF", padding: "0.6rem 1.5rem" }}
              >
                <Save size={16} />
                <span>{isSaving ? "Saving..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

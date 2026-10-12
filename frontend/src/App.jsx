import React, { useState } from "react";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import JobManagement from "./pages/JobManagement";
import ResumeUpload from "./pages/ResumeUpload";
import CandidateMatching from "./pages/CandidateMatching";
import AssignmentHistory from "./pages/AssignmentHistory";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AppProvider>
      <div className="min-h-screen">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main>
          {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
          {activeTab === "jobs" && <JobManagement setActiveTab={setActiveTab} />}
          {activeTab === "resumes" && <ResumeUpload />}
          {activeTab === "matching" && <CandidateMatching setActiveTab={setActiveTab} />}
          {activeTab === "history" && <AssignmentHistory setActiveTab={setActiveTab} />}
        </main>
      </div>
    </AppProvider>
  );
}

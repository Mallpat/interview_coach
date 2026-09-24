import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const MobileTopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isHome = location.pathname === "/" || location.pathname === "/dashboard";
  const isGetStarted = location.pathname === "/get-started";

  const getTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard": return "Dashboard";
      case "/get-started": return "Welcome";
      case "/signup": return "Create Account";
      case "/login": return "Sign In";
      case "/forgot-password": return "Reset Password";
      case "/profile-setup": return "Profile Setup";
      case "/resume-results": return "Resume Analysis";
      case "/jd-analyzer": return "JD Matcher";
      case "/interview-setup": return "Interview Setup";
      case "/voice-interview": return "Live Interview";
      case "/coding": return "Coding Interview";
      case "/feedback-report": return "Feedback Report";
      case "/learning-plan": return "Learning Plan";
      case "/history": return "Interview History";
      case "/analytics": return "Analytics";
      case "/mentor": return "AI Chat";
      case "/career-advisor": return "Career Roadmap";
      case "/companies": return "Companies";
      case "/gamification": return "Streak & Badges";
      case "/notifications": return "Notifications";
      case "/admin": return "Admin Overview";
      case "/profile": return "Profile & Settings";
      default: return "AI Interview Coach";
    }
  };

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 90,
      height: "52px",
      background: "#080C14",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      display: "flex",
      alignItems: "center",
      padding: "0 0.85rem",
      gap: "0.6rem"
    }}>
      {!isHome && !isGetStarted ? (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "8px",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFF",
            cursor: "pointer",
            flexShrink: 0
          }}
          title="Go Back"
        >
          <ArrowLeft size={16} />
        </button>
      ) : (
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#00F5A0",
          boxShadow: "0 0 8px #00F5A0",
          flexShrink: 0
        }} />
      )}

      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#FFF" }}>
        {getTitle()}
      </span>
    </header>
  );
};

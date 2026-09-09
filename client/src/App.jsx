import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MobileTopBar } from './layouts/MobileTopBar';
import { MobileBottomNav } from './layouts/MobileBottomNav';
import { ScreenNavigator } from './components/ScreenNavigator';

// Screens 1 to 4: Auth & Onboarding
import { GetStartedPage } from './pages/auth/GetStartedPage';
import { SignupPage } from './pages/auth/SignupPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Screen 5: Profile Setup
import { ProfileSetupPage } from './pages/profile/ProfileSetupPage';

// Screen 6: Home Dashboard
import { Dashboard } from './pages/dashboard/Dashboard';

// Screens 7 & 8: Resume & JD Analysis
import { ResumeAnalyzerResults } from './pages/resume/ResumeAnalyzerResults';
import { JobDescriptionAnalyzer } from './pages/resume/JobDescriptionAnalyzer';

// Screens 9, 10, 11, 12: Interview Drill & Feedback
import { MockInterviewSetup } from './pages/interview/MockInterviewSetup';
import { VoiceInterviewScreen } from './pages/interview/VoiceInterviewScreen';
import { CodingArena } from './pages/coding/CodingArena';
import { FeedbackReportScreen } from './pages/interview/FeedbackReportScreen';

// Screens 13, 14, 15: Learning & Progress
import { LearningPlanScreen } from './pages/learning/LearningPlanScreen';
import { InterviewHistoryScreen } from './pages/interview/InterviewHistoryScreen';
import { Analytics } from './pages/analytics/Analytics';

// Screen 16: AI Chat Assistant
import { CareerMentor } from './pages/mentor/CareerMentor';

// Screens 17, 18, 19, 20: Stretch Modules
import { CareerAdvisorScreen } from './pages/career/CareerAdvisorScreen';
import { CompanyDatabaseScreen } from './pages/companies/CompanyDatabaseScreen';
import { GamificationScreen } from './pages/gamification/GamificationScreen';
import { NotificationsScreen } from './pages/notifications/NotificationsScreen';

// Screen 21: Admin Panel (stretch, web)
import { AdminPanel } from './pages/admin/AdminPanel';

// Screen 22: Profile & Settings
import { Profile } from './pages/profile/Profile';

const MobileAppShell = () => {
  const [isSimulator, setIsSimulator] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      background: isSimulator ? '#03050A' : '#080C14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isSimulator ? '1.5rem 0 4.5rem' : '0',
      transition: 'all 0.3s ease'
    }}>
      {/* Mobile Device Frame Container */}
      <div style={{
        width: isSimulator ? '390px' : '100%',
        maxWidth: isSimulator ? '390px' : '520px',
        height: isSimulator ? '844px' : '100vh',
        background: '#080C14',
        borderRadius: isSimulator ? '44px' : '0',
        border: isSimulator ? '8px solid #131926' : 'none',
        boxShadow: isSimulator ? '0 25px 60px -10px rgba(0, 245, 160, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Mobile Device Status Bar (Notch & Time/Battery) */}
        {isSimulator && (
          <div style={{
            height: '32px',
            background: '#080C14',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#94A3B8',
            zIndex: 100
          }}>
            <span>9:41</span>
            {/* Dynamic Island Pill */}
            <div style={{
              width: '84px',
              height: '16px',
              background: '#000',
              borderRadius: '20px',
              margin: '0 auto'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Mobile Top App Bar */}
        <MobileTopBar isSimulator={isSimulator} setIsSimulator={setIsSimulator} />

        {/* Scrollable Screen Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Routes>
            {/* Screen 1: Get Started */}
            <Route path="/get-started" element={<GetStartedPage />} />

            {/* Screen 2: Signup + Resume */}
            <Route path="/signup" element={<SignupPage />} />

            {/* Screen 3: Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Screen 4: Forgot Password */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Screen 5: Profile Setup */}
            <Route path="/profile-setup" element={<ProfileSetupPage />} />

            {/* Screen 6: Home Dashboard */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Screen 7: Resume Analyzer Results */}
            <Route path="/resume-results" element={<ResumeAnalyzerResults />} />

            {/* Screen 8: Job Description Analyzer */}
            <Route path="/jd-analyzer" element={<JobDescriptionAnalyzer />} />

            {/* Screen 9: Mock Interview Setup */}
            <Route path="/interview-setup" element={<MockInterviewSetup />} />

            {/* Screen 10: Voice Interview + Camera */}
            <Route path="/voice-interview" element={<VoiceInterviewScreen />} />
            <Route path="/interview" element={<VoiceInterviewScreen />} />

            {/* Screen 11: Coding Interview */}
            <Route path="/coding" element={<CodingArena />} />

            {/* Screen 12: Feedback Report */}
            <Route path="/feedback-report" element={<FeedbackReportScreen />} />

            {/* Screen 13: Learning Plan */}
            <Route path="/learning-plan" element={<LearningPlanScreen />} />

            {/* Screen 14: Interview History */}
            <Route path="/history" element={<InterviewHistoryScreen />} />

            {/* Screen 15: Analytics Dashboard */}
            <Route path="/analytics" element={<Analytics />} />

            {/* Screen 16: AI Chat Assistant */}
            <Route path="/mentor" element={<CareerMentor />} />

            {/* Screen 17: Career Advisor */}
            <Route path="/career-advisor" element={<CareerAdvisorScreen />} />

            {/* Screen 18: Company Database */}
            <Route path="/companies" element={<CompanyDatabaseScreen />} />

            {/* Screen 19: Gamification */}
            <Route path="/gamification" element={<GamificationScreen />} />

            {/* Screen 20: Notifications */}
            <Route path="/notifications" element={<NotificationsScreen />} />

            {/* Screen 21: Admin Panel */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Screen 22: Candidate Profile & Settings */}
            <Route path="/profile" element={<Profile />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Bottom Navigation Bar */}
        <MobileBottomNav />

        {/* Home Indicator Bar */}
        {isSimulator && (
          <div style={{
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '110px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '9999px',
            pointerEvents: 'none',
            zIndex: 110
          }} />
        )}
      </div>

      {/* Floating 21 Screens Quick Navigator */}
      <ScreenNavigator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MobileAppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

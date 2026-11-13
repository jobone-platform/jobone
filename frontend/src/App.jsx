import React, { Suspense, lazy } from "react";
import { MotionConfig } from "framer-motion";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// --- COMPONENTS & GUARDS ---
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployerProtectedRoute from "./components/EmployerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import GlobalNotificationPopup from "./components/GlobalNotificationPopup";

// Lightweight fallback spinner for code-split route transitions
const RouteFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-transparent">
    <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin mb-3" />
    <span className="text-xs font-mono tracking-widest uppercase text-foreground/40">Loading JobOne...</span>
  </div>
);

// --- PUBLIC PAGES (Home loaded statically for instant landing render) ---
import Home from "./pages/Home";
const EmployersHome = lazy(() => import("./pages/EmployersHome"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const EmployerRegister = lazy(() => import("./pages/EmployerRegister"));
const EmployerRegisterOption = lazy(() => import("./pages/EmployerRegisterOption"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Jobs = lazy(() => import("./pages/Jobs"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));
const Contact = lazy(() => import("./pages/Contact"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ExploreCompanies = lazy(() => import("./pages/ExploreCompanies"));
const RecommendedJobs = lazy(() => import("./pages/RecommendedJobs"));
const NotFound = lazy(() => import("./pages/NotFound"));

// --- USER / CANDIDATE PAGES (Role-split) ---
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const EditProfile2 = lazy(() => import("./pages/EditProfile2"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const UserOTP = lazy(() => import("./pages/UserOTP"));
const ApplyPage = lazy(() => import("./pages/ApplyPage"));
const JobseekerDOC = lazy(() => import("./pages/JobseekerDOC"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));

// --- EMPLOYER PAGES (Role-split) ---
const EmployerDashboard = lazy(() => import("./pages/EmployerDashboard"));
const EmployerProfile = lazy(() => import("./pages/EmployerProfile"));
const EmployerEditProfile = lazy(() => import("./pages/EmployerEditProfile"));
const EmployerEditProfile2 = lazy(() => import("./pages/EmployerEditProfile2"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const EmployerJobDetails = lazy(() => import("./pages/EmployerJobDetails"));
const DocumentUploadPage = lazy(() => import("./pages/EmployerDOC"));
const EmployerOTP = lazy(() => import("./pages/EmployerOTP"));
const EditJob = lazy(() => import("./pages/EditJob1"));
const JobApplicants = lazy(() => import("./pages/JobApplicants"));
const Candidates = lazy(() => import("./pages/EmployerCandidateSearch"));
const MyCandidates = lazy(() => import("./pages/EmployerMyCandidates"));
const EmployerInterviews = lazy(() => import("./pages/EmployerInterviews"));
const EmployerAnalytics = lazy(() => import("./pages/EmployerAnalytics"));
const EmployerTeam = lazy(() => import("./pages/EmployerTeam"));

// --- ADMIN PAGES (Role-split) ---
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const EmployerAdminView = lazy(() => import("./pages/EmployerAdminView"));
const AdminJobseekerView = lazy(() => import("./pages/AdminJobseekerView"));
const JobAdminView = lazy(() => import("./pages/JobAdminView"));

// Helper to identify standalone authentication and verification routes
const isStandaloneAuthRoute = (pathname) => {
  if (!pathname || typeof pathname !== "string") return false;
  const clean = pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  return [
    "/userotp",
    "/employerotp",
    "/verifyotp",
    "/verify-otp",
    "/login",
    "/register",
    "/signup",
    "/userregister",
    "/jobseeker/register",
    "/employerregister",
    "/employer-register",
    "/employer/register",
    "/employer/signup",
    "/employerregisteroption",
    "/forgot-password",
    "/reset-password",
    "/admin/login",
  ].includes(clean);
};

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().startsWith("/admin");
  const cleanPath = location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // Check if candidate session is active
  const hasCandidateSession = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("userInfo"));
      return !!(stored?.token || localStorage.getItem("userToken"));
    } catch {
      return false;
    }
  })();

  const isCandidateRoute = [
    "/userdashboard",
    "/myapplications",
    "/profile",
    "/editprofile",
    "/editprofile2",
    "/jobseeker-documents",
    "/jobseekerdoc",
    "/resume-builder",
    "/resumebuilder",
  ].some((p) => cleanPath === p || cleanPath.startsWith(p + "/")) ||
  (hasCandidateSession && (cleanPath === "/recommended-jobs" || cleanPath === "/recommendedjobs")) ||
  cleanPath.startsWith("/apply/");

  const isEmployerRoute = [
    "/employerdashboard",
    "/employerprofile",
    "/employereditprofile",
    "/employereditprofile2",
    "/employerotp/employereditprofile2",
    "/createjob",
    "/employerdocupload",
    "/candidates",
    "/my-candidates",
    "/interviews",
    "/employer-interviews",
    "/analytics",
    "/employer-analytics",
    "/team",
    "/employer-team",
  ].some((p) => cleanPath === p || cleanPath.startsWith(p + "/")) ||
  cleanPath.startsWith("/job/") ||
  cleanPath.startsWith("/editjob/");

  const isStandalone = isStandaloneAuthRoute(location.pathname) || isAdminRoute || isCandidateRoute || isEmployerRoute;

  const noPaddingRoutes = [
    "/",
    "/employer",
    "/userdashboard",
    "/myapplications",
    "/profile",
    "/editprofile",
    "/editprofile2",
    "/jobseeker-documents",
    "/jobseekerdoc",
    "/resume-builder",
    "/resumebuilder",
    "/recommended-jobs",
    "/recommendedjobs",
    "/apply",
    "/employerdashboard",
    "/employerprofile",
    "/employereditprofile",
    "/employereditprofile2",
    "/createjob",
    "/employerdocupload",
    "/candidates",
    "/my-candidates",
    "/interviews",
    "/employer-interviews",
    "/analytics",
    "/employer-analytics",
    "/team",
    "/employer-team",
    "/admin/dashboard",
    "/admin/login",
    "/userotp",
    "/employerotp",
    "/verifyotp",
    "/verify-otp",
    "/login",
    "/register",
    "/signup",
    "/userregister",
    "/jobseeker/register",
    "/employerregister",
    "/employer-register",
    "/employer/register",
    "/employer/signup",
    "/employerregisteroption",
    "/forgot-password",
    "/reset-password",
  ];
  const hasPadding = !noPaddingRoutes.some((p) => cleanPath === p || cleanPath.startsWith(p + "/")) && !isStandalone;
  const actualPadding = hasPadding && !window.__TAURI__ ? "pt-[80px]" : "";

  return (
    <>
      {/* Accessible skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-silver"
      >
        Skip to main content
      </a>
      {!isStandalone && <Navbar />}
      {!isStandalone && <MobileBottomNav />}
      {!isStandalone && <GlobalNotificationPopup />}
      <main id="main-content" tabIndex="-1" className={`outline-none min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors duration-150 ${actualPadding}`}>
        {children}
      </main>
      {!isStandalone && <Footer />}
    </>
  );
};

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <AppLayout>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/" element={<Home />} />
              <Route path="/employer" element={<EmployersHome />} />
              <Route path="/employers" element={<Navigate to="/employer" replace />} />
              <Route path="/for-employers" element={<Navigate to="/employer" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/companies" element={<ExploreCompanies />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/userregister" element={<UserRegister />} />
            <Route path="/userotp" element={<UserOTP />} />
            <Route path="/employerregister" element={<EmployerRegister />} />
            <Route path="/employer-register" element={<EmployerRegister />} />
            <Route path="/employerregisteroption" element={<EmployerRegisterOption />} />
            <Route path="/employerotp" element={<EmployerOTP />} />
            <Route path="/recommended-jobs" element={<RecommendedJobs />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />

            {/* ================= CANONICAL REDIRECTS ================= */}
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/jobseeker/register" element={<Navigate to="/userregister" replace />} />
            <Route path="/employer/register" element={<Navigate to="/employerregister" replace />} />
            <Route path="/employer/signup" element={<Navigate to="/employerregister" replace />} />
            <Route path="/verifyotp" element={<Navigate to="/userotp" replace />} />
            <Route path="/verify-otp" element={<Navigate to="/userotp" replace />} />
            <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
            <Route path="/recommendedjobs" element={<Navigate to="/recommended-jobs" replace />} />
            <Route path="/employer-dashboard" element={<Navigate to="/employerdashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/users" element={<Navigate to="/admin/dashboard?tab=allJobseekers" replace />} />
            <Route path="/admin/employers" element={<Navigate to="/admin/dashboard?tab=allEmployers" replace />} />
            <Route path="/admin/jobs" element={<Navigate to="/admin/dashboard?tab=allJobs" replace />} />
            <Route path="/admin/analytics" element={<Navigate to="/admin/dashboard?tab=analytics" replace />} />
            <Route path="/admin/audit" element={<Navigate to="/admin/dashboard?tab=auditLogs" replace />} />
            <Route path="/admin/notifications" element={<Navigate to="/admin/dashboard?tab=notifications" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/dashboard?tab=settings" replace />} />
            <Route path="/admin/export" element={<Navigate to="/admin/dashboard?tab=exportDB" replace />} />
            <Route path="/admin/activity" element={<Navigate to="/admin/dashboard?tab=activity" replace />} />

            {/* ================= ADMIN AUTH ================= */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/employer/:id"
              element={
                <AdminProtectedRoute>
                  <EmployerAdminView />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/user/:id"
              element={
                <AdminProtectedRoute>
                  <AdminJobseekerView />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/job/:id"
              element={
                <AdminProtectedRoute>
                  <JobAdminView />
                </AdminProtectedRoute>
              }
            />

            {/* ================= CANDIDATE / USER PROTECTED ROUTES ================= */}
            <Route
              path="/userdashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editprofile"
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editprofile2"
              element={
                <ProtectedRoute>
                  <EditProfile2 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobseeker-documents"
              element={
                <ProtectedRoute>
                  <JobseekerDOC />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobseekerdoc"
              element={<Navigate to="/jobseeker-documents" replace />}
            />
            <Route
              path="/resume-builder"
              element={
                <ProtectedRoute>
                  <ResumeBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resumebuilder"
              element={<Navigate to="/resume-builder" replace />}
            />
            <Route
              path="/myapplications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/:jobId"
              element={
                <ProtectedRoute>
                  <ApplyPage />
                </ProtectedRoute>
              }
            />

            {/* ================= EMPLOYER PROTECTED ROUTES ================= */}
            <Route
              path="/employerdashboard"
              element={
                <EmployerProtectedRoute>
                  <EmployerDashboard />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employerprofile"
              element={
                <EmployerProtectedRoute>
                  <EmployerProfile />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employereditprofile"
              element={
                <EmployerProtectedRoute>
                  <EmployerEditProfile />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employereditprofile2"
              element={
                <EmployerProtectedRoute>
                  <EmployerEditProfile2 />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employerotp/employereditprofile2"
              element={
                <EmployerProtectedRoute>
                  <EmployerEditProfile2 />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/createjob"
              element={
                <EmployerProtectedRoute>
                  <CreateJob />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employerdocupload"
              element={
                <EmployerProtectedRoute>
                  <DocumentUploadPage />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <EmployerProtectedRoute>
                  <Candidates />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/my-candidates"
              element={
                <EmployerProtectedRoute>
                  <MyCandidates />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/job/:id"
              element={
                <EmployerProtectedRoute>
                  <EmployerJobDetails />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/editjob/:id"
              element={
                <EmployerProtectedRoute>
                  <EditJob />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/job/:id/applicants"
              element={
                <EmployerProtectedRoute>
                  <JobApplicants />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/interviews"
              element={
                <EmployerProtectedRoute>
                  <EmployerInterviews />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employer-interviews"
              element={<Navigate to="/interviews" replace />}
            />
            <Route
              path="/analytics"
              element={
                <EmployerProtectedRoute>
                  <EmployerAnalytics />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employer-analytics"
              element={<Navigate to="/analytics" replace />}
            />
            <Route
              path="/team"
              element={
                <EmployerProtectedRoute>
                  <EmployerTeam />
                </EmployerProtectedRoute>
              }
            />
            <Route
              path="/employer-team"
              element={<Navigate to="/team" replace />}
            />

            {/* ================= CATCH-ALL 404 NOT FOUND ================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </Router>
    </MotionConfig>
  );
}

export default App;

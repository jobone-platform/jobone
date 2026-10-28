import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// --- COMPONENTS & GUARDS ---
import Navbar from "./components/NavBar";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployerProtectedRoute from "./components/EmployerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import GlobalNotificationPopup from "./components/GlobalNotificationPopup";

// Lightweight fallback spinner for code-split route transitions
const RouteFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 bg-transparent">
    <div className="w-9 h-9 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading JobOne...</span>
  </div>
);

// --- PUBLIC PAGES (Home loaded statically for instant landing render) ---
import Home from "./pages/Home";
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
  const isStandalone = isStandaloneAuthRoute(location.pathname);

  const noPaddingRoutes = [
    "/",
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
  const cleanPath = location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const hasPadding = !noPaddingRoutes.includes(cleanPath) && !isStandalone;
  const actualPadding = hasPadding && !window.__TAURI__ ? "pt-[80px]" : "";

  return (
    <>
      {/* Accessible skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      {!isStandalone && <Navbar />}
      {!isStandalone && <MobileBottomNav />}
      {!isStandalone && <GlobalNotificationPopup />}
      <main id="main-content" tabIndex="-1" className={`outline-none min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150 ${actualPadding}`}>
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<Home />} />
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
          <Route path="/employer-dashboard" element={<Navigate to="/employerdashboard" replace />} />

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

          {/* ================= CATCH-ALL 404 NOT FOUND ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppLayout>
  </Router>
  );
}

export default App;

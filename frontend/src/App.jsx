import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// --- COMPONENTS & GUARDS ---
import Navbar from "./components/NavBar";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployerProtectedRoute from "./components/EmployerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import GlobalNotificationPopup from "./components/GlobalNotificationPopup";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserRegister from "./pages/UserRegister";
import EmployerRegister from "./pages/EmployerRegister";
import EmployerRegisterOption from "./pages/EmployerRegisterOption";
import About from "./pages/About";
import Services from "./pages/Services";
import Jobs from "./pages/Jobs";
import PublicProfile from "./pages/PublicProfile";
import CompanyProfile from "./pages/CompanyProfile";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import ExploreCompanies from "./pages/ExploreCompanies";
import RecommendedJobs from "./pages/RecommendedJobs";
import NotFound from "./pages/NotFound";

// --- USER / CANDIDATE PAGES ---
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProfile2 from "./pages/EditProfile2";
import MyApplications from "./pages/MyApplications";
import UserOTP from "./pages/UserOTP";
import ApplyPage from "./pages/ApplyPage";
import JobseekerDOC from "./pages/JobseekerDOC";

// --- EMPLOYER PAGES ---
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerProfile from "./pages/EmployerProfile";
import EmployerEditProfile from "./pages/EmployerEditProfile";
import EmployerEditProfile2 from "./pages/EmployerEditProfile2";
import CreateJob from "./pages/CreateJob";
import EmployerJobDetails from "./pages/EmployerJobDetails";
import DocumentUploadPage from "./pages/EmployerDOC";
import EmployerOTP from "./pages/EmployerOTP";
import EditJob from "./pages/EditJob1";
import JobApplicants from "./pages/JobApplicants";
import Candidates from "./pages/EmployerCandidateSearch";
import MyCandidates from "./pages/EmployerMyCandidates";

// --- ADMIN PAGES ---
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import EmployerAdminView from "./pages/EmployerAdminView";
import AdminJobseekerView from "./pages/AdminJobseekerView";
import JobAdminView from "./pages/JobAdminView";

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
    "/userregister",
    "/employerregister",
    "/employer-register",
    "/employerregisteroption",
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
    "/userregister",
    "/employerregister",
    "/employer-register",
    "/employerregisteroption",
  ];
  const cleanPath = location.pathname.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const hasPadding = !noPaddingRoutes.includes(cleanPath) && !isStandalone;
  const actualPadding = hasPadding && !window.__TAURI__ ? "pt-[80px]" : "";

  return (
    <>
      {!isStandalone && <Navbar />}
      {!isStandalone && <MobileBottomNav />}
      {!isStandalone && <GlobalNotificationPopup />}
      <div className={actualPadding}>
        {children}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
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
      </AppLayout>
    </Router>
  );
}

export default App;

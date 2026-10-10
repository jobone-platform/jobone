import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- COMPONENTS ---
import Navbar from "./components/NavBar";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployerProtectedRoute from "./components/EmployerProtectedRoute";
import Candidates from "./pages/EmployerCandidateSearch";
import MyCandidates from "./pages/EmployerMyCandidates";
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

// --- USER PAGES ---
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import EditProfile2 from "./pages/EditProfile2";
import MyApplications from "./pages/MyApplications";
import UserOTP from "./pages/UserOTP";
import ApplyPage from "./pages/ApplyPage";
import EmployerAdminView from "./pages/EmployerAdminView";
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
import GlobalNotificationPopup from "./components/GlobalNotificationPopup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ChatWidget from "./components/ChatWidgets";

import AuthHome from "./routes/AuthHome";
import TestLocation from "./pages/TestLocation";
import JobAdminView from "./pages/JobAdminView";
import ForgotPassword from "./pages/ForgotPassword";
import RecommendedJobs from "./pages/RecommendedJobs";
import AdminJobseekerView from "./pages/AdminJobseekerView";
import ExploreCompanies from "./pages/ExploreCompanies";

import { useLocation } from "react-router-dom";
import Contact from "./pages/Contact";

const PageWrapper = ({ children }) => {
  const location = useLocation();
  const noPaddingRoutes = ["/", "/admin/dashboard", "/admin/login"];
  const hasPadding = !noPaddingRoutes.includes(location.pathname);
  const actualPadding = hasPadding && !window.__TAURI__ ? "pt-[80px]" : "";

  return (
    <div className={actualPadding}>
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <MobileBottomNav />
      <GlobalNotificationPopup />
      {/* <ChatWidget /> */}
      <PageWrapper>
        <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/userregister" element={<UserRegister />} />
        <Route path="/employerregister" element={<EmployerRegister />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route
          path="/employerregisteroption"
          element={<EmployerRegisterOption />}
        />
        <Route path="/my-candidates" element={<MyCandidates />} />

        <Route path="/admin/employer/:id" element={<EmployerAdminView />} />
        <Route path="/admin/user/:id" element={<AdminJobseekerView />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* FACT: This single route serves as both Public View and Applicant Review */}
        <Route path="/profile/:userId" element={<PublicProfile />} />

        {/* ================= USER ROUTES ================= */}
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
          path="/jobseeker-documents"
          element={
            <ProtectedRoute>
              <JobseekerDOC />
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
        <Route path="/admin/job/:id" element={<JobAdminView />} />
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
        <Route path="/userotp" element={<UserOTP />} />
        <Route path="/about" element={<About />} />
        <Route path="/companies" element={<ExploreCompanies />} />

        {/* ================= EMPLOYER ROUTES ================= */}
        <Route
          path="/employerdashboard"
          element={
            <EmployerProtectedRoute>
              <EmployerDashboard />
            </EmployerProtectedRoute>
          }
        />
        <Route path="/company/:id" element={<CompanyProfile />} />
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
        <Route path="/employerotp" element={<EmployerOTP />} />

        {/* --- JOB MANAGEMENT & ATS --- */}
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

          <Route path="/recommended-jobs" element={<RecommendedJobs />} />

          {/* Fallback */}
        {/* MISC */}
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
      </Routes>
      </PageWrapper>
    </Router>
  );
}

export default App;

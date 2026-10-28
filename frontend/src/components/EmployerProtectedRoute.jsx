import { API_BASE_URL } from "../config/api";
import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../routes/Context";

const EmployerProtectedRoute = ({ children }) => {
  const { authStatus, role, employer, isProfileComplete, token, logout } = useAuth();
  const [eligibilityCheck, setEligibilityCheck] = useState("checking");
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const verifyStatus = async () => {
      if (!token || role !== "employer") {
        if (isMounted) setEligibilityCheck("done");
        return;
      }

      try {
        await axios.get(`${API_BASE_URL}/employer/check-eligibility`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setEligibilityCheck("done");
      } catch (err) {
        console.error("Employer eligibility check failed:", err.response?.status);

        // If 401, session is invalid/expired
        if (err.response?.status === 401) {
          logout();
        }
        if (isMounted) setEligibilityCheck("done");
      }
    };

    if (authStatus === "authenticated" && role === "employer") {
      verifyStatus();
    } else {
      setEligibilityCheck("done");
    }

    return () => {
      isMounted = false;
    };
  }, [token, role, authStatus, logout]);

  // 1. Wait for auth initialization
  if (authStatus === "loading" || (authStatus === "authenticated" && role === "employer" && eligibilityCheck === "checking")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying employer session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (authStatus === "unauthenticated" || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-based Guard: If logged in as wrong role, redirect to appropriate portal
  if (role === "jobseeker") {
    return <Navigate to="/userdashboard" replace />;
  }
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Operational Lock: If employer is frozen
  if (employer?.isFrozen) {
    return <Navigate to="/login" state={{ error: "Account Suspended: Your employer account has been frozen." }} replace />;
  }

  // 5. Incomplete Profile Guard (e.g., Google sign-in without company details)
  if (isProfileComplete === false || employer?.isProfileComplete === false) {
    const allowedPaths = [
      "/employereditprofile",
      "/employereditprofile2",
      "/employerotp/employereditprofile2",
      "/employerdocupload"
    ];
    if (!allowedPaths.includes(location.pathname)) {
      return <Navigate to="/employereditprofile" replace state={{ showWarning: true }} />;
    }
  }

  return children;
};

export default EmployerProtectedRoute;

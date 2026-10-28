import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/Context";

const AdminProtectedRoute = ({ children }) => {
  const { authStatus, role, token } = useAuth();
  const location = useLocation();

  // 1. Wait for auth initialization before rendering or redirecting
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (authStatus === "unauthenticated" || !token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // 3. Role-based check: Must be admin
  if (role !== "admin") {
    if (role === "employer") {
      return <Navigate to="/employerdashboard" replace />;
    }
    if (role === "jobseeker") {
      return <Navigate to="/userdashboard" replace />;
    }
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;


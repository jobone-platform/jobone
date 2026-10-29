import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/Context";

export default function ProtectedRoute({ children }) {
  const { authStatus, role, user, token } = useAuth();
  const location = useLocation();

  // 1. Wait for auth initialization before rendering or redirecting
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (authStatus === "unauthenticated" || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role-based Guard: If logged in as wrong role, redirect to appropriate portal
  if (role === "employer") {
    return <Navigate to="/employerdashboard" replace />;
  }
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Operational Lock: If user is frozen
  if (user?.isFrozen) {
    return <Navigate to="/login" state={{ error: "Account Suspended: Your account has been frozen." }} replace />;
  }

  return children;
}

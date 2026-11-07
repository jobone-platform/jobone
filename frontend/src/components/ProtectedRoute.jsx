import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/Context";

export default function ProtectedRoute({ children }) {
  const { authStatus, role, user, token } = useAuth();
  const location = useLocation();

  // 1. Wait for auth initialization before rendering or redirecting
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-xs font-mono uppercase tracking-widest transition-colors duration-150">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Verifying candidate session...</span>
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

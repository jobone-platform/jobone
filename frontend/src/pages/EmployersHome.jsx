import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Legacy Employer Homepage Route Redirect
 * In JobOne Universal Architecture, both Candidates and Employers
 * share the universal homepage at `/`, with role-switching
 * handled interactively in the Hero Status Panel.
 */
export default function EmployersHome() {
  return <Navigate to="/" replace />;
}

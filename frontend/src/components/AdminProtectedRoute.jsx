import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const adminInfoStr = localStorage.getItem("adminInfo");

  if (!adminInfoStr) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  try {
    const adminInfo = JSON.parse(adminInfoStr);
    if (!adminInfo || !adminInfo.token) {
      localStorage.removeItem("adminInfo");
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  } catch (err) {
    console.error("Invalid admin session:", err);
    localStorage.removeItem("adminInfo");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

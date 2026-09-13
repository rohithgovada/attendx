import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ fontWeight: 600, color: "var(--primary)" }}>Loading AttendX...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const roleDashboardMap = {
      student: "/student/dashboard",
      faculty: "/faculty/dashboard",
      principal: "/principal/dashboard",
      parent: "/parent/dashboard"
    };
    return <Navigate to={roleDashboardMap[role] || "/login"} replace />;
  }

  return children;
};

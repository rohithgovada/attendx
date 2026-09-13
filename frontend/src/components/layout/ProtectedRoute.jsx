import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading, loginAs } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ fontWeight: 600, color: "var(--primary)" }}>Loading AttendX...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Auto-login as default demo student so details are immediately accessible
    loginAs("student");
    return children;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If user clicked or navigated to a route for a different role, seamlessly switch to that role
    loginAs(allowedRoles[0]);
    return children;
  }

  return children;
};

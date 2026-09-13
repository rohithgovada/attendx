import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Pages
import { Login } from "./pages/auth/Login";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { StudentAttendance } from "./pages/student/StudentAttendance";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { MarkAttendance } from "./pages/faculty/MarkAttendance";
import { PrincipalDashboard } from "./pages/principal/PrincipalDashboard";
import { ParentDashboard } from "./pages/parent/ParentDashboard";
import { Notifications } from "./pages/shared/Notifications";
import { AttendanceReports } from "./pages/shared/AttendanceReports";
import { Profile } from "./pages/shared/Profile";

// Helper component to redirect root "/" to user role dashboard
const RootRedirect = () => {
  const { isAuthenticated, role, loading, loginAs } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        Loading AttendX...
      </div>
    );
  }

  if (!isAuthenticated) {
    loginAs("student");
    return <Navigate to="/student/dashboard" replace />;
  }

  switch (role) {
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    case "faculty":
      return <Navigate to="/faculty/dashboard" replace />;
    case "principal":
      return <Navigate to="/principal/dashboard" replace />;
    case "parent":
      return <Navigate to="/parent/dashboard" replace />;
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Main Application Shell */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student", "principal"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={["student", "parent", "faculty", "principal"]}>
                  <StudentAttendance />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <ProtectedRoute allowedRoles={["faculty", "principal"]}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/mark-attendance"
              element={
                <ProtectedRoute allowedRoles={["faculty", "principal"]}>
                  <MarkAttendance />
                </ProtectedRoute>
              }
            />

            {/* Principal Routes */}
            <Route
              path="/principal/dashboard"
              element={
                <ProtectedRoute allowedRoles={["principal"]}>
                  <PrincipalDashboard />
                </ProtectedRoute>
              }
            />

            {/* Parent Routes */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={["parent", "principal"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Multi-Role Pages */}
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<AttendanceReports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

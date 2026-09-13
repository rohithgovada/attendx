import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  GraduationCap,
  Shield,
  BookOpen,
  Users,
  UserCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail
} from "lucide-react";
import { DEMO_USERS } from "../../mockData/users";

export const Login = () => {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState("student");
  const [email, setEmail] = useState(DEMO_USERS.student.email);
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState(false);

  // When tab changes, prefill that role's demo email
  const handleRoleSelect = (roleKey) => {
    setActiveRole(roleKey);
    setEmail(DEMO_USERS[roleKey].email);
    setPassword("password123");
    setError("");
  };

  const routeToRole = (roleKey) => {
    if (roleKey === "student") navigate("/student/dashboard");
    else if (roleKey === "faculty") navigate("/faculty/dashboard");
    else if (roleKey === "principal") navigate("/principal/dashboard");
    else if (roleKey === "parent") navigate("/parent/dashboard");
  };

  const handleQuickDemoLogin = (roleKey) => {
    loginAs(roleKey);
    routeToRole(roleKey);
  };

  // Auto-forward to student dashboard so the user is never stuck on a login barrier
  useEffect(() => {
    if (autoRedirectCancelled) return;
    if (countdown <= 0) {
      handleQuickDemoLogin("student");
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, autoRedirectCancelled]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await login(email, password, activeRole);
      if (res.success) {
        routeToRole(res.role);
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const demoRoles = [
    {
      key: "student",
      title: "Student",
      name: "Alex Morgan",
      desc: "Check attendance, timetable & shortage warnings",
      icon: GraduationCap,
      color: "#2563eb",
      bgColor: "#eff6ff"
    },
    {
      key: "faculty",
      title: "Faculty",
      name: "Dr. Sarah Jenkins",
      desc: "Mark class attendance, manage rosters & view defaluters",
      icon: BookOpen,
      color: "#059669",
      bgColor: "#ecfdf5"
    },
    {
      key: "principal",
      title: "Principal",
      name: "Dr. Robert Vance",
      desc: "Institutional analytics, department audits & circulars",
      icon: Shield,
      color: "#7c3aed",
      bgColor: "#f5f3ff"
    },
    {
      key: "parent",
      title: "Parent",
      name: "Mr. David Morgan",
      desc: "Monitor ward attendance, verify classes & advisor contact",
      icon: Users,
      color: "#d97706",
      bgColor: "#fffbeb"
    }
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px"
      }}
    >
      <div className="login-card-container">
        {/* Left Banner: University Info & Quick Demo Logins */}
        <div className="login-left-panel">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)"
                }}
              >
                <GraduationCap size={26} />
              </div>
              <div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em" }}>AttendX</h1>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  College Attendance System
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(37, 99, 235, 0.2)",
                  color: "#60a5fa",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  marginBottom: 12
                }}
              >
                <Sparkles size={14} />
                <span>Instant Demo Access</span>
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>
                Select Role to Test Instantly
              </h2>
              <p style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                Click any persona below to preview that specific role's dashboard directly:
              </p>
            </div>

            {/* Quick 1-Click Persona Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {demoRoles.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleQuickDemoLogin(r.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#fff",
                      transition: "all 0.2s ease",
                      textAlign: "left"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: r.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <Icon size={18} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>{r.title} Demo</p>
                        <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{r.name}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#94a3b8" />
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.1)", fontSize: "0.75rem", color: "#64748b" }}>
            <span>St. Jude Institute of Technology • Attendance ERP v2.4</span>
          </div>
        </div>

        {/* Right Side: Standard Login Form & Instant Access */}
        <div className="login-right-panel">
          {/* Instant Access & Countdown Banner */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#1e40af",
              padding: "14px 16px",
              borderRadius: 12,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color="#2563eb" />
              <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                {autoRedirectCancelled
                  ? "Direct access ready: Tap below to see full details!"
                  : `Entering Student Portal in ${countdown}s with all details...`}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("student")}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6
                }}
              >
                <span>Open Student Dashboard</span>
                <ArrowRight size={14} />
              </button>
              {!autoRedirectCancelled && (
                <button
                  type="button"
                  onClick={() => setAutoRedirectCancelled(true)}
                  style={{
                    background: "#fff",
                    color: "#64748b",
                    border: "1px solid #cbd5e1",
                    padding: "6px 10px",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 600
                  }}
                >
                  Stay Here
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              AttendX ERP Portal
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
              Choose a role tab to sign in or use 1-click launch from the left menu
            </p>
          </div>

          {/* Role selector tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 6,
              background: "var(--bg-main)",
              padding: 4,
              borderRadius: 10,
              marginBottom: 24
            }}
          >
            {demoRoles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r.key)}
                style={{
                  padding: "8px 4px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                  background: activeRole === r.key ? "#ffffff" : "transparent",
                  color: activeRole === r.key ? "var(--primary)" : "var(--text-muted)",
                  boxShadow: activeRole === r.key ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
                }}
              >
                {r.title}
              </button>
            ))}
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--danger-light)",
                border: "1px solid var(--danger-border)",
                color: "var(--danger-text)",
                fontSize: "0.85rem",
                marginBottom: 18
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Mail size={15} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={15} />
                  <span>Password</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert("Demo password for all accounts is 'password123'"); }}
                  style={{ fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600 }}
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                className="form-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <input type="checkbox" id="rememberMe" defaultChecked style={{ accentColor: "var(--primary)" }} />
              <label htmlFor="rememberMe" style={{ fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
                Keep me logged in on this browser
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", gap: 10 }}
            >
              <UserCheck size={18} />
              <span>{submitting ? "Signing in..." : `Sign In as ${demoRoles.find(r => r.key === activeRole)?.title}`}</span>
            </button>
          </form>

          <div style={{ marginTop: 24, padding: "12px 14px", borderRadius: 8, background: "#f8fafc", border: "1px dashed var(--border-color)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            <strong>Demo Credentials Note:</strong> You can sign in using any email above or click any button on the left sidebar to bypass authentication instantly.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
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
  User,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Copy,
  Info
} from "lucide-react";
import { DEMO_USERS } from "../../mockData/users";

export const ROLE_CREDENTIALS = {
  student: {
    key: "student",
    title: "Student",
    username: "student",
    password: "student123",
    email: "alex.morgan@college.edu",
    name: "Alex Morgan",
    badge: "Roll: CS2024-042",
    details: "CSE 3rd Year • 84.6% Attendance • Grade Cards",
    icon: GraduationCap,
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe"
  },
  faculty: {
    key: "faculty",
    title: "Teacher / Faculty",
    username: "teacher",
    password: "teacher123",
    email: "sarah.jenkins@college.edu",
    name: "Dr. Sarah Jenkins",
    badge: "Emp: EMP-CS-104",
    details: "Assoc. Professor & Class In-Charge • Mark Attendance",
    icon: BookOpen,
    color: "#059669",
    bgColor: "#ecfdf5",
    borderColor: "#a7f3d0"
  },
  principal: {
    key: "principal",
    title: "Principal",
    username: "principal",
    password: "principal123",
    email: "robert.vance@college.edu",
    name: "Dr. Robert Vance",
    badge: "Principal & Dean",
    details: "College Administration • All 4 Years Audit • Approvals",
    icon: Shield,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#ddd6fe"
  },
  parent: {
    key: "parent",
    title: "Parent",
    username: "parent",
    password: "parent123",
    email: "david.morgan@gmail.com",
    name: "Mr. David Morgan",
    badge: "Ward: Alex Morgan",
    details: "Ward Attendance Monitor • In-Charge Advisor Line",
    icon: Users,
    color: "#d97706",
    bgColor: "#fffbeb",
    borderColor: "#fde68a"
  }
};

export const Login = () => {
  const { login, loginAs } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState("student");
  const [username, setUsername] = useState(ROLE_CREDENTIALS.student.username);
  const [password, setPassword] = useState(ROLE_CREDENTIALS.student.password);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const routeToRole = (roleKey) => {
    if (roleKey === "student") navigate("/student/dashboard");
    else if (roleKey === "faculty") navigate("/faculty/dashboard");
    else if (roleKey === "principal") navigate("/principal/dashboard");
    else if (roleKey === "parent") navigate("/parent/dashboard");
  };

  // Switch role and prefill credentials
  const handleRoleSelect = (roleKey) => {
    setActiveRole(roleKey);
    const cred = ROLE_CREDENTIALS[roleKey];
    setUsername(cred.username);
    setPassword(cred.password);
    setError("");
  };

  // Quick 1-click direct sign in
  const handleQuickDemoLogin = (roleKey) => {
    loginAs(roleKey);
    routeToRole(roleKey);
  };

  // Copy credentials helper
  const handleCopyCredentials = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // clipboard fallback
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await login(username, password, activeRole);
      if (res.success) {
        routeToRole(res.role || activeRole);
      } else {
        setError(res.message || "Invalid login or password.");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentCred = ROLE_CREDENTIALS[activeRole] || ROLE_CREDENTIALS.student;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #0b1329 0%, #1e293b 50%, #172554 100%)",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px"
      }}
    >
      <div className="login-card-container">
        {/* Left Panel: Official Login & Password Credentials Directory */}
        <div className="login-left-panel">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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
                <h1 style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>
                  AttendX ERP
                </h1>
                <p style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  College Attendance System
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
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
                  marginBottom: 8
                }}
              >
                <KeyRound size={14} />
                <span>Authorized Credentials</span>
              </div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                Login & Password Directory
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 4 }}>
                Click <strong>"Fill Form"</strong> to load credentials or <strong>"Sign In"</strong> to launch immediately:
              </p>
            </div>

            {/* Credential Cards List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.values(ROLE_CREDENTIALS).map((item) => {
                const Icon = item.icon;
                const isSelected = activeRole === item.key;
                return (
                  <div
                    key={item.key}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: isSelected ? "rgba(37, 99, 235, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      border: isSelected ? "1px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.08)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Icon size={17} color="#fff" />
                        </div>
                        <div>
                          <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#f8fafc" }}>
                            {item.title}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginLeft: 8 }}>
                            ({item.name})
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "#cbd5e1"
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    {/* Credentials line */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(0, 0, 0, 0.25)",
                        padding: "6px 10px",
                        borderRadius: 8,
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        color: "#e2e8f0"
                      }}
                    >
                      <div>
                        <span>Login: </span>
                        <strong style={{ color: "#38bdf8" }}>{item.username}</strong>
                        <span style={{ margin: "0 6px", color: "#64748b" }}>|</span>
                        <span>Pass: </span>
                        <strong style={{ color: "#4ade80" }}>{item.password}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(`${item.username} / ${item.password}`, item.key)}
                        title="Copy Login & Password"
                        style={{
                          color: copiedKey === item.key ? "#4ade80" : "#94a3b8",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontSize: "0.72rem"
                        }}
                      >
                        {copiedKey === item.key ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedKey === item.key ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(item.key)}
                        style={{
                          flex: 1,
                          padding: "5px 10px",
                          borderRadius: 6,
                          background: isSelected ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.08)",
                          color: "#f8fafc",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          textAlign: "center"
                        }}
                      >
                        {isSelected ? "✓ Form Filled" : "Fill in Form"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(item.key)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          background: item.color,
                          color: "#fff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        <span>Sign In</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.74rem",
              color: "#64748b"
            }}
          >
            <span>St. Jude Institute of Technology • Attendance ERP v2.5</span>
          </div>
        </div>

        {/* Right Panel: Interactive Login Form */}
        <div className="login-right-panel">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Sign In to AttendX
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
              Enter your login and password or select a role tab above to sign in
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
              marginBottom: 18
            }}
          >
            {Object.values(ROLE_CREDENTIALS).map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => handleRoleSelect(r.key)}
                style={{
                  padding: "9px 4px",
                  borderRadius: 8,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  transition: "all 0.15s ease",
                  background: activeRole === r.key ? "#ffffff" : "transparent",
                  color: activeRole === r.key ? r.color : "var(--text-muted)",
                  boxShadow: activeRole === r.key ? "0 2px 5px rgba(0,0,0,0.08)" : "none"
                }}
              >
                {r.title}
              </button>
            ))}
          </div>

          {/* Active Role Highlight Box */}
          <div
            style={{
              background: currentCred.bgColor,
              border: `1px solid ${currentCred.borderColor}`,
              padding: "12px 14px",
              borderRadius: 10,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: currentCred.color, fontWeight: 700, fontSize: "0.84rem" }}>
                <Sparkles size={15} />
                <span>Active Role: {currentCred.title} ({currentCred.name})</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>
                Login: <strong>{currentCred.username}</strong> | Password: <strong>{currentCred.password}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername(currentCred.username);
                setPassword(currentCred.password);
              }}
              style={{
                fontSize: "0.75rem",
                color: currentCred.color,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 6,
                background: "#ffffff",
                border: `1px solid ${currentCred.borderColor}`
              }}
            >
              Reset to Demo
            </button>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--danger-light)",
                border: "1px solid var(--danger-border)",
                color: "var(--danger-text)",
                fontSize: "0.84rem",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <Info size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <User size={15} />
                <span>Login / Username / Email</span>
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. student, teacher, or principal"
                style={{ fontSize: "0.92rem", fontWeight: 500 }}
              />
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
                Accepted logins: <code>student</code>, <code>teacher</code>, <code>principal</code>, <code>parent</code>, or college email
              </span>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={15} />
                  <span>Password</span>
                </label>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Hint: <strong>{currentCred.password}</strong>
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight: "42px", fontSize: "0.92rem", letterSpacing: showPassword ? "normal" : "0.1em" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "var(--text-muted)", cursor: "pointer" }}>
                <input type="checkbox" id="rememberMe" defaultChecked style={{ accentColor: "var(--primary)" }} />
                <span>Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(activeRole)}
                style={{ fontSize: "0.78rem", color: currentCred.color, fontWeight: 700 }}
              >
                Skip Password 👉
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{
                width: "100%",
                gap: 10,
                background: currentCred.color,
                borderColor: currentCred.color,
                fontSize: "0.96rem"
              }}
            >
              <UserCheck size={19} />
              <span>
                {submitting ? "Verifying credentials..." : `Sign In as ${currentCred.title}`}
              </span>
            </button>
          </form>

          <div
            style={{
              marginTop: 20,
              padding: "12px 14px",
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px dashed var(--border-color)",
              fontSize: "0.78rem",
              color: "var(--text-muted)"
            }}
          >
            <strong>Universal Demo Password:</strong> You can also use <code>password123</code> for all accounts.
          </div>
        </div>
      </div>
    </div>
  );
};

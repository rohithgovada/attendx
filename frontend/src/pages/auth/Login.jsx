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
  Info,
  Building2,
  CheckCircle2
} from "lucide-react";

export const ROLE_CREDENTIALS = {
  student: {
    key: "student",
    title: "Student",
    username: "student",
    password: "student123",
    email: "alex.morgan@college.edu",
    name: "Alex Morgan",
    idInfo: "Roll No: CS2024-042",
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
    idInfo: "Emp ID: EMP-CS-104",
    details: "Associate Professor & Class In-Charge • Mark Attendance",
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
    idInfo: "Principal & Dean of Academics",
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
    idInfo: "Ward: Alex Morgan",
    details: "Ward Attendance Monitor • In-Charge Contact",
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

  // Switch active role and prefill its official username & password
  const handleRoleSelect = (roleKey) => {
    setActiveRole(roleKey);
    const cred = ROLE_CREDENTIALS[roleKey];
    setUsername(cred.username);
    setPassword(cred.password);
    setError("");
  };

  // 1-Click instant bypass login
  const handleQuickDemoLogin = (roleKey) => {
    loginAs(roleKey);
    routeToRole(roleKey);
  };

  const handleCopyCredentials = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
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
      setError("Login failed. Please verify credentials.");
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
        flexDirection: "column",
        background: "linear-gradient(135deg, #090e1f 0%, #172554 50%, #0f172a 100%)",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px"
      }}
    >
      {/* Permanent Header with Unlimited Time College Logo */}
      <div style={{ textAlign: "center", marginBottom: 24, maxWidth: 640 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.45)"
            }}
          >
            <GraduationCap size={32} />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", margin: 0 }}>
                AttendX
              </h1>
              <span style={{ fontSize: "0.72rem", background: "rgba(37, 99, 235, 0.3)", border: "1px solid #3b82f6", color: "#93c5fd", padding: "2px 8px", borderRadius: 12, fontWeight: 700 }}>
                ERP v2.5
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              St. Jude Institute of Technology • Campus ERP
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="login-card-container" style={{ background: "#ffffff", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.45)" }}>
        {/* Left Side: 3 Big Clear Role Credentials */}
        <div className="login-left-panel">
          <div>
            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(37, 99, 235, 0.25)",
                  color: "#60a5fa",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                <KeyRound size={14} />
                <span>Authorized Campus Credentials</span>
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 4px 0" }}>
                Select Role to Sign In
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>
                Tap any role to load login & password, or click <strong>Sign In</strong> to enter directly:
              </p>
            </div>

            {/* 3 Main Role Boxes (Student, Teacher, Principal) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["student", "faculty", "principal"].map((roleKey) => {
                const item = ROLE_CREDENTIALS[roleKey];
                const Icon = item.icon;
                const isSelected = activeRole === item.key;
                return (
                  <div
                    key={item.key}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: isSelected ? "rgba(37, 99, 235, 0.22)" : "rgba(255, 255, 255, 0.04)",
                      border: isSelected ? "2px solid #3b82f6" : "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Icon size={19} color="#fff" />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff" }}>
                              {item.title}
                            </span>
                            {isSelected && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: "0.68rem", color: "#60a5fa", fontWeight: 700 }}>
                                <CheckCircle2 size={13} /> Active
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "0.74rem", color: "#94a3b8", margin: 0 }}>
                            {item.name} ({item.idInfo})
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Credentials Display Box */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(0, 0, 0, 0.35)",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                        color: "#e2e8f0",
                        marginBottom: 10
                      }}
                    >
                      <div>
                        <span>Login: </span>
                        <strong style={{ color: "#38bdf8" }}>{item.username}</strong>
                        <span style={{ margin: "0 8px", color: "#64748b" }}>|</span>
                        <span>Pass: </span>
                        <strong style={{ color: "#4ade80" }}>{item.password}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(`${item.username} / ${item.password}`, item.key)}
                        title="Copy credentials"
                        style={{
                          color: copiedKey === item.key ? "#4ade80" : "#94a3b8",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.74rem"
                        }}
                      >
                        {copiedKey === item.key ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedKey === item.key ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect(item.key)}
                        style={{
                          flex: 1,
                          padding: "7px 12px",
                          borderRadius: 8,
                          background: isSelected ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.08)",
                          color: "#f8fafc",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          textAlign: "center"
                        }}
                      >
                        {isSelected ? "✓ Form Filled" : `Select ${item.title}`}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDemoLogin(item.key)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 8,
                          background: item.color,
                          color: "#fff",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6
                        }}
                      >
                        <span>Sign In</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Parent Role Mini Option */}
            <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(255, 255, 255, 0.03)", border: "1px dashed rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={16} color="#d97706" />
                <span style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                  Parent Portal: <code>parent</code> / <code>parent123</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRoleSelect("parent")}
                style={{ fontSize: "0.74rem", color: "#f59e0b", fontWeight: 700 }}
              >
                Select Parent
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 20,
              paddingTop: 14,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "0.75rem",
              color: "#64748b",
              textAlign: "center"
            }}
          >
            <span>St. Jude Institute of Technology • Unlimited Time Permanent Access</span>
          </div>
        </div>

        {/* Right Side: Interactive Credential Form */}
        <div className="login-right-panel">
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.02em" }}>
              Sign In to AttendX
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 4 }}>
              Choose a role tab or type the login & password below:
            </p>
          </div>

          {/* 3 Main Role Tabs: Student, Teacher, Principal */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              background: "var(--bg-main)",
              padding: 4,
              borderRadius: 12,
              marginBottom: 16
            }}
          >
            {[
              { key: "student", label: "🎓 Student", color: "#2563eb" },
              { key: "faculty", label: "👨‍🏫 Teacher", color: "#059669" },
              { key: "principal", label: "🏛️ Principal", color: "#7c3aed" }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleRoleSelect(tab.key)}
                style={{
                  padding: "10px 6px",
                  borderRadius: 8,
                  fontSize: "0.84rem",
                  fontWeight: 800,
                  transition: "all 0.15s ease",
                  background: activeRole === tab.key ? "#ffffff" : "transparent",
                  color: activeRole === tab.key ? tab.color : "var(--text-muted)",
                  boxShadow: activeRole === tab.key ? "0 2px 6px rgba(0,0,0,0.08)" : "none"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Credentials Callout */}
          <div
            style={{
              background: currentCred.bgColor,
              border: `1.5px solid ${currentCred.borderColor}`,
              padding: "12px 14px",
              borderRadius: 12,
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, color: currentCred.color, fontWeight: 800, fontSize: "0.86rem" }}>
                <Sparkles size={16} />
                <span>Active Persona: {currentCred.title} ({currentCred.name})</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 3 }}>
                Login: <strong style={{ color: "var(--text-main)" }}>{currentCred.username}</strong> | Password: <strong style={{ color: "var(--text-main)" }}>{currentCred.password}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername(currentCred.username);
                setPassword(currentCred.password);
              }}
              style={{
                fontSize: "0.76rem",
                color: currentCred.color,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 6,
                background: "#ffffff",
                border: `1px solid ${currentCred.borderColor}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              Reset Inputs
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
                <span>Login ID / Username</span>
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. student, teacher, or principal"
                style={{ fontSize: "0.95rem", fontWeight: 600 }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={15} />
                  <span>Password</span>
                </label>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
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
                  style={{ paddingRight: "44px", fontSize: "0.95rem", letterSpacing: showPassword ? "normal" : "0.15em", fontWeight: 600 }}
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
                style={{ fontSize: "0.8rem", color: currentCred.color, fontWeight: 700 }}
              >
                1-Click Direct Enter 👉
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
                fontSize: "1rem",
                fontWeight: 700
              }}
            >
              <UserCheck size={20} />
              <span>
                {submitting ? "Verifying..." : `Sign In as ${currentCred.title}`}
              </span>
            </button>
          </form>

          {/* Clean Quick Summary Box */}
          <div
            style={{
              marginTop: 18,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#f8fafc",
              border: "1px dashed var(--border-color)",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6
            }}
          >
            <span>Student: <code>student</code> / <code>student123</code></span>
            <span>Teacher: <code>teacher</code> / <code>teacher123</code></span>
            <span>Principal: <code>principal</code> / <code>principal123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};


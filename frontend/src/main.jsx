import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AttendX Application Error:", error, errorInfo);
  }

  handleOpen = (path, targetRole = "student") => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      const mockUsers = {
        student: { id: "std-001", name: "Alex Morgan", email: "alex.morgan@college.edu", role: "student", rollNumber: "21CS042" },
        faculty: { id: "fac-001", name: "Dr. Sarah Jenkins", email: "sarah.jenkins@college.edu", role: "faculty" },
        principal: { id: "prn-001", name: "Dr. Robert Vance", email: "robert.vance@college.edu", role: "principal" },
        parent: { id: "par-001", name: "Mr. David Morgan", email: "david.morgan@gmail.com", role: "parent" }
      };
      const activeUser = mockUsers[targetRole] || mockUsers.student;
      localStorage.setItem("attendx_auth", JSON.stringify({
        user: activeUser,
        role: activeUser.role,
        token: "token_" + activeUser.role
      }));
    } catch {}
    window.location.hash = path;
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "24px",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          background: "#f8fafc",
          color: "#0f172a"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "36px 32px",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            maxWidth: "460px",
            width: "100%",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "2.8rem", marginBottom: "12px" }}>🎓</div>
            <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
              AttendX Campus Portal
            </h1>
            <p style={{ fontSize: "0.88rem", color: "#64748b", margin: "0 0 24px 0" }}>
              Welcome to AttendX Attendance Management System. Select your portal to enter with full details:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => this.handleOpen("/student/dashboard", "student")}
                style={{
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                }}
              >
                👉 Enter Student Portal (Alex Morgan)
              </button>

              <button
                onClick={() => this.handleOpen("/faculty/dashboard", "faculty")}
                style={{
                  background: "#059669",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer"
                }}
              >
                👉 Enter Faculty Portal (Dr. Sarah Jenkins)
              </button>

              <button
                onClick={() => this.handleOpen("/principal/dashboard", "principal")}
                style={{
                  background: "#7c3aed",
                  color: "#ffffff",
                  border: "none",
                  padding: "12px 20px",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer"
                }}
              >
                👉 Enter Principal Portal (Dr. Robert Vance)
              </button>

              <button
                onClick={() => this.handleOpen("/login")}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  marginTop: 6
                }}
              >
                Go to Login Screen
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)


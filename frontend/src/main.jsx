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

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.origin + window.location.pathname;
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
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            maxWidth: "480px",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎓</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 8px 0" }}>AttendX Recovery Mode</h2>
            <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0 0 20px 0" }}>
              A cached script or browser session conflict occurred. Click below to refresh cleanly:
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "10px 24px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              Reset Cache & Launch AttendX
            </button>
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


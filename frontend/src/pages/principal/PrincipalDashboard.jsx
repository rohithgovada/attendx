import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { Modal } from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import {
  Building2,
  Users,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Megaphone,
  CheckCircle2,
  Send
} from "lucide-react";

export const PrincipalDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getPrincipalDashboardData();
        setData(res);
      } catch (err) {
        console.error("Failed to load principal dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    await api.createNotification({
      title: broadcastTitle,
      message: broadcastMessage,
      category: "Circular",
      targetRole: targetAudience,
      sender: `${user?.name} (Principal)`
    });

    setBroadcastModalOpen(false);
    setBroadcastTitle("");
    setBroadcastMessage("");
    setToastMessage("Institutional circular broadcasted successfully!");
  };

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading institutional intelligence dashboard...
      </div>
    );
  }

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Institutional Executive Portal
            </h1>
            <Badge variant="principal">Principal & Dean</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            <strong>St. Jude Institute of Technology</strong> • Academic Year 2025-2026 • Campus Live Sync
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setBroadcastModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <Megaphone size={16} />
            <span>Broadcast Circular</span>
          </button>
          <Link to="/reports" className="btn btn-outline" style={{ gap: 8 }}>
            <FileSpreadsheet size={16} />
            <span>Audit Reports</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Overall Campus Attendance"
          value={`${data.overallInstitutionAttendance}%`}
          icon={TrendingUp}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="+1.8% vs last month"
          trendType="positive"
          subtext="• 5 Departments Active"
        />
        <StatCard
          title="Total Enrolled Students"
          value={data.totalStudents.toLocaleString()}
          icon={GraduationCap}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="98.2% registered active"
          trendType="positive"
        />
        <StatCard
          title="Teaching Faculty"
          value={data.totalFaculty}
          icon={Users}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          trend="100% attendance logged"
          trendType="positive"
        />
        <StatCard
          title="Total Shortage Defaulters"
          value={data.totalDefaulters}
          icon={AlertTriangle}
          color="#ef4444"
          bgColor="#fef2f2"
          trend="< 75% Attendance"
          trendType="negative"
          subtext="• Requires De-barment review"
        />
      </div>

      {/* Department Performance Matrix */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Building2 size={18} color="var(--primary)" />
              <span>Department-Wise Attendance Performance Matrix</span>
            </h2>
            <p className="card-subtitle">Comparative attendance benchmarks and shortage distribution across engineering branches</p>
          </div>
          <Link to="/reports" style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--primary)" }}>
            View Full Comparative Audit
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Enrolled Students</th>
                <th>Faculty Strength</th>
                <th>Avg Attendance Rate</th>
                <th>Visual Benchmark</th>
                <th>Defaulters (&lt;75%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.departmentStats.map((dept) => (
                <tr key={dept.code}>
                  <td>
                    <strong>{dept.department}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 6 }}>
                      ({dept.code})
                    </span>
                  </td>
                  <td>{dept.totalStudents}</td>
                  <td>{dept.facultyCount}</td>
                  <td>
                    <strong style={{ color: dept.avgAttendance < 80 ? "#f59e0b" : "#10b981" }}>
                      {dept.avgAttendance}%
                    </strong>
                  </td>
                  <td style={{ width: "220px" }}>
                    <ProgressBar
                      value={dept.avgAttendance}
                      showLabel={false}
                      showThreshold={true}
                      height={8}
                    />
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "#ef4444" }}>
                      {dept.defaulters}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: 4 }}>
                      ({((dept.defaulters / dept.totalStudents) * 100).toFixed(1)}%)
                    </span>
                  </td>
                  <td>
                    <Badge variant={dept.avgAttendance >= 80 ? "good" : "warning"}>
                      {dept.avgAttendance >= 80 ? "Compliant" : "Review Needed"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Campus Operations Feed & Executive Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        {/* Campus Operational Feed */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <CheckCircle2 size={18} color="var(--primary)" />
                <span>Executive Operations & Biometric Stream</span>
              </h2>
              <p className="card-subtitle">Real-time system events, sync logs, and department alerts</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {data.recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {alert.title}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
                    {alert.detail}
                  </p>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Governance Guidelines */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <AlertTriangle size={18} color="#f59e0b" />
                <span>University Accreditation Rules</span>
              </h2>
              <p className="card-subtitle">UGC & AICTE Attendance Compliance Requirements</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: 8 }}>
              <p style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                1. 75% Mandatory Minimum
              </p>
              <p>Every student must achieve &ge; 75% attendance in both Theory and Practical sessions separately to qualify for final university examinations.</p>
            </div>

            <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: 8 }}>
              <p style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                2. Medical Condonation (65% - 74%)
              </p>
              <p>Students with verifiable medical certificates may receive condonation up to 10% strictly under Principal approval.</p>
            </div>

            <div style={{ padding: "12px", background: "var(--bg-main)", borderRadius: 8 }}>
              <p style={{ fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                3. Mandatory Parent Intimation
              </p>
              <p>Automatic SMS and email alerts must be issued to guardians when attendance drops below 75% at mid-cycle.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Circular Modal */}
      <Modal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        title="Broadcast Institutional Notice or Circular"
      >
        <form onSubmit={handleSendBroadcast}>
          <div className="form-group">
            <label className="form-label">Notice Title</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Mandatory Attendance Advisory for Final Year Students"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select
              className="form-select"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            >
              <option value="all">Entire College (Students, Faculty, Parents)</option>
              <option value="student">All Students</option>
              <option value="faculty">Faculty & Department Heads Only</option>
              <option value="parent">Parents & Guardians</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Official Circular Content</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Enter official circular text, directives, deadlines, and guidelines..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setBroadcastModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
              <Send size={15} />
              <span>Broadcast Notice</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

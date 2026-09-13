import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getStudentDashboardData(user?.id);
        setData(res);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading student dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Welcome back, {user?.name}
            </h1>
            <Badge variant={data.status}>{data.status} Standing</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Roll No: <strong>{user?.rollNo}</strong> • {user?.department} • {user?.semester}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/student/attendance" className="btn btn-primary">
            <BookOpen size={16} />
            <span>Detailed Subject Records</span>
          </Link>
        </div>
      </div>

      {/* Critical Shortage Alert Banner (if any subject < 75%) */}
      {data.defaulterCount > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderRadius: "var(--radius-md)",
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#9f1239",
            marginBottom: 24
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={22} color="#e11d48" />
            <div>
              <p style={{ fontSize: "0.9rem", fontWeight: 700 }}>
                Attendance Shortage Warning ({data.defaulterCount} subject below 75%)
              </p>
              <p style={{ fontSize: "0.8rem", color: "#be123c" }}>
                You have dropped below the mandatory 75% threshold in Cloud Computing & Distributed Systems Lab. Please attend upcoming lectures.
              </p>
            </div>
          </div>
          <Link
            to="/student/attendance"
            style={{ fontSize: "0.82rem", fontWeight: 700, color: "#e11d48", display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>View Remedial Advice</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Top 4 KPI Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Overall Attendance"
          value={`${data.overallRate}%`}
          icon={TrendingUp}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="Target: 75% Min"
          trendType={data.overallRate >= 75 ? "positive" : "negative"}
          subtext="• Semester 6 Aggregate"
        />
        <StatCard
          title="Classes Attended"
          value={`${data.totalAttended} / ${data.totalConducted}`}
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
          trend={`${Math.round((data.totalAttended / data.totalConducted) * 100)}% present`}
          trendType="positive"
        />
        <StatCard
          title="Total Missed"
          value={`${data.totalAbsent} Classes`}
          icon={XCircle}
          color="#ef4444"
          bgColor="#fef2f2"
          trend="Absences logged"
          trendType="neutral"
        />
        <StatCard
          title="Safe Bunk Buffer"
          value="+6 Classes"
          icon={Clock}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          trend="Can miss up to 6 hours"
          trendType="positive"
        />
      </div>

      {/* Two Column Grid: Today's Schedule & Subject-Wise Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Today's Timetable Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Today's Class Schedule</span>
              </h2>
              <p className="card-subtitle">Saturday, September 13, 2026 • 5 Lectures Scheduled</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.timetable.map((slot) => {
              let badgeVariant = "neutral";
              let badgeText = "Upcoming";

              if (slot.status === "Present") {
                badgeVariant = "good";
                badgeText = "Attended";
              } else if (slot.status === "Absent") {
                badgeVariant = "danger";
                badgeText = "Missed";
              }

              return (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "var(--radius-md)",
                    background: slot.completed ? "#f8fafc" : "#ffffff",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        padding: "8px 10px",
                        background: "var(--secondary-light)",
                        borderRadius: 8,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        minWidth: 80,
                        textAlign: "center"
                      }}
                    >
                      {slot.time.split(" - ")[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        {slot.subjectCode}: {slot.subjectName}
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        {slot.faculty} • Room: {slot.room}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Badge variant={badgeVariant}>{badgeText}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-Wise Attendance Progress */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <BookOpen size={18} color="var(--primary)" />
                <span>Subject-Wise Progress</span>
              </h2>
              <p className="card-subtitle">Current semester attendance per course</p>
            </div>
            <Link to="/student/attendance" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
              All 6 Courses
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {data.subjects.map((sub) => (
              <div key={sub.code}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{sub.code}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: 6 }}>
                      ({sub.attended}/{sub.conducted} classes)
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: sub.percentage < 75 ? "#ef4444" : "#10b981" }}>
                      {sub.percentage}%
                    </span>
                    {sub.percentage < 75 && (
                      <span style={{ fontSize: "0.68rem", background: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                        Shortage
                      </span>
                    )}
                  </div>
                </div>
                <ProgressBar
                  value={sub.percentage}
                  showLabel={false}
                  showThreshold={true}
                  height={7}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span>&ge; 75% Safe</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
              <span>&lt; 75% Shortage</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontWeight: 700 }}>Black line:</span>
              <span>75% Min Target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

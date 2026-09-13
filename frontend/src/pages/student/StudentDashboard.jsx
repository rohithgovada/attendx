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
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  FileText,
  Send,
  UserCheck,
  Phone,
  Mail,
  Building2,
  ShieldCheck
} from "lucide-react";

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Online Leave Permission Form state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveCategory, setLeaveCategory] = useState("Medical / Sick Leave");
  const [startDate, setStartDate] = useState("2026-09-15");
  const [endDate, setEndDate] = useState("2026-09-15");
  const [leaveReason, setLeaveReason] = useState("");

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const daysCount = calculateDays();
  const isShortLeave = daysCount <= 2;

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

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const assignedIncharge = data?.classIncharge?.name || "Dr. Sarah Jenkins";
    const assignedEmail = data?.classIncharge?.email || "sarah.jenkins@college.edu";
    const reviewLevel = isShortLeave ? "incharge" : "principal";
    const leaveType = isShortLeave
      ? `Short Leave (${daysCount} Day${daysCount > 1 ? "s" : ""})`
      : `Long Leave (${daysCount} Days)`;

    await api.applyForLeave({
      studentId: user?.id || "STU202401",
      studentName: user?.name || "Alex Morgan",
      rollNo: user?.rollNo || "CS2024-042",
      department: user?.department || "Computer Science & Engineering",
      year: user?.year || "3rd Year",
      semester: user?.semester || "6th Semester",
      section: user?.section || "A",
      leaveType,
      category: leaveCategory,
      startDate,
      endDate,
      totalDays: daysCount,
      reason: leaveReason,
      assignedIncharge,
      assignedInchargeEmail: assignedEmail,
      reviewLevel,
      status: isShortLeave ? "Pending In-Charge Review" : "Pending Principal Sanction"
    });

    setLeaveModalOpen(false);
    setLeaveReason("");
    setToastMessage(
      isShortLeave
        ? `Short leave application submitted! Dispatched to Class In-Charge (${assignedIncharge}).`
        : `Long leave application submitted! Escalated to Principal (Dr. Robert Vance) for sanction.`
    );
    fetchData();
  };

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading student dashboard...
      </div>
    );
  }

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Welcome Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Welcome back, {user?.name}
            </h1>
            <Badge variant={data.status}>{data.status} Standing</Badge>
            {data.academicMarks?.academicStanding === "Topper" && (
              <span style={{ fontSize: "0.78rem", background: "#fef3c7", color: "#92400e", padding: "3px 8px", borderRadius: "6px", fontWeight: 700, border: "1px solid #fde68a", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Award size={12} /> Class Topper
              </span>
            )}
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Roll No: <strong>{user?.rollNo}</strong> • {user?.department} • {user?.semester} • {user?.section || "Sec A"}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: 8, background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
          >
            <FileText size={16} />
            <span>Apply for Online Leave / Permission</span>
          </button>
          <Link to="/student/attendance" className="btn btn-outline" style={{ gap: 8 }}>
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

      {/* Two Column Grid: Academic Performance & Allocated Class In-Charge */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Academic Marks & Standing Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={20} color="#f59e0b" />
                <span>Academic Examination Marks &amp; Standing</span>
              </h2>
              <p className="card-subtitle">Official university grade card and semester performance</p>
            </div>
            <Badge
              variant={
                data.academicMarks?.academicStanding === "Topper"
                  ? "good"
                  : data.academicMarks?.academicStanding === "Passed"
                  ? "primary"
                  : "danger"
              }
            >
              {data.academicMarks?.academicStanding === "Topper"
                ? "🏆 Class Topper (Top 5%)"
                : data.academicMarks?.academicStanding === "Passed"
                ? "Passed (First Class)"
                : "Failed (Backlogs)"}
            </Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Cumulative CGPA</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb", marginTop: 4 }}>
                {data.academicMarks?.cgpa} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ 10</span>
              </div>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Marks Aggregate</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10b981", marginTop: 4 }}>
                {data.academicMarks?.marksPercentage}%
              </div>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Section Rank</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#8b5cf6", marginTop: 4 }}>
                #{data.academicMarks?.classRank}
              </div>
            </div>

            <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 8, textAlign: "center", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Active Backlogs</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: data.academicMarks?.backlogs > 0 ? "#ef4444" : "#10b981", marginTop: 4 }}>
                {data.academicMarks?.backlogs}
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "#f1f5f9", padding: "12px 16px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span><strong>Academic Status:</strong> Regular Student in Good Standing</span>
            <span style={{ fontWeight: 600, color: "#15803d" }}>✓ Eligible for End-Semester Examinations</span>
          </div>
        </div>

        {/* Assigned Class In-Charge Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserCheck size={20} color="var(--primary)" />
                <span>Assigned Class In-Charge</span>
              </h2>
              <p className="card-subtitle">Official Section In-charge for CSE 3rd Year (6th Sem) - Sec A</p>
            </div>
            <Badge variant="primary">Section A In-Charge</Badge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.1rem"
              }}
            >
              SJ
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
                {data.classIncharge?.name || "Dr. Sarah Jenkins"}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {data.classIncharge?.designation || "Associate Professor & Class In-Charge"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={14} color="var(--primary)" />
              <span><strong>Cabin:</strong> {data.classIncharge?.cabin || "Block B, Room 302"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={14} color="var(--primary)" />
              <span><strong>Email:</strong> {data.classIncharge?.email || "sarah.jenkins@college.edu"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={14} color="var(--primary)" />
              <span><strong>Phone:</strong> {data.classIncharge?.phone || "+1 (555) 345-6789"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} color="var(--primary)" />
              <span><strong>Office Hours:</strong> Mon - Fri: 02:00 PM - 04:00 PM</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setStartDate("2026-09-15");
              setEndDate("2026-09-15");
              setLeaveModalOpen(true);
            }}
            className="btn btn-outline"
            style={{ width: "100%", justifyContent: "center", fontSize: "0.82rem", gap: 6 }}
          >
            <Send size={14} />
            <span>Apply for Short Leave (1 - 2 Days)</span>
          </button>
        </div>
      </div>

      {/* Online Leave & Absence Permission Tracking Ledger */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={18} color="var(--primary)" />
              <span>My Online Absence &amp; Leave Permission Ledger</span>
            </h2>
            <p className="card-subtitle">
              Real-time application status tracking with hierarchical approval: Short Leave (&le;2 days) by Class In-Charge, Long Leave (&ge;3 days) by Principal
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLeaveModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: "0.8rem", padding: "6px 12px", gap: 6 }}
          >
            <FileText size={14} />
            <span>New Leave Request</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Leave Type &amp; Duration</th>
                <th>Category</th>
                <th>Dates</th>
                <th>Reviewing Authority</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {(data.leaveApplications || []).length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "28px", color: "var(--text-muted)" }}>
                    No leave or absence applications filed yet. Click "Apply for Online Leave" above when taking absence.
                  </td>
                </tr>
              ) : (
                (data.leaveApplications || []).map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, background: "#f1f5f9", padding: "3px 6px", borderRadius: 4 }}>
                        {app.id}
                      </span>
                    </td>
                    <td>
                      <strong>{app.leaveType}</strong>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{app.totalDays} Day(s)</div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem" }}>{app.category}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{app.startDate}</div>
                      {app.startDate !== app.endDate && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>to {app.endDate}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {app.reviewLevel === "incharge" ? (
                          <span style={{ color: "#2563eb" }}>Class In-Charge</span>
                        ) : (
                          <span style={{ color: "#7c3aed" }}>Principal</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {app.reviewLevel === "incharge" ? app.assignedIncharge : "Dr. Robert Vance"}
                      </div>
                    </td>
                    <td style={{ maxWidth: "220px", fontSize: "0.82rem" }}>
                      {app.reason}
                    </td>
                    <td>
                      <Badge
                        variant={
                          app.status === "Approved"
                            ? "good"
                            : app.status === "Rejected"
                            ? "danger"
                            : app.reviewLevel === "incharge"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "200px" }}>
                      {app.reviewerRemarks || "Pending authority review"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Leave Application Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Apply for Online Absence / Leave Permission"
      >
        <form onSubmit={handleApplyLeave}>
          {/* Smart Routing Info Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: isShortLeave ? "#eff6ff" : "#f5f3ff",
              border: `1px solid ${isShortLeave ? "#bfdbfe" : "#ddd6fe"}`,
              marginBottom: 16
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={18} color={isShortLeave ? "#2563eb" : "#7c3aed"} />
              <strong style={{ fontSize: "0.88rem", color: isShortLeave ? "#1e40af" : "#5b21b6" }}>
                {isShortLeave
                  ? `Short Leave (${daysCount} Day${daysCount > 1 ? "s" : ""}) • Routed to Class In-Charge`
                  : `Long Leave (${daysCount} Days) • Escalated to Principal`}
              </strong>
            </div>
            <p style={{ fontSize: "0.78rem", color: isShortLeave ? "#1e40af" : "#5b21b6" }}>
              {isShortLeave
                ? `Leaves of 1-2 days are automatically dispatched to your Class In-Charge (${data?.classIncharge?.name || "Dr. Sarah Jenkins"}) for swift approval.`
                : "Leaves of 3 or more days require official condonation sanction from the Principal (Dr. Robert Vance)."}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <select
              className="form-select"
              value={leaveCategory}
              onChange={(e) => setLeaveCategory(e.target.value)}
            >
              <option value="Medical / Sick Leave">Medical / Sick Leave</option>
              <option value="Academic Duty Leave / Hackathon">Academic Duty Leave / Hackathon / Sports</option>
              <option value="Family Emergency">Family Emergency</option>
              <option value="Personal Reason">Personal / Domestic Reason</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span>Calculated Duration: <strong>{daysCount} Day{daysCount > 1 ? "s" : ""}</strong></span>
            <span style={{ color: isShortLeave ? "#2563eb" : "#7c3aed", fontWeight: 700 }}>
              Reviewer: {isShortLeave ? `Class In-Charge (${data?.classIncharge?.name || "Dr. Sarah Jenkins"})` : "Principal (Dr. Robert Vance)"}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Justification / Reason</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="State the reason for your absence, medical diagnosis, or academic event details..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setLeaveModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ gap: 6, background: isShortLeave ? "var(--primary)" : "#7c3aed" }}
            >
              <Send size={15} />
              <span>Submit Leave Application</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

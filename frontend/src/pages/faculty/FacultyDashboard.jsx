import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { Toast } from "../../components/common/Toast";
import {
  ClipboardList,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  Send,
  UserCheck,
  Check,
  X,
  FileText,
  Award,
  ShieldCheck
} from "lucide-react";

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const handleReviewLeave = async (leaveId, status) => {
    const isParentLetter = (dashboardData?.inchargeShortLeaves || []).find(a => a.id === leaveId)?.submittedBy === "parent";
    await api.reviewLeaveApplication(
      leaveId,
      status,
      status === "Approved"
        ? `Approved by Class In-Charge ${user?.name || "Dr. Sarah Jenkins"}. Excused absence recorded.`
        : `Rejected by Class In-Charge ${user?.name || "Dr. Sarah Jenkins"}. Reason insufficient.`,
      user?.name || "Dr. Sarah Jenkins"
    );
    setToastMessage(
      isParentLetter
        ? `Parent leave letter ${status.toLowerCase()}! Absence status updated and guardian notified.`
        : `Leave request ${status.toLowerCase()} successfully! Student notified.`
    );
    const res = await api.getFacultyDashboardData(user?.id);
    setDashboardData(res);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getFacultyDashboardData(user?.id);
        setDashboardData(res);
      } catch (err) {
        console.error("Failed to load faculty dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    const handleLeaveUpdate = () => {
      loadData();
    };
    window.addEventListener("attendx_leave_applications_updated", handleLeaveUpdate);
    return () => {
      window.removeEventListener("attendx_leave_applications_updated", handleLeaveUpdate);
    };
  }, [user]);

  const handleOpenWarning = (student) => {
    setSelectedStudent(student);
    setWarningModalOpen(true);
  };

  const handleSendWarning = () => {
    setWarningModalOpen(false);
    setToastMessage(`Official shortage notice sent to ${selectedStudent?.name} & guardian (${selectedStudent?.parentPhone})!`);
  };

  if (loading || !dashboardData) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading faculty dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Toast alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Welcome & Top Info */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Welcome back, {user?.name}
            </h1>
            <Badge variant="primary">{user?.designation?.split("&")[0] || "Faculty"}</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            ID: <strong>{user?.employeeId}</strong> • {user?.department} • Cabin: {user?.cabin}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/faculty/mark-attendance" className="btn btn-primary">
            <ClipboardList size={16} />
            <span>Mark Today's Attendance</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Classes Conducted"
          value={dashboardData.totalClassesConducted}
          icon={CheckCircle2}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="This Semester"
          trendType="positive"
          subtext="• 3 Courses Assigned"
        />
        <StatCard
          title="Avg Student Attendance"
          value={`${dashboardData.avgClassAttendance}%`}
          icon={Users}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="+2.1% higher than dept average"
          trendType="positive"
        />
        <StatCard
          title="Students Under 75%"
          value={dashboardData.lowAttendanceCount}
          icon={AlertCircle}
          color="#ef4444"
          bgColor="#fef2f2"
          trend="Immediate attention needed"
          trendType="negative"
        />
        {(() => {
          const completedCount = dashboardData.todaySchedule ? dashboardData.todaySchedule.filter(s => s.marked).length : 1;
          const pendingCount = dashboardData.todaySchedule ? dashboardData.todaySchedule.length - completedCount : 2;
          return (
            <StatCard
              title="Lectures Today"
              value={`${dashboardData.scheduledTodayCount} Classes`}
              icon={Clock}
              color="#8b5cf6"
              bgColor="#f5f3ff"
              trend={`${completedCount} Completed, ${pendingCount} Pending`}
              trendType={pendingCount === 0 ? "positive" : "neutral"}
            />
          );
        })()}
      </div>

      {/* Two Column Section: Today's Schedule & Defaulter Watchlist */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Today's Teaching Schedule */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <Calendar size={18} color="var(--primary)" />
                <span>Today's Teaching Schedule</span>
              </h2>
              <p className="card-subtitle">Select a lecture slot to mark or view attendance</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {dashboardData.todaySchedule.map((slot) => (
              <div
                key={slot.id}
                style={{
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: slot.marked ? "#f8fafc" : "#ffffff",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "2px 8px", borderRadius: 4 }}>
                      {slot.time}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)" }}>
                      {slot.department} {slot.semester} - Sec {slot.section}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-main)" }}>
                    {slot.subjectCode}: {slot.subjectName}
                  </h3>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Room: {slot.room} • Batch Size: {slot.totalStudents} Students
                  </p>
                </div>

                <div>
                  {slot.marked ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "0.82rem", color: "var(--success-text)", fontWeight: 600 }}>
                        Marked ({slot.presentCount}/{slot.totalStudents} Present)
                      </span>
                      <button
                        onClick={() => navigate("/faculty/mark-attendance", { state: { slot } })}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate("/faculty/mark-attendance", { state: { slot } })}
                      className="btn btn-primary btn-sm"
                      style={{ gap: 6 }}
                    >
                      <ClipboardList size={15} />
                      <span>Take Attendance</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Intervention Watchlist */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <AlertCircle size={18} color="#ef4444" />
                <span>Attendance Shortage Watchlist</span>
              </h2>
              <p className="card-subtitle">Students below 75% threshold in your classes</p>
            </div>
            <Link to="/reports" style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
              All Defaulters
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dashboardData.lowAttendanceStudents.map((s) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  background: "#ffffff"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                      {s.name}
                    </p>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      ({s.rollNo})
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Parent: {s.parentName}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 800,
                      color: s.attendanceRate < 65 ? "#ef4444" : "#f59e0b"
                    }}
                  >
                    {s.attendanceRate}%
                  </span>
                  <button
                    onClick={() => handleOpenWarning(s)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: "4px 8px", fontSize: "0.75rem", color: "#e11d48", borderColor: "#fecdd3" }}
                    title="Send Alert Notice"
                  >
                    <Send size={12} />
                    <span>Notify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 18, padding: "12px", borderRadius: 8, background: "var(--bg-main)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
            <strong>Department Regulation:</strong> Students with attendance under 75% at month-end will be barred from mid-term internal examinations without medical leave justification.
          </div>
        </div>
      </div>

      {/* Class In-Charge Section Portal & Short Leave Approval Desk */}
      <div className="card" style={{ marginBottom: 24, border: "1px solid #bfdbfe" }}>
        <div className="card-header" style={{ background: "#f0f7ff", borderBottom: "1px solid #bfdbfe" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8, color: "#1e40af" }}>
                <UserCheck size={20} color="#2563eb" />
                <span>Class In-Charge Section Desk</span>
              </h2>
              <Badge variant="primary">{dashboardData.inchargeSection || "CSE 3rd Year (6th Sem) - Sec A"}</Badge>
            </div>
            <p className="card-subtitle" style={{ color: "#1e3a8a" }}>
              Allocated Section Oversight: 24 Enrolled Students • Class In-Charge: {user?.name || "Dr. Sarah Jenkins"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.82rem", color: "#1e40af", fontWeight: 700, background: "#dbeafe", padding: "4px 10px", borderRadius: "6px" }}>
              {(dashboardData.inchargeShortLeaves || []).length} Pending Short Leave(s)
            </span>
          </div>
        </div>

        {/* Section Key Metrics */}
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, borderBottom: "1px solid var(--border-color)", background: "#fafafa" }}>
          <div style={{ padding: "10px", background: "#fff", borderRadius: 8, border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Section Strength</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>24 Students</div>
          </div>
          <div style={{ padding: "10px", background: "#fff", borderRadius: 8, border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Section Avg Attendance</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#10b981", marginTop: 2 }}>84.6%</div>
          </div>
          <div style={{ padding: "10px", background: "#fff", borderRadius: 8, border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Class Topper</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#2563eb", marginTop: 2 }}>Aiden Scott (9.6)</div>
          </div>
          <div style={{ padding: "10px", background: "#fff", borderRadius: 8, border: "1px solid var(--border-color)", textAlign: "center" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>Action Required</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: (dashboardData.inchargeShortLeaves || []).length > 0 ? "#f59e0b" : "#10b981", marginTop: 2 }}>
              {(dashboardData.inchargeShortLeaves || []).length} Requests
            </div>
          </div>
        </div>

        {/* Short Leave & Parent Absence Letters Table */}
        <div style={{ padding: "20px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <FileText size={16} color="var(--primary)" />
            <span>Incoming Section Short Leaves &amp; Parent Absence Excuse Letters</span>
          </h3>

          {(dashboardData.inchargeShortLeaves || []).length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", background: "#f8fafc", borderRadius: 8, border: "1px dashed var(--border-color)" }}>
              No pending short leave or parent absence letters for Section A. All student absence permissions are processed!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student &amp; Submitter</th>
                    <th>Duration &amp; Dates</th>
                    <th>Category</th>
                    <th>Reason / Medical Note</th>
                    <th style={{ textAlign: "right" }}>In-Charge Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboardData.inchargeShortLeaves || []).map((app) => {
                    const isParent = app.submittedBy === "parent" || !!app.parentName;
                    return (
                      <tr key={app.id} style={{ background: isParent ? "#faf5ff" : "inherit" }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <strong>{app.studentName}</strong>
                            {isParent && (
                              <span style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                background: "#7c3aed",
                                color: "#ffffff",
                                padding: "2px 7px",
                                borderRadius: "4px"
                              }}>
                                👨‍👩‍👧 Parent Letter
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                            {app.rollNo} • {app.department}
                          </div>
                          {isParent && (
                            <div style={{ fontSize: "0.74rem", color: "#6b21a8", marginTop: 3 }}>
                              From: <strong>{app.parentName || "Guardian"}</strong> ({app.parentRelation || "Parent"})
                              {app.parentPhone && <span> • Ph: {app.parentPhone}</span>}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{app.totalDays} Day(s)</span>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {app.startDate} {app.startDate !== app.endDate ? `to ${app.endDate}` : ""}
                          </div>
                        </td>
                        <td>
                          <Badge variant={isParent ? "primary" : "warning"} style={isParent ? { background: "#f3e8ff", color: "#6b21a8", borderColor: "#ddd6fe" } : {}}>
                            {app.category}
                          </Badge>
                        </td>
                        <td style={{ maxWidth: "260px", fontSize: "0.82rem" }}>
                          <p style={{ margin: 0 }}>{app.reason}</p>
                          {isParent && (
                            <span style={{ fontSize: "0.72rem", color: "#7c3aed", fontStyle: "italic", display: "block", marginTop: 3 }}>
                              Official Guardian Submission
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => handleReviewLeave(app.id, "Approved")}
                              className="btn btn-primary"
                              style={{ padding: "6px 12px", fontSize: "0.78rem", gap: 4, background: "#16a34a" }}
                              title="Approve and mark absence excused"
                            >
                              <Check size={14} />
                              <span>Approve (Excuse)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewLeave(app.id, "Rejected")}
                              className="btn btn-outline"
                              style={{ padding: "6px 12px", fontSize: "0.78rem", gap: 4, color: "#dc2626", borderColor: "#fca5a5" }}
                              title="Reject leave application"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Warning Notice Modal */}
      <Modal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        title="Send Attendance Warning Notice"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setWarningModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleSendWarning} style={{ gap: 6 }}>
              <Send size={15} />
              <span>Send Official SMS & Notice</span>
            </button>
          </>
        }
      >
        {selectedStudent && (
          <div>
            <p style={{ fontSize: "0.9rem", marginBottom: 14 }}>
              You are about to issue an official academic shortage alert for:
            </p>
            <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: 8, marginBottom: 16 }}>
              <p><strong>Student:</strong> {selectedStudent.name} ({selectedStudent.rollNo})</p>
              <p><strong>Current Attendance:</strong> <span style={{ color: "#ef4444", fontWeight: 700 }}>{selectedStudent.attendanceRate}%</span></p>
              <p><strong>Guardian:</strong> {selectedStudent.parentName} ({selectedStudent.parentPhone})</p>
            </div>
            <div className="form-group">
              <label className="form-label">Message Content Preview</label>
              <textarea
                className="form-textarea"
                rows={3}
                readOnly
                value={`Dear ${selectedStudent.parentName}, this is an official notice from St. Jude Institute of Tech. Your ward ${selectedStudent.name}'s attendance has dropped to ${selectedStudent.attendanceRate}%. Immediate remedial attendance is required.`}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

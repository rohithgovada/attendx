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
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserCheck,
  Check,
  X,
  AlertCircle
} from "lucide-react";

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Contact Class Advisor modal state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");

  // Parent Leave Letter modal state
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

  const fetchData = async () => {
    try {
      const res = await api.getParentDashboardData(user?.id);
      setData(res);
    } catch (err) {
      console.error("Failed to load parent dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time leave updates across tabs/components
    const handleLeaveUpdate = () => {
      fetchData();
    };
    window.addEventListener("attendx_leave_applications_updated", handleLeaveUpdate);
    return () => {
      window.removeEventListener("attendx_leave_applications_updated", handleLeaveUpdate);
    };
  }, [user]);

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    await api.createNotification({
      title: `💬 Parent Inquiry from ${user?.name || "Mr. David Morgan"}`,
      message: `Subject: "${inquirySubject}". Ward: ${data?.ward?.name} (${data?.ward?.rollNo}). Message: ${inquiryMessage}`,
      category: "Academic",
      targetRole: "faculty",
      priority: "medium"
    });
    setInquiryModalOpen(false);
    setInquirySubject("");
    setInquiryMessage("");
    setToastMessage("Inquiry delivered to Class In-Charge Dr. Sarah Jenkins. Notification dispatched!");
  };

  const handleApplyParentLeave = async (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const assignedIncharge = data?.facultyAdvisor?.name || "Dr. Sarah Jenkins";
    const assignedEmail = data?.facultyAdvisor?.email || "sarah.jenkins@college.edu";
    const leaveType = `Parent Absence Letter (${daysCount} Day${daysCount > 1 ? "s" : ""})`;

    await api.applyForLeave({
      studentId: data?.ward?.id || "STU202401",
      studentName: data?.ward?.name || "Alex Morgan",
      rollNo: data?.ward?.rollNo || "CS2024-042",
      department: data?.ward?.department || "Computer Science & Engineering",
      year: data?.ward?.year || "3rd Year",
      semester: data?.ward?.semester || "6th Semester",
      section: data?.ward?.section || "A",
      leaveType,
      category: leaveCategory,
      startDate,
      endDate,
      totalDays: daysCount,
      reason: leaveReason,
      assignedIncharge,
      assignedInchargeEmail: assignedEmail,
      reviewLevel: "incharge",
      status: "Pending In-Charge Review",
      submittedBy: "parent",
      parentName: user?.name || "Mr. David Morgan",
      parentPhone: user?.phone || "+1 (555) 876-5432",
      parentRelation: user?.relation || "Father"
    });

    setLeaveModalOpen(false);
    setLeaveReason("");
    setToastMessage(`Official absence letter forwarded directly to Class In-Charge ${assignedIncharge}. Pending review.`);
    await fetchData();
  };

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading parent monitoring portal...
      </div>
    );
  }

  const { ward, overallRate, subjects, todaySchedule, criticalSubjects, facultyAdvisor, leaveApplications } = data;

  return (
    <div>
      <Toast message={toastMessage} onClose={() => setToastMessage("")} />

      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Parent Portal: Monitoring {ward.name}
            </h1>
            <Badge variant="good">Verified Guardian</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Guardian: <strong>{user?.name}</strong> • Ward Roll No: <strong>{ward.rollNo}</strong> • {ward.department}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: 8, background: "#7c3aed", borderColor: "#7c3aed" }}
          >
            <FileText size={16} />
            <span>✍️ Write Leave Letter to Faculty</span>
          </button>
          <button
            onClick={() => setInquiryModalOpen(true)}
            className="btn btn-outline"
            style={{ gap: 8 }}
          >
            <MessageSquare size={16} />
            <span>Contact Class Advisor</span>
          </button>
          <Link to="/student/attendance" className="btn btn-outline" style={{ gap: 8 }}>
            <Calendar size={16} />
            <span>Detailed Attendance Sheet</span>
          </Link>
        </div>
      </div>

      {/* Shortage Warning Notice if critical subjects exist */}
      {criticalSubjects.length > 0 && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-md)",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={24} color="#d97706" />
            <div>
              <p style={{ fontSize: "0.92rem", fontWeight: 700 }}>
                Parent Advisory: Subject Shortage Detected
              </p>
              <p style={{ fontSize: "0.82rem", marginTop: 2 }}>
                {ward.name}'s attendance in {criticalSubjects.map(s => s.name).join(" & ")} is currently below the 75% minimum required for semester examinations.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="btn btn-sm"
              style={{ background: "#7c3aed", color: "#fff" }}
            >
              Submit Excuse Letter
            </button>
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="btn btn-sm"
              style={{ background: "#d97706", color: "#fff" }}
            >
              Inquire Now
            </button>
          </div>
        </div>
      )}

      {/* Top 4 KPI Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Ward's Overall Attendance"
          value={`${overallRate}%`}
          icon={TrendingUp}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="Overall Good Standing"
          trendType="positive"
          subtext="• Threshold: 75% Min"
        />
        <StatCard
          title="Classes Attended"
          value="148 / 182"
          icon={CheckCircle2}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="148 hours logged"
          trendType="positive"
        />
        <StatCard
          title="Classes Missed"
          value="34 Hours"
          icon={Clock}
          color="#f59e0b"
          bgColor="#fffbeb"
          trend="8 Excused (Medical)"
          trendType="neutral"
        />
        <StatCard
          title="Current Exam Eligibility"
          value="Eligible"
          icon={ShieldCheck}
          color="#10b981"
          bgColor="#ecfdf5"
          trend="Overall >= 75%"
          trendType="positive"
        />
      </div>

      {/* Two Column Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Ward's Subject Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                <GraduationCap size={18} color="var(--primary)" />
                <span>Subject Attendance Breakdown</span>
              </h2>
              <p className="card-subtitle">Real-time attendance status in each 6th semester course</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {subjects.map((sub) => (
              <div key={sub.code}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{sub.name}</span>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Faculty: {sub.faculty} • {sub.attended}/{sub.conducted} classes
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: sub.percentage < 75 ? "#ef4444" : "#10b981"
                      }}
                    >
                      {sub.percentage}%
                    </span>
                    <p style={{ fontSize: "0.72rem", color: sub.percentage < 75 ? "#ef4444" : "var(--text-muted)" }}>
                      {sub.percentage < 75 ? "Needs attendance" : "Safe"}
                    </p>
                  </div>
                </div>
                <ProgressBar
                  value={sub.percentage}
                  showLabel={false}
                  showThreshold={true}
                  height={8}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Faculty Advisor & Today's Attendance Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Class In-Charge / Advisor Card */}
          <div className="card" style={{ border: "1px solid #bfdbfe" }}>
            <div className="card-header" style={{ background: "#f0f7ff", borderBottom: "1px solid #bfdbfe" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <h3 className="card-title" style={{ color: "#1e40af" }}>Class In-Charge Advisor</h3>
                  <Badge variant="primary">Designated Mentor</Badge>
                </div>
                <p className="card-subtitle" style={{ color: "#1e3a8a" }}>Official faculty mentor assigned to your ward</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, marginTop: 12 }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                alt="Faculty Advisor"
                style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #2563eb" }}
              />
              <div>
                <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>{facultyAdvisor.name}</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{facultyAdvisor.designation}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>{facultyAdvisor.officeHours}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                <Phone size={15} color="var(--primary)" />
                <span>{facultyAdvisor.phone}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
                <Mail size={15} color="var(--primary)" />
                <span>{facultyAdvisor.email}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ flex: 1, gap: 6, background: "#7c3aed", borderColor: "#7c3aed" }}
              >
                <FileText size={14} />
                <span>Send Leave Note</span>
              </button>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="btn btn-outline btn-sm"
                style={{ flex: 1, gap: 6 }}
              >
                <MessageSquare size={14} />
                <span>Message Advisor</span>
              </button>
            </div>
          </div>

          {/* Today's Classes Verification */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Today's Class Presence</h3>
                <p className="card-subtitle">Saturday, Sept 13 • Gate & Class Logs</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todaySchedule.slice(0, 3).map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    background: "var(--bg-main)",
                    borderRadius: 8
                  }}
                >
                  <div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>{slot.subjectCode}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{slot.time}</p>
                  </div>
                  <Badge variant={slot.status === "Present" ? "good" : "danger"}>
                    {slot.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Leave Letters Sent to Faculty Section */}
      <div className="card" style={{ marginBottom: 24, border: "1px solid #ddd6fe" }}>
        <div className="card-header" style={{ background: "#f5f3ff", borderBottom: "1px solid #ddd6fe" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b21a8" }}>
                <FileText size={20} color="#7c3aed" />
                <span>Absence Leave Letters Sent to Faculty</span>
              </h2>
              <Badge variant="primary" style={{ background: "#7c3aed", color: "#fff" }}>
                Class In-Charge Desk
              </Badge>
            </div>
            <p className="card-subtitle" style={{ color: "#581c87" }}>
              Directly routed to Class In-Charge <strong>Dr. Sarah Jenkins</strong> for verification, approval, and official attendance excusal
            </p>
          </div>
          <div>
            <button
              onClick={() => setLeaveModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, background: "#7c3aed", borderColor: "#7c3aed" }}
            >
              <FileText size={14} />
              <span>✍️ Write New Absence Letter</span>
            </button>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {(!leaveApplications || leaveApplications.length === 0) ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", background: "#f8fafc", borderRadius: 8, border: "1px dashed var(--border-color)" }}>
              <FileText size={32} color="var(--text-muted)" style={{ margin: "0 auto 10px auto", opacity: 0.6 }} />
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>No absence excuse letters submitted yet</p>
              <p style={{ fontSize: "0.82rem", marginTop: 4 }}>
                If your ward {ward.name} is sick or unable to attend college, click the button below to submit a formal letter directly to their Class In-Charge.
              </p>
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="btn btn-outline btn-sm"
                style={{ marginTop: 14, color: "#7c3aed", borderColor: "#ddd6fe" }}
              >
                Write Leave Letter
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Letter ID &amp; Date</th>
                    <th>Absence Period</th>
                    <th>Category</th>
                    <th>Guardian Reason / Medical Note</th>
                    <th>Assigned Faculty</th>
                    <th>Review Status</th>
                    <th>Faculty Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.id}</strong>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {app.appliedAt}
                        </div>
                        {app.submittedBy === "parent" && (
                          <div style={{ marginTop: 2 }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#7c3aed", background: "#f3e8ff", padding: "1px 6px", borderRadius: 4 }}>
                              By Guardian
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{app.totalDays} Day{app.totalDays > 1 ? "s" : ""}</span>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {app.startDate} {app.startDate !== app.endDate ? `to ${app.endDate}` : ""}
                        </div>
                      </td>
                      <td>
                        <Badge variant="warning">{app.category}</Badge>
                      </td>
                      <td style={{ maxWidth: "260px", fontSize: "0.82rem" }}>
                        <p style={{ margin: 0, fontWeight: 500 }}>{app.reason}</p>
                        {app.parentName && (
                          <p style={{ margin: "4px 0 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Guardian: {app.parentName} ({app.parentRelation || "Parent"})
                          </p>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                          {app.assignedIncharge || "Dr. Sarah Jenkins"}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          Class In-Charge
                        </div>
                      </td>
                      <td>
                        {app.status === "Pending In-Charge Review" && (
                          <Badge variant="warning">⏳ Pending In-Charge Review</Badge>
                        )}
                        {app.status === "Approved" && (
                          <Badge variant="good">✅ Approved (Excused)</Badge>
                        )}
                        {app.status === "Rejected" && (
                          <Badge variant="danger">❌ Rejected</Badge>
                        )}
                        {!["Pending In-Charge Review", "Approved", "Rejected"].includes(app.status) && (
                          <Badge variant="neutral">{app.status}</Badge>
                        )}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "240px" }}>
                        {app.reviewerRemarks ? (
                          <span style={{ fontStyle: "italic", color: "var(--text-main)" }}>
                            "{app.reviewerRemarks}"
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-subtle)" }}>Awaiting In-Charge action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Parent Leave Letter Submission Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Official Absence Excuse Letter (To Class In-Charge)"
      >
        <form onSubmit={handleApplyParentLeave}>
          {/* Target In-Charge Banner */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              marginBottom: 18,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: 10
            }}
          >
            <UserCheck size={20} color="#16a34a" />
            <div>
              <strong>Recipient: Dr. Sarah Jenkins (Class In-Charge)</strong>
              <div style={{ fontSize: "0.78rem", color: "#15803d" }}>
                CSE 3rd Year (6th Sem) - Sec A • This letter directly excuses your ward's class absence upon review.
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-main)", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Student / Ward:</span>
              <strong>{ward.name} ({ward.rollNo})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Department &amp; Section:</span>
              <span>{ward.department} - Sec A</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Submitting Guardian:</span>
              <span>{user?.name || "Mr. David Morgan"} ({user?.relation || "Father"})</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Absence Category</label>
            <select
              className="form-select"
              value={leaveCategory}
              onChange={(e) => setLeaveCategory(e.target.value)}
            >
              <option value="Medical / Sick Leave">Medical / Sick Leave</option>
              <option value="Doctor / Hospital Appointment">Doctor / Hospital Appointment</option>
              <option value="Family Emergency / Event">Family Emergency / Event</option>
              <option value="Travel / Bereavement">Travel / Bereavement</option>
              <option value="Other Absence Reason">Other Absence Reason</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Absence Start Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Absence End Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              fontSize: "0.82rem",
              color: "#1e40af",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>Calculated Duration: <strong>{daysCount} Day(s)</strong></span>
            <span style={{ fontWeight: 600 }}>Routed to: Class In-Charge Desk</span>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Explanation for Absence</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Please provide the specific reason for your ward's absence (e.g., severe fever, family obligation, doctor consultation)..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Guardian Contact Phone for Verification</label>
            <input
              type="text"
              className="form-input"
              readOnly
              value={user?.phone || "+1 (555) 876-5432"}
              style={{ background: "#f1f5f9", cursor: "not-allowed" }}
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
              style={{ gap: 6, background: "#7c3aed", borderColor: "#7c3aed" }}
            >
              <Send size={15} />
              <span>Forward Letter to Faculty</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Advisor Inquiry Modal */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title="Contact Class Advisor (Dr. Sarah Jenkins)"
      >
        <form onSubmit={handleSendInquiry}>
          <div className="form-group">
            <label className="form-label">Subject of Inquiry</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Leave note explanation / Attendance shortage query"
              value={inquirySubject}
              onChange={(e) => setInquirySubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message to Advisor</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Provide details regarding your ward's attendance, absence reason, or requested consultation..."
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setInquiryModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ gap: 6 }}>
              <Send size={15} />
              <span>Submit Message</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

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
  Send,
  Search,
  Phone,
  Mail,
  Filter
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

  // Student Registry Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Student Shortage Warning Modal state
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedStudentForWarning, setSelectedStudentForWarning] = useState(null);
  const [warningMessage, setWarningMessage] = useState("");

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

  const handleOpenStudentWarning = (student) => {
    setSelectedStudentForWarning(student);
    setWarningMessage(
      `OFFICIAL NOTICE: Dear ${student.name} (${student.rollNo}), your overall attendance stands at ${student.attendanceRate}%, which is below the university 75% requirement. Please report to the Principal's Office with your guardian (${student.parentName}).`
    );
    setWarningModalOpen(true);
  };

  const handleSendStudentWarning = async (e) => {
    e.preventDefault();
    if (!selectedStudentForWarning) return;

    await api.createNotification({
      title: `⚠️ Executive Shortage Notice: ${selectedStudentForWarning.name} (${selectedStudentForWarning.rollNo})`,
      message: warningMessage,
      category: "Warning",
      targetRole: "student",
      sender: "Dr. Robert Vance (Principal)",
      priority: "high"
    });

    setWarningModalOpen(false);
    setToastMessage(`Official executive notice dispatched to ${selectedStudentForWarning.name} & guardian (${selectedStudentForWarning.parentPhone})!`);
  };

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

  const allStudents = data.students || [];
  const filteredStudents = allStudents.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    const matchQuery =
      !query ||
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query));

    const matchDept =
      selectedDepartment === "all" ||
      (s.department && s.department.toLowerCase().includes(selectedDepartment.toLowerCase()));

    let matchStatus = true;
    if (selectedStatus === "defaulters") {
      matchStatus = s.attendanceRate < 75;
    } else if (selectedStatus === "compliant") {
      matchStatus = s.attendanceRate >= 75 && s.attendanceRate < 90;
    } else if (selectedStatus === "excellent") {
      matchStatus = s.attendanceRate >= 90;
    }

    return matchQuery && matchDept && matchStatus;
  });

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

      {/* Campus Student Attendance Master Registry & Defaulter Watchlist */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header" style={{ flexDirection: "column", alignItems: "stretch", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GraduationCap size={20} color="var(--primary)" />
                <span>Campus Student Attendance Master Registry &amp; Defaulter Watchlist</span>
              </h2>
              <p className="card-subtitle">
                Official student-level records: Roll numbers, real-time attendance percentages, shortage alerts &amp; direct guardian notices
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Showing {filteredStudents.length} of {allStudents.length} Students
              </span>
              <Link to="/reports" className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "6px 12px", gap: 6 }}>
                <FileSpreadsheet size={14} />
                <span>Export Ledger</span>
              </Link>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            {/* Search Input */}
            <div style={{ flex: "1 1 260px", position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  pointerEvents: "none"
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36, width: "100%", fontSize: "0.85rem" }}
                placeholder="Search by student name, roll no (e.g. CS2024-001), or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div style={{ minWidth: "180px" }}>
              <select
                className="form-select"
                style={{ fontSize: "0.85rem" }}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science &amp; Eng.</option>
                <option value="Electronics">Electronics &amp; Comm.</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Civil">Civil Engineering</option>
                <option value="Information">Information Technology</option>
              </select>
            </div>

            {/* Attendance Status Filter */}
            <div style={{ minWidth: "190px" }}>
              <select
                className="form-select"
                style={{ fontSize: "0.85rem" }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Attendance Rates</option>
                <option value="defaulters">⚠️ Shortage Defaulters (&lt; 75%)</option>
                <option value="compliant">🟢 Compliant Attendance (75% - 89%)</option>
                <option value="excellent">⭐ High Honors (&ge; 90%)</option>
              </select>
            </div>

            {(searchQuery || selectedDepartment !== "all" || selectedStatus !== "all") && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDepartment("all");
                  setSelectedStatus("all");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Student Data Table */}
        <div className="table-responsive" style={{ maxHeight: "540px", overflowY: "auto" }}>
          <table className="data-table">
            <thead style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <tr>
                <th>Roll Number</th>
                <th>Student Details</th>
                <th>Department &amp; Class</th>
                <th>Classes Attended</th>
                <th style={{ minWidth: "170px" }}>Attendance Rate</th>
                <th>Compliance Status</th>
                <th>Guardian / Parent</th>
                <th style={{ textAlign: "right" }}>Executive Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    No students match the specified filters or search query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isDefaulter = student.attendanceRate < 75;
                  const isWarning = student.attendanceRate >= 75 && student.attendanceRate < 80;
                  const isTop = student.attendanceRate >= 90;

                  return (
                    <tr
                      key={student.id || student.rollNo}
                      style={{
                        backgroundColor: isDefaulter ? "rgba(239, 68, 68, 0.03)" : "transparent"
                      }}
                    >
                      {/* Roll Number */}
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            background: isDefaulter ? "#fee2e2" : "#f1f5f9",
                            color: isDefaulter ? "#991b1b" : "#0f172a",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: `1px solid ${isDefaulter ? "#fca5a5" : "#cbd5e1"}`,
                            display: "inline-block",
                            letterSpacing: "0.03em"
                          }}
                        >
                          {student.rollNo}
                        </span>
                      </td>

                      {/* Student Details */}
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "0.88rem" }}>
                            {student.name}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                            <Mail size={12} />
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Class */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-main)" }}>
                          {student.department?.includes("Computer")
                            ? "CSE"
                            : student.department?.includes("Electronics")
                            ? "ECE"
                            : student.department?.includes("Mechanical")
                            ? "MECH"
                            : student.department?.includes("Civil")
                            ? "CIVIL"
                            : "IT"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {student.semester} • Sec {student.section}
                        </div>
                      </td>

                      {/* Classes Attended */}
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {student.attendedClasses}
                        </span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {" "}/ {student.totalClasses}
                        </span>
                      </td>

                      {/* Attendance Rate */}
                      <td>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Rate</span>
                          <strong
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 700,
                              color: isDefaulter ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981"
                            }}
                          >
                            {student.attendanceRate}%
                          </strong>
                        </div>
                        <ProgressBar
                          value={student.attendanceRate}
                          showLabel={false}
                          showThreshold={true}
                          height={7}
                        />
                      </td>

                      {/* Compliance Status */}
                      <td>
                        <Badge
                          variant={
                            isDefaulter
                              ? "danger"
                              : isWarning
                              ? "warning"
                              : isTop
                              ? "success"
                              : "good"
                          }
                        >
                          {isDefaulter
                            ? "Shortage Defaulter"
                            : isWarning
                            ? "At Risk (<80%)"
                            : isTop
                            ? "High Honor (≥90%)"
                            : "Compliant"}
                        </Badge>
                      </td>

                      {/* Guardian Info */}
                      <td>
                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-main)" }}>
                          {student.parentName}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Phone size={11} color="var(--primary)" />
                          <span>{student.parentPhone}</span>
                        </div>
                      </td>

                      {/* Executive Action */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleOpenStudentWarning(student)}
                          className="btn btn-outline"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.75rem",
                            color: isDefaulter ? "#b91c1c" : "var(--primary)",
                            borderColor: isDefaulter ? "#fca5a5" : "var(--border-color)",
                            background: isDefaulter ? "#fff1f2" : "#fff",
                            whiteSpace: "nowrap",
                            fontWeight: 600
                          }}
                        >
                          <Megaphone size={12} style={{ marginRight: 4 }} />
                          <span>{isDefaulter ? "Issue Notice" : "Send Advisory"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
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

      {/* Individual Student Shortage Notice Modal */}
      <Modal
        isOpen={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        title="Official Executive Attendance Shortage Notice"
      >
        {selectedStudentForWarning && (
          <form onSubmit={handleSendStudentWarning}>
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: selectedStudentForWarning.attendanceRate < 75 ? "#fef2f2" : "#f0fdf4",
                border: `1px solid ${selectedStudentForWarning.attendanceRate < 75 ? "#fca5a5" : "#86efac"}`,
                marginBottom: 16
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                    {selectedStudentForWarning.name}
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {selectedStudentForWarning.department} • {selectedStudentForWarning.semester}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    background: "#fff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1"
                  }}
                >
                  {selectedStudentForWarning.rollNo}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10, fontSize: "0.82rem" }}>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Attendance Rate: </span>
                  <strong style={{ color: selectedStudentForWarning.attendanceRate < 75 ? "#dc2626" : "#16a34a" }}>
                    {selectedStudentForWarning.attendanceRate}% ({selectedStudentForWarning.attendedClasses}/{selectedStudentForWarning.totalClasses} hrs)
                  </strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-muted)" }}>Guardian: </span>
                  <strong>{selectedStudentForWarning.parentName} ({selectedStudentForWarning.parentPhone})</strong>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Executive Directive / Notice</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                This notice will be recorded in the student's academic ledger and dispatched via SMS/Notification to the student and parent.
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setWarningModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  gap: 6,
                  background: selectedStudentForWarning.attendanceRate < 75 ? "#dc2626" : "var(--primary)"
                }}
              >
                <Send size={15} />
                <span>Dispatch Executive Notice</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

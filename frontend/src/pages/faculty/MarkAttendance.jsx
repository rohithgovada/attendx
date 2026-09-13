import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import { Toast } from "../../components/common/Toast";
import { Modal } from "../../components/common/Modal";
import {
  ClipboardList,
  CheckCheck,
  XCircle,
  Save,
  Search,
  Users
} from "lucide-react";

export const MarkAttendance = () => {
  const { user } = useAuth();

  // Filters / Session Meta
  const [department, setDepartment] = useState("CSE");
  const [semester] = useState("6th Semester");
  const [section, setSection] = useState("A");
  const [subject, setSubject] = useState("CS601: Advanced Database Systems");
  const [date, setDate] = useState("2026-09-13");
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 10:00 AM");
  const [lectureTopic, setLectureTopic] = useState("B+ Trees & Query Optimization Execution Plans");

  // Roster state
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: "Present" | "Absent" | "Late" }
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // UI state
  const [toastMessage, setToastMessage] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        const roster = await api.getClassRoster(department, semester, section);
        setStudents(roster);

        // Initialize default: All Present
        const initialStatus = {};
        roster.forEach((s) => {
          initialStatus[s.id] = "Present";
        });
        setAttendanceMap(initialStatus);
      } catch (err) {
        console.error("Failed to load roster:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoster();
  }, [department, semester, section]);

  // Bulk actions
  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleToggleStatus = (studentId, newStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: newStatus
    }));
  };

  // Compute live statistics
  const total = students.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "Absent").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "Late").length;
  const liveRate = total > 0 ? (((presentCount + lateCount * 0.5) / total) * 100).toFixed(1) : 0;

  // Filtered student list for searching
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitAttendance = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        department,
        semester,
        section,
        subject,
        date,
        timeSlot,
        lectureTopic,
        facultyId: user?.id,
        facultyName: user?.name,
        stats: { total, presentCount, absentCount, lateCount, rate: liveRate },
        records: attendanceMap
      };

      await api.submitAttendance(payload);
      setConfirmModalOpen(false);
      setToastMessage(`Attendance for ${subject} successfully recorded and synced to college database!`);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading class roster and attendance registers...
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
              Faculty Attendance Marking Studio
            </h1>
            <Badge variant="faculty">Class Register</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Faculty: <strong>{user?.name}</strong> • Mark, verify, and submit session attendance for department records
          </p>
        </div>

        <button
          onClick={() => setConfirmModalOpen(true)}
          className="btn btn-primary btn-lg"
          style={{ gap: 8, boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)" }}
        >
          <Save size={18} />
          <span>Save & Finalize Register</span>
        </button>
      </div>

      {/* Class Session Configuration Strip */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Department</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="CSE">Computer Science (CSE)</option>
              <option value="IT">Information Technology (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Semester & Section</label>
            <select
              className="form-select"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="A">6th Sem - Section A</option>
              <option value="B">6th Sem - Section B</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course / Subject</label>
            <select
              className="form-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="CS601: Advanced Database Systems">CS601: Advanced Database Systems</option>
              <option value="CS605: Software Engineering & Agile">CS605: Software Engineering & Agile</option>
              <option value="CS606: Distributed Systems Lab">CS606: Distributed Systems Lab</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lecture Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lecture Time Slot</label>
            <select
              className="form-select"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            >
              <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
              <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
              <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
              <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Lab)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-light)" }}>
          <label className="form-label" style={{ fontSize: "0.8rem" }}>Lecture Topic / Syllabus Covered</label>
          <input
            type="text"
            className="form-input"
            value={lectureTopic}
            onChange={(e) => setLectureTopic(e.target.value)}
            placeholder="e.g. Unit 3: Indexing structures, B+ Trees, and concurrency controls"
          />
        </div>
      </div>

      {/* Live Summary Bar & Bulk Actions */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          marginBottom: 20
        }}
      >
        {/* Real-time counters */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={18} color="var(--text-muted)" />
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Total:</span>
            <strong style={{ fontSize: "1.1rem" }}>{total}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Present:</span>
            <strong style={{ fontSize: "1.1rem", color: "#10b981" }}>{presentCount}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Absent:</span>
            <strong style={{ fontSize: "1.1rem", color: "#ef4444" }}>{absentCount}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Late:</span>
            <strong style={{ fontSize: "1.1rem", color: "#f59e0b" }}>{lateCount}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: "2px solid var(--border-color)" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Class Rate:</span>
            <strong style={{ fontSize: "1.2rem", color: liveRate >= 75 ? "#10b981" : "#ef4444" }}>
              {liveRate}%
            </strong>
          </div>
        </div>

        {/* Quick Bulk Buttons & Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => handleMarkAll("Present")}
            className="btn btn-outline btn-sm"
            style={{ color: "#065f46", borderColor: "#a7f3d0", background: "#ecfdf5" }}
          >
            <CheckCheck size={14} />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={() => handleMarkAll("Absent")}
            className="btn btn-outline btn-sm"
            style={{ color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}
          >
            <XCircle size={14} />
            <span>Mark All Absent</span>
          </button>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <ClipboardList size={18} color="var(--primary)" />
              <span>Student Register ({filteredStudents.length} Students)</span>
            </h2>
            <p className="card-subtitle">Click the status buttons to toggle individual attendance</p>
          </div>

          <div className="navbar-search" style={{ width: "auto" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Term Attendance</th>
                <th>Mark Status (Click to set)</th>
                <th>Current Selection</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const currentStatus = attendanceMap[student.id] || "Present";
                return (
                  <tr key={student.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{idx + 1}</td>
                    <td><strong>{student.rollNo}</strong></td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600 }}>{student.name}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{student.email}</p>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: student.attendanceRate < 75 ? "#ef4444" : "#10b981"
                        }}
                      >
                        {student.attendanceRate}%
                      </span>
                      {student.attendanceRate < 75 && (
                        <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#ef4444", fontWeight: 700 }}>
                          (Defaulter)
                        </span>
                      )}
                    </td>
                    <td>
                      {/* 3-Way Pill Switcher */}
                      <div style={{ display: "inline-flex", background: "var(--bg-main)", padding: 3, borderRadius: 8, border: "1px solid var(--border-color)" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, "Present")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            transition: "all 0.15s ease",
                            background: currentStatus === "Present" ? "#10b981" : "transparent",
                            color: currentStatus === "Present" ? "#ffffff" : "var(--text-muted)"
                          }}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, "Absent")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            transition: "all 0.15s ease",
                            background: currentStatus === "Absent" ? "#ef4444" : "transparent",
                            color: currentStatus === "Absent" ? "#ffffff" : "var(--text-muted)"
                          }}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(student.id, "Late")}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 6,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            transition: "all 0.15s ease",
                            background: currentStatus === "Late" ? "#f59e0b" : "transparent",
                            color: currentStatus === "Late" ? "#ffffff" : "var(--text-muted)"
                          }}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                    <td>
                      <Badge variant={currentStatus}>{currentStatus}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Attendance Submission"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setConfirmModalOpen(false)}>
              Back to Edit
            </button>
            <button
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleSubmitAttendance}
              style={{ gap: 6 }}
            >
              <Save size={15} />
              <span>{isSubmitting ? "Locking Register..." : "Confirm & Submit Register"}</span>
            </button>
          </>
        }
      >
        <div>
          <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: 14 }}>
            You are about to finalize and lock the attendance record for this lecture:
          </p>
          <div style={{ background: "var(--bg-main)", padding: 14, borderRadius: 8, display: "flex", flexDirection: "column", gap: 6, fontSize: "0.85rem" }}>
            <p><strong>Course:</strong> {subject}</p>
            <p><strong>Batch:</strong> {department} {semester} - Section {section}</p>
            <p><strong>Date & Time:</strong> {date} ({timeSlot})</p>
            <p><strong>Lecture Topic:</strong> {lectureTopic || "Not specified"}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
              <span>Present: <strong style={{ color: "#10b981" }}>{presentCount}</strong></span>
              <span>Absent: <strong style={{ color: "#ef4444" }}>{absentCount}</strong></span>
              <span>Late: <strong style={{ color: "#f59e0b" }}>{lateCount}</strong></span>
              <span>Rate: <strong>{liveRate}%</strong></span>
            </div>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 12 }}>
            Once submitted, records are timestamped and synchronized with the principal's audit logs.
          </p>
        </div>
      </Modal>
    </div>
  );
};

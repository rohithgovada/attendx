import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { DataTable } from "../../components/common/DataTable";
import {
  CalendarCheck,
  Download,
  Clock
} from "lucide-react";

export const StudentAttendance = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const dData = await api.getStudentDashboardData(user?.id);
        const hData = await api.getStudentAttendanceHistory(user?.id);
        setDashboardData(dData);
        setAttendanceHistory(hData);
      } catch (err) {
        console.error("Failed to load attendance records:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAttendance();
  }, [user]);

  // Client-side CSV download
  const handleExportCSV = (dataToExport) => {
    const headers = ["Date", "Time", "Subject", "Session Type", "Faculty", "Status"];
    const rows = (dataToExport || attendanceHistory).map(log => [
      log.date,
      log.time,
      `"${log.subject}"`,
      log.sessionType,
      `"${log.faculty}"`,
      log.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AttendX_Attendance_${user?.rollNo || "Record"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !dashboardData) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading comprehensive attendance records...
      </div>
    );
  }

  // Calculate Margin rule:
  // To stay >= 75%:
  // If % >= 75: can miss = floor((attended - 0.75 * conducted) / 0.75)
  // If % < 75: must attend = ceil((0.75 * conducted - attended) / 0.25)
  const calculateMargin = (attended, conducted) => {
    const currentRate = (attended / conducted) * 100;
    if (currentRate >= 75) {
      const canMiss = Math.floor((attended - 0.75 * conducted) / 0.75);
      return {
        safe: true,
        text: canMiss > 0 ? `Can miss ${canMiss} more lecture${canMiss > 1 ? "s" : ""}` : "On the edge (cannot miss next lecture)",
        count: canMiss
      };
    } else {
      const mustAttend = Math.ceil((0.75 * conducted - attended) / 0.25);
      return {
        safe: false,
        text: `Must attend next ${mustAttend} class${mustAttend > 1 ? "es" : ""} consecutively`,
        count: mustAttend
      };
    }
  };

  const historyColumns = [
    { key: "date", label: "Date", sortable: true },
    { key: "time", label: "Slot Time", sortable: false },
    { key: "subject", label: "Course / Subject", sortable: true },
    { key: "sessionType", label: "Type", sortable: true },
    { key: "faculty", label: "Faculty In-Charge", sortable: true },
    {
      key: "status",
      label: "Attendance Status",
      sortable: true,
      render: (val) => {
        let variant = "good";
        if (val === "Absent") variant = "danger";
        else if (val === "Late") variant = "warning";
        return <Badge variant={variant}>{val}</Badge>;
      }
    }
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Detailed Attendance Ledger
            </h1>
            <Badge variant="good">Semester 6</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Student: <strong>{user?.name}</strong> • Roll No: <strong>{user?.rollNo}</strong> • Department of Computer Science
          </p>
        </div>

        <button
          onClick={() => handleExportCSV(attendanceHistory)}
          className="btn btn-outline"
          style={{ gap: 8 }}
        >
          <Download size={16} />
          <span>Export Attendance Sheet (CSV)</span>
        </button>
      </div>

      {/* Subject-Wise Master Table with Margin Advice */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <CalendarCheck size={18} color="var(--primary)" />
              <span>Subject-Wise Attendance & Safe Margin Calculator</span>
            </h2>
            <p className="card-subtitle">
              Official course-level breakdown with university 75% compliance indicator
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Faculty In-Charge</th>
                <th>Conducted</th>
                <th>Attended</th>
                <th>Absent</th>
                <th>Attendance %</th>
                <th>Compliance Status</th>
                <th>Remedial / Safe Margin</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.subjects.map((sub) => {
                const margin = calculateMargin(sub.attended, sub.conducted);
                return (
                  <tr key={sub.code}>
                    <td><strong>{sub.code}</strong></td>
                    <td>{sub.name}</td>
                    <td style={{ color: "var(--text-muted)" }}>{sub.faculty}</td>
                    <td>{sub.conducted}</td>
                    <td><strong style={{ color: "#10b981" }}>{sub.attended}</strong></td>
                    <td><span style={{ color: sub.absent > 5 ? "#ef4444" : "var(--text-main)" }}>{sub.absent}</span></td>
                    <td style={{ minWidth: 160 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontWeight: 700 }}>
                        <span style={{ color: sub.percentage < 75 ? "#ef4444" : "#10b981" }}>{sub.percentage}%</span>
                      </div>
                      <ProgressBar
                        value={sub.percentage}
                        showLabel={false}
                        showThreshold={true}
                        height={6}
                      />
                    </td>
                    <td>
                      <Badge variant={sub.percentage >= 75 ? "good" : "danger"}>
                        {sub.percentage >= 75 ? "Eligible" : "Debarred Risk"}
                      </Badge>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: margin.safe ? "#065f46" : "#b91c1c",
                          background: margin.safe ? "#ecfdf5" : "#fef2f2",
                          padding: "4px 8px",
                          borderRadius: 6,
                          display: "inline-block"
                        }}
                      >
                        {margin.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date-wise Daily Attendance Log */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Clock size={18} color="var(--primary)" />
              <span>Day-to-Day Class Attendance History</span>
            </h2>
            <p className="card-subtitle">Complete chronological event record of all attendance swipes and marks</p>
          </div>
        </div>

        <DataTable
          columns={historyColumns}
          data={attendanceHistory}
          searchKey="subject"
          searchPlaceholder="Search by course code or title..."
          filterKey="status"
          filterOptions={[
            { label: "Present Only", value: "Present" },
            { label: "Absent Only", value: "Absent" },
            { label: "Late Swipes", value: "Late" }
          ]}
          pageSize={8}
          onExport={handleExportCSV}
        />
      </div>
    </div>
  );
};

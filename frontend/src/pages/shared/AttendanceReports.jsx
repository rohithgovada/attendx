import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { Badge } from "../../components/common/Badge";
import { ProgressBar } from "../../components/common/ProgressBar";
import { DataTable } from "../../components/common/DataTable";
import { StatCard } from "../../components/common/StatCard";
import { Toast } from "../../components/common/Toast";
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Users,
  AlertTriangle,
  Award,
  TrendingUp,
  Search
} from "lucide-react";

export const AttendanceReports = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await api.getAttendanceReports();
        setStudents(data);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  // Filter application
  const filteredStudents = students.filter((s) => {
    const deptMatch = department === "all" || s.department.toLowerCase().includes(department.toLowerCase());
    const semMatch = semester === "all" || s.semester.toLowerCase().includes(semester.toLowerCase());
    const searchMatch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    let statusMatch = true;
    if (statusFilter === "defaulters") {
      statusMatch = s.attendanceRate < 75;
    } else if (statusFilter === "compliant") {
      statusMatch = s.attendanceRate >= 75 && s.attendanceRate < 90;
    } else if (statusFilter === "excellent") {
      statusMatch = s.attendanceRate >= 90;
    }

    return deptMatch && semMatch && searchMatch && statusMatch;
  });

  // Calculate Aggregates
  const totalAnalyzed = filteredStudents.length;
  const avgAttendance = totalAnalyzed > 0
    ? (filteredStudents.reduce((acc, s) => acc + s.attendanceRate, 0) / totalAnalyzed).toFixed(1)
    : 0;
  const defaulterCount = filteredStudents.filter((s) => s.attendanceRate < 75).length;
  const topPerformersCount = filteredStudents.filter((s) => s.attendanceRate >= 90).length;

  // Real CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Roll Number",
      "Student Name",
      "Department",
      "Academic Year",
      "Semester",
      "Section",
      "CGPA",
      "Marks %",
      "Academic Standing",
      "Total Classes",
      "Attended Classes",
      "Attendance Percentage",
      "Compliance Status",
      "Parent Name",
      "Parent Phone"
    ];

    const rows = filteredStudents.map((s) => [
      s.rollNo,
      `"${s.name}"`,
      `"${s.department}"`,
      s.year || "3rd Year",
      s.semester,
      s.section,
      s.cgpa || 8.5,
      `${s.marksPercentage || 85}%`,
      s.academicStanding || "Passed",
      s.totalClasses,
      s.attendedClasses,
      `${s.attendanceRate}%`,
      s.status,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AttendX_Attendance_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage("Report exported to CSV file successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  const reportColumns = [
    { key: "rollNo", label: "Roll No", sortable: true },
    {
      key: "name",
      label: "Student Name",
      sortable: true,
      render: (val, row) => (
        <div>
          <p style={{ fontWeight: 600 }}>{val}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{row.email}</p>
        </div>
      )
    },
    { key: "department", label: "Department", sortable: true },
    {
      key: "cgpa",
      label: "Academic Marks & Standing",
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 700, color: val >= 9.0 ? "#2563eb" : val >= 5.0 ? "#10b981" : "#dc2626" }}>
            {val || 8.5} CGPA ({row.marksPercentage || 85}%)
          </div>
          <div style={{ fontSize: "0.72rem" }}>
            {row.academicStanding === "Topper" ? (
              <span style={{ color: "#92400e", fontWeight: 700 }}>🏆 Topper (Rank #{row.classRank || 1})</span>
            ) : row.academicStanding === "Failed" ? (
              <span style={{ color: "#dc2626", fontWeight: 700 }}>❌ Failed ({row.backlogs || 2} backlogs)</span>
            ) : (
              <span style={{ color: "#166534", fontWeight: 600 }}>Passed</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "attendedClasses",
      label: "Attended / Conducted",
      sortable: true,
      render: (val, row) => (
        <span>
          <strong>{val}</strong> / {row.totalClasses}
        </span>
      )
    },
    {
      key: "attendanceRate",
      label: "Attendance Rate",
      sortable: true,
      render: (val) => (
        <div style={{ minWidth: 140 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontWeight: 700 }}>
            <span style={{ color: val < 75 ? "#ef4444" : "#10b981" }}>{val}%</span>
          </div>
          <ProgressBar value={val} showLabel={false} showThreshold={true} height={6} />
        </div>
      )
    },
    {
      key: "status",
      label: "Compliance Status",
      sortable: true,
      render: (val, row) => {
        let variant = "good";
        if (row.attendanceRate < 65) variant = "critical";
        else if (row.attendanceRate < 75) variant = "warning";
        else if (row.attendanceRate >= 90) variant = "excellent";
        return <Badge variant={variant}>{val}</Badge>;
      }
    },
    {
      key: "parentPhone",
      label: "Parent Contact",
      sortable: false,
      render: (val, row) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {row.parentName} ({val})
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        Generating institutional attendance analytics and reports...
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
              Attendance Intelligence & Audit Reports
            </h1>
            <Badge variant="primary">Campus Analytics</Badge>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Generate, filter, and export semester attendance sheets for academic compliance and university accreditation
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handlePrint} className="btn btn-outline" style={{ gap: 6 }}>
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-primary" style={{ gap: 6 }}>
            <Download size={16} />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* Analytical Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title="Students Filtered"
          value={totalAnalyzed}
          icon={Users}
          color="#2563eb"
          bgColor="#eff6ff"
          trend="In Selected Scope"
          trendType="neutral"
        />
        <StatCard
          title="Cohort Attendance Average"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          color="#10b981"
          bgColor="#ecfdf5"
          trend={avgAttendance >= 75 ? "Meets university norms" : "Below 75% norm"}
          trendType={avgAttendance >= 75 ? "positive" : "negative"}
        />
        <StatCard
          title="Shortage Defaulters"
          value={defaulterCount}
          icon={AlertTriangle}
          color="#ef4444"
          bgColor="#fef2f2"
          trend="< 75% Attendance"
          trendType="negative"
          subtext="• Examination bar list"
        />
        <StatCard
          title="Distinction (>90%)"
          value={topPerformersCount}
          icon={Award}
          color="#8b5cf6"
          bgColor="#f5f3ff"
          trend="Eligible for Honors"
          trendType="positive"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Filter size={18} color="var(--primary)" />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Custom Report Parameters</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Branch / Department</label>
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science &amp; Engineering</option>
              <option value="Electronics">Electronics &amp; Communication</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Information">Information Technology</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Academic Semester</label>
            <select
              className="form-select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="all">All Semesters (1st - 8th Sem)</option>
              <option value="1st">1st Semester (1st Year)</option>
              <option value="2nd">2nd Semester (1st Year)</option>
              <option value="3rd">3rd Semester (2nd Year)</option>
              <option value="4th">4th Semester (2nd Year)</option>
              <option value="5th">5th Semester (3rd Year)</option>
              <option value="6th">6th Semester (3rd Year)</option>
              <option value="7th">7th Semester (4th Year)</option>
              <option value="8th">8th Semester (4th Year)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Attendance Bracket</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Attendance Brackets</option>
              <option value="defaulters">Shortage Defaulters (&lt; 75%)</option>
              <option value="compliant">Compliant (75% - 89%)</option>
              <option value="excellent">Distinction (&ge; 90%)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Student</label>
            <div className="navbar-search" style={{ width: "100%" }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Name or Roll number..."
                style={{ width: "100%" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <BarChart3 size={18} color="var(--primary)" />
              <span>Official Attendance Ledger ({filteredStudents.length} Students)</span>
            </h2>
            <p className="card-subtitle">Verified attendance records with sorting and pagination</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn btn-outline btn-sm"
            style={{ gap: 6 }}
          >
            <Download size={14} />
            <span>Download CSV</span>
          </button>
        </div>

        <DataTable
          columns={reportColumns}
          data={filteredStudents}
          searchKey="name"
          searchPlaceholder="Quick filter rows..."
          pageSize={10}
          onExport={handleExportCSV}
        />
      </div>
    </div>
  );
};

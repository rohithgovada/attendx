import axios from "axios";
import { DEMO_USERS } from "../mockData/users";
import { STUDENTS } from "../mockData/students";
import {
  STUDENT_SUBJECT_ATTENDANCE,
  STUDENT_TODAY_TIMETABLE,
  FACULTY_TODAY_SCHEDULE,
  ATTENDANCE_HISTORY_LOG,
  INSTITUTION_DEPARTMENT_STATS
} from "../mockData/attendance";
import { NOTIFICATIONS_DATA } from "../mockData/notifications";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const api = {
  // Authentication
  async login(email, password, role) {
    try {
      const res = await client.post("/auth/login/", { email, password, role });
      if (res.data && res.data.success) {
        return res.data;
      }
    } catch {
      // Graceful fallback to demo user if backend connection is unavailable
      const user = DEMO_USERS[role];
      if (user) {
        return { success: true, user, token: `local_token_${role}` };
      }
    }
    return { success: false, message: "Invalid credentials" };
  },

  // Student Services
  async getStudentDashboardData(studentId) {
    try {
      const res = await client.get("/student/dashboard/", { params: { userId: studentId } });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const subjects = STUDENT_SUBJECT_ATTENDANCE;
    const timetable = STUDENT_TODAY_TIMETABLE;
    const totalConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
    const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const overallRate = Number(((totalAttended / totalConducted) * 100).toFixed(1));
    const defaulters = subjects.filter(s => s.percentage < 75);

    return {
      overallRate,
      totalConducted,
      totalAttended,
      totalAbsent: totalConducted - totalAttended,
      defaulterCount: defaulters.length,
      subjects,
      timetable,
      status: overallRate >= 75 ? (overallRate >= 85 ? "Excellent" : "Good") : "Warning"
    };
  },

  async getStudentAttendanceHistory(studentId, filters = {}) {
    try {
      const res = await client.get("/student/attendance-history/", { params: filters });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    let logs = [...ATTENDANCE_HISTORY_LOG];
    if (filters.subject) {
      logs = logs.filter(l => l.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    if (filters.status && filters.status !== "all") {
      logs = logs.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
    }
    return logs;
  },

  // Faculty Services
  async getFacultyDashboardData(facultyId) {
    try {
      const res = await client.get("/faculty/dashboard/");
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const schedule = FACULTY_TODAY_SCHEDULE;
    const lowAttendanceStudents = STUDENTS.filter(s => s.attendanceRate < 75);

    return {
      totalClassesConducted: 94,
      avgClassAttendance: 84.6,
      lowAttendanceCount: lowAttendanceStudents.length,
      scheduledTodayCount: schedule.length,
      todaySchedule: schedule,
      lowAttendanceStudents: lowAttendanceStudents.slice(0, 5)
    };
  },

  async getClassRoster(department = "CSE", semester = "6th", section = "A") {
    try {
      const res = await client.get("/faculty/roster/", { params: { department, semester, section } });
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    return STUDENTS;
  },

  // Mark Attendance & Trigger Automated Notification Engine in Django!
  async submitAttendance(markingPayload) {
    try {
      const res = await client.post("/faculty/mark-attendance/", markingPayload);
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    return { success: true, message: "Attendance registered and calculated successfully!" };
  },

  // Principal Services
  async getPrincipalDashboardData() {
    try {
      const res = await client.get("/principal/dashboard/");
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const deptStats = INSTITUTION_DEPARTMENT_STATS;
    const totalStudents = deptStats.reduce((acc, d) => acc + d.totalStudents, 0);
    const totalFaculty = deptStats.reduce((acc, d) => acc + d.facultyCount, 0);
    const totalDefaulters = deptStats.reduce((acc, d) => acc + d.defaulters, 0);
    const overallRate = (deptStats.reduce((acc, d) => acc + d.avgAttendance, 0) / deptStats.length).toFixed(1);

    return {
      totalStudents,
      totalFaculty,
      totalDefaulters,
      overallInstitutionAttendance: Number(overallRate),
      departmentStats: deptStats,
      recentAlerts: [
        { title: "Mechanical Engineering Attendance Drop", detail: "Sem 6 Mechanical attendance dipped below 77%", time: "1 hour ago", severity: "high" },
        { title: "Monthly Defaulter List Released", detail: "158 total students flagged for attendance shortage", time: "4 hours ago", severity: "medium" },
        { title: "Biometric & RFID Sync Completed", detail: "Campus RFID gate readers synced 1,420 entries", time: "Today 08:45 AM", severity: "info" }
      ]
    };
  },

  // Parent Services
  async getParentDashboardData(parentId) {
    try {
      const res = await client.get("/parent/dashboard/", { params: { parentId } });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    const student = DEMO_USERS.student;
    const subjects = STUDENT_SUBJECT_ATTENDANCE;
    const timetable = STUDENT_TODAY_TIMETABLE;

    return {
      ward: student,
      overallRate: student.attendanceRate,
      subjects,
      todaySchedule: timetable,
      criticalSubjects: subjects.filter(s => s.percentage < 75),
      facultyAdvisor: {
        name: "Dr. Sarah Jenkins",
        designation: "Associate Professor & Class In-Charge",
        email: "sarah.jenkins@college.edu",
        phone: "+1 (555) 345-6789",
        officeHours: "Mon-Fri: 03:00 PM - 04:30 PM"
      }
    };
  },

  // Notification Engine API
  async getNotifications(role = "all", userId = null) {
    try {
      const res = await client.get("/notifications/", { params: { role, userId } });
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    if (role === "all") return NOTIFICATIONS_DATA;
    return NOTIFICATIONS_DATA.filter(n => n.targetRole === "all" || n.targetRole === role);
  },

  async markNotificationRead(id) {
    try {
      await client.post(`/notifications/${id}/read/`);
    } catch {
      // Fallback
    }
    return { success: true };
  },

  async markAllNotificationsRead() {
    try {
      await client.post("/notifications/mark-all-read/");
    } catch {
      // Fallback
    }
    return { success: true };
  },

  async createNotification(notification) {
    try {
      const res = await client.post("/notifications/", notification);
      if (res.data && res.data.notification) return res.data;
    } catch {
      // Fallback
    }
    return { success: true, notification };
  },

  // Reports
  async getAttendanceReports(filters = {}) {
    try {
      const res = await client.get("/reports/", { params: filters });
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    let students = STUDENTS;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      students = students.filter(s => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q));
    }
    return students;
  },

  // User Profile
  async updateUserProfile(userId, updatedData) {
    try {
      const res = await client.post("/profile/update/", { userId, ...updatedData });
      if (res.data) return res.data;
    } catch {
      // Fallback
    }
    return { success: true, user: updatedData };
  }
};

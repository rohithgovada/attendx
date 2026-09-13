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

const INITIAL_LEAVE_APPLICATIONS = [
  {
    id: "LEV-2026-001",
    studentId: "STU202401",
    studentName: "Alex Morgan",
    rollNo: "CS2024-042",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "6th Semester",
    section: "A",
    leaveType: "Short Leave (1 - 2 Days)",
    category: "Medical / Sick Leave",
    startDate: "2026-09-14",
    endDate: "2026-09-14",
    totalDays: 1,
    reason: "Severe viral flu and fever. Doctor recommended 24-hour bed rest.",
    assignedIncharge: "Dr. Sarah Jenkins",
    assignedInchargeEmail: "sarah.jenkins@college.edu",
    reviewLevel: "incharge",
    status: "Pending In-Charge Review",
    appliedAt: "Today, 08:30 AM",
    reviewedAt: null,
    reviewerRemarks: ""
  },
  {
    id: "LEV-2026-002",
    studentId: "STU202404",
    studentName: "Caleb Johnson",
    rollNo: "CS2024-003",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "6th Semester",
    section: "A",
    leaveType: "Long Leave (3+ Days)",
    category: "Academic Duty Leave / Hackathon",
    startDate: "2026-09-16",
    endDate: "2026-09-19",
    totalDays: 4,
    reason: "Representing university at National Inter-College Smart India Hackathon Grand Finale in New Delhi.",
    assignedIncharge: "Dr. Sarah Jenkins",
    assignedInchargeEmail: "sarah.jenkins@college.edu",
    reviewLevel: "principal",
    status: "Pending Principal Sanction",
    appliedAt: "Yesterday, 04:15 PM",
    reviewedAt: null,
    reviewerRemarks: ""
  },
  {
    id: "LEV-2026-003",
    studentId: "STU202402",
    studentName: "Aiden Scott",
    rollNo: "CS2024-001",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    semester: "6th Semester",
    section: "A",
    leaveType: "Short Leave (1 - 2 Days)",
    category: "Personal / Family Event",
    startDate: "2026-09-10",
    endDate: "2026-09-11",
    totalDays: 2,
    reason: "Attending elder sister's wedding ceremony in Hyderabad.",
    assignedIncharge: "Dr. Sarah Jenkins",
    assignedInchargeEmail: "sarah.jenkins@college.edu",
    reviewLevel: "incharge",
    status: "Approved",
    appliedAt: "3 days ago",
    reviewedAt: "2 days ago",
    reviewerRemarks: "Approved by Class In-Charge Dr. Sarah Jenkins. Excused duty leave granted."
  }
];

const API_BASE_URL = "/api";

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

    const studentUser = DEMO_USERS.student;
    const allApps = this.getStoredLeaveApplications();
    const leaveApps = allApps.filter(a => a.studentId === (studentId || studentUser.id));

    return {
      overallRate,
      totalConducted,
      totalAttended,
      totalAbsent: totalConducted - totalAttended,
      defaulterCount: defaulters.length,
      subjects,
      timetable,
      status: overallRate >= 75 ? (overallRate >= 85 ? "Excellent" : "Good") : "Warning",
      academicMarks: {
        cgpa: studentUser.cgpa || 8.7,
        marksPercentage: studentUser.marksPercentage || 87.2,
        academicStanding: studentUser.academicStanding || "Passed",
        backlogs: studentUser.backlogs || 0,
        classRank: studentUser.classRank || 4
      },
      classIncharge: studentUser.classIncharge,
      leaveApplications: leaveApps
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

  // Helper to get persistent faculty schedule
  getStoredFacultySchedule() {
    try {
      const saved = localStorage.getItem("attendx_faculty_schedule");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return JSON.parse(JSON.stringify(FACULTY_TODAY_SCHEDULE));
  },

  // Faculty Services
  async getFacultyDashboardData(facultyId) {
    let schedule = this.getStoredFacultySchedule();

    try {
      const res = await client.get("/faculty/dashboard/");
      if (res.data && res.data.todaySchedule) {
        return res.data;
      }
    } catch {
      // Fallback
    }

    const lowAttendanceStudents = STUDENTS.filter(s => s.attendanceRate < 75);
    const completedCount = schedule.filter(s => s.marked).length;

    const allApps = this.getStoredLeaveApplications();
    const inchargeShortLeaves = allApps.filter(
      a => a.reviewLevel === "incharge" && a.status === "Pending In-Charge Review"
    );

    return {
      totalClassesConducted: 93 + completedCount,
      avgClassAttendance: 84.6,
      lowAttendanceCount: lowAttendanceStudents.length,
      scheduledTodayCount: schedule.length,
      completedTodayCount: completedCount,
      pendingTodayCount: schedule.length - completedCount,
      todaySchedule: schedule,
      lowAttendanceStudents: lowAttendanceStudents.slice(0, 5),
      inchargeSection: "CSE 3rd Year (6th Sem) - Sec A",
      inchargeShortLeaves
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

  // Mark Attendance & Trigger Automated Notification Engine!
  async submitAttendance(markingPayload) {
    // 1. Update Persistent Local Schedule
    try {
      const schedule = this.getStoredFacultySchedule();
      const subjectStr = markingPayload.subject || "";
      const subjectCode = subjectStr.split(":")[0].trim();
      const slotId = markingPayload.slotId;

      const slot = schedule.find(s => (slotId && s.id === slotId) || s.subjectCode === subjectCode || subjectStr.includes(s.subjectCode));
      if (slot) {
        slot.marked = true;
        slot.presentCount = markingPayload.stats?.presentCount ?? 19;
        slot.absentCount = markingPayload.stats?.absentCount ?? 1;
        localStorage.setItem("attendx_faculty_schedule", JSON.stringify(schedule));
      }
    } catch (e) {
      console.error("Local schedule update error:", e);
    }

    // 2. Automated Notification Engine: Dispatch alerts for absentees and parents
    try {
      if (markingPayload.records) {
        const records = markingPayload.records;
        const absentEntries = Object.entries(records).filter(([_, status]) => status === "absent");
        const sub = markingPayload.subject || "Class Session";

        // Dispatch notifications for each absent student
        for (const [sId] of absentEntries) {
          const stu = STUDENTS.find(s => String(s.id) === String(sId) || s.rollNo === sId);
          const studentName = stu ? stu.name : "Student";

          // Alert to Student
          await this.createNotification({
            title: `⚠️ Class Absence Recorded: ${sub}`,
            message: `You were marked ABSENT for ${sub} on ${markingPayload.date || "today"} (${markingPayload.timeSlot || "Lecture Period"}) by ${markingPayload.facultyName || "Faculty"}. Your attendance standing has been adjusted.`,
            category: "Warning",
            targetRole: "student",
            studentId: sId,
            priority: "high",
            sender: markingPayload.facultyName || "Department Faculty"
          });

          // Alert to Parent
          await this.createNotification({
            title: `🚨 Ward Absence Alert: ${studentName}`,
            message: `Official Notice: Your ward ${studentName} was marked ABSENT for ${sub} on ${markingPayload.date || "today"}. Please check the Parent Portal.`,
            category: "Warning",
            targetRole: "parent",
            studentId: sId,
            priority: "high",
            sender: "Attendance ERP Automated System"
          });
        }

        // Notify Principal regarding class register finalization
        await this.createNotification({
          title: `📋 Attendance Register Finalized: ${sub}`,
          message: `${markingPayload.facultyName || "Faculty"} marked and finalized attendance for ${markingPayload.section ? `Section ${markingPayload.section}` : "Class"} (${markingPayload.stats?.presentCount ?? 0} Present, ${markingPayload.stats?.absentCount ?? 0} Absent).`,
          category: "Academic",
          targetRole: "principal",
          priority: "medium",
          sender: "Academic ERP Cell"
        });
      }
    } catch (err) {
      console.error("Automated attendance notification failed:", err);
    }

    // 3. Post to backend if reachable
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

    const allApps = this.getStoredLeaveApplications();
    const executiveLongLeaves = allApps.filter(
      a => a.reviewLevel === "principal" && a.status === "Pending Principal Sanction"
    );

    return {
      totalStudents,
      totalFaculty,
      totalDefaulters,
      overallInstitutionAttendance: Number(overallRate),
      departmentStats: deptStats,
      students: STUDENTS,
      recentAlerts: [
        { title: "Mechanical Engineering Attendance Drop", detail: "Sem 6 Mechanical attendance dipped below 77%", time: "1 hour ago", severity: "high" },
        { title: "Monthly Defaulter List Released", detail: "158 total students flagged for attendance shortage", time: "4 hours ago", severity: "medium" },
        { title: "Biometric & RFID Sync Completed", detail: "Campus RFID gate readers synced 1,420 entries", time: "Today 08:45 AM", severity: "info" }
      ],
      executiveLongLeaves
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

  // Notification Engine API (Persistent with LocalStorage & Real-Time Event Dispatch)
  getStoredNotifications() {
    try {
      const saved = localStorage.getItem("attendx_notifications");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    const initial = JSON.parse(JSON.stringify(NOTIFICATIONS_DATA));
    try {
      localStorage.setItem("attendx_notifications", JSON.stringify(initial));
    } catch (e) {
      console.error(e);
    }
    return initial;
  },

  saveStoredNotifications(notifs) {
    try {
      localStorage.setItem("attendx_notifications", JSON.stringify(notifs));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("attendx_notifications_updated", { detail: notifs }));
      }
    } catch (e) {
      console.error("Failed to persist notifications:", e);
    }
  },

  async getNotifications(role = "all", userId = null) {
    try {
      const res = await client.get("/notifications/", { params: { role, userId } });
      if (res.data && res.data.length > 0) return res.data;
    } catch {
      // Fallback
    }
    const notifs = this.getStoredNotifications();
    if (role === "all") return notifs;
    return notifs.filter(n => n.targetRole === "all" || n.targetRole === role);
  },

  async markNotificationRead(id) {
    try {
      await client.post(`/notifications/${id}/read/`);
    } catch {
      // Fallback
    }
    const notifs = this.getStoredNotifications();
    const target = notifs.find(n => n.id === id);
    if (target) {
      target.read = true;
      target.is_read = true;
      this.saveStoredNotifications(notifs);
    }
    return { success: true };
  },

  async markAllNotificationsRead(role = null) {
    try {
      await client.post("/notifications/mark-all-read/");
    } catch {
      // Fallback
    }
    const notifs = this.getStoredNotifications();
    notifs.forEach(n => {
      if (!role || role === "all" || n.targetRole === "all" || n.targetRole === role) {
        n.read = true;
        n.is_read = true;
      }
    });
    this.saveStoredNotifications(notifs);
    return { success: true };
  },

  async createNotification(notification) {
    try {
      const res = await client.post("/notifications/", notification);
      if (res.data && res.data.notification) return res.data;
    } catch {
      // Fallback
    }
    const notifs = this.getStoredNotifications();
    const newNotif = {
      id: notification.id || `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notification.title || "New Campus Notification",
      message: notification.message || "",
      category: notification.category || "Circular",
      timestamp: "Just now",
      date: new Date().toISOString().split("T")[0],
      read: false,
      targetRole: notification.targetRole || "all",
      sender: notification.sender || "Campus Administration",
      priority: notification.priority || "medium",
      ...notification
    };
    notifs.unshift(newNotif);
    this.saveStoredNotifications(notifs);

    // Dispatch real-time live alert toast
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("attendx_new_notification", { detail: newNotif }));
    }

    return { success: true, notification: newNotif };
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
  },

  // Leave & Absence Permission Management
  getStoredLeaveApplications() {
    try {
      const saved = localStorage.getItem("attendx_leave_applications");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return JSON.parse(JSON.stringify(INITIAL_LEAVE_APPLICATIONS));
  },

  saveStoredLeaveApplications(apps) {
    try {
      localStorage.setItem("attendx_leave_applications", JSON.stringify(apps));
    } catch (e) {
      console.error("Failed to persist leave applications:", e);
    }
  },

  async getLeaveApplications(filters = {}) {
    let apps = this.getStoredLeaveApplications();
    if (filters.studentId) {
      apps = apps.filter(a => a.studentId === filters.studentId);
    }
    if (filters.reviewLevel) {
      apps = apps.filter(a => a.reviewLevel === filters.reviewLevel);
    }
    if (filters.inchargeEmail) {
      apps = apps.filter(a => a.assignedInchargeEmail === filters.inchargeEmail);
    }
    if (filters.status && filters.status !== "all") {
      apps = apps.filter(a => a.status === filters.status);
    }
    return apps;
  },

  async applyForLeave(payload) {
    const apps = this.getStoredLeaveApplications();
    const newId = `LEV-2026-${String(apps.length + 1).padStart(3, "0")}`;
    const newApp = {
      id: newId,
      ...payload,
      appliedAt: "Just now",
      reviewedAt: null,
      reviewerRemarks: ""
    };
    apps.unshift(newApp);
    this.saveStoredLeaveApplications(apps);

    // Also trigger automated system notification
    if (payload.reviewLevel === "incharge") {
      await this.createNotification({
        title: `📝 Short Leave Request: ${payload.studentName} (${payload.rollNo})`,
        message: `${payload.studentName} has requested a ${payload.totalDays}-day short leave (${payload.startDate} to ${payload.endDate}) for: ${payload.reason}`,
        category: "Leave",
        targetRole: "faculty",
        priority: "medium"
      });
    } else {
      await this.createNotification({
        title: `⚖️ Executive Long Leave Sanction Request: ${payload.studentName} (${payload.rollNo})`,
        message: `${payload.studentName} has submitted a ${payload.totalDays}-day long leave application (${payload.startDate} to ${payload.endDate}) requiring Principal approval. Reason: ${payload.reason}`,
        category: "Leave",
        targetRole: "principal",
        priority: "high"
      });
    }

    return { success: true, application: newApp };
  },

  async reviewLeaveApplication(leaveId, status, remarks = "", reviewerName = "Authority") {
    const apps = this.getStoredLeaveApplications();
    const idx = apps.findIndex(a => a.id === leaveId);
    if (idx !== -1) {
      apps[idx].status = status;
      apps[idx].reviewedAt = "Just now";
      apps[idx].reviewerRemarks = remarks || (status === "Approved" ? `Approved by ${reviewerName}. Absence excused.` : `Rejected by ${reviewerName}.`);
      this.saveStoredLeaveApplications(apps);

      // Notify student
      await this.createNotification({
        title: `Leave Application ${status}: ${apps[idx].id}`,
        message: `Your ${apps[idx].leaveType} (${apps[idx].startDate} to ${apps[idx].endDate}) has been ${status.toLowerCase()} by ${reviewerName}. Remarks: ${apps[idx].reviewerRemarks}`,
        category: "Leave",
        targetRole: "student",
        priority: status === "Approved" ? "medium" : "high"
      });

      return { success: true, application: apps[idx] };
    }
    return { success: false, message: "Application not found" };
  }
};

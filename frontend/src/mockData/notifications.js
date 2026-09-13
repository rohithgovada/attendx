export const NOTIFICATIONS_DATA = [
  {
    id: "NOTIF-01",
    title: "Low Attendance Warning: CS606 Lab",
    message: "Your attendance in Distributed Systems Lab has dropped to 68.0% (below university 75% threshold). Please consult Dr. Sarah Jenkins immediately to avoid debarment.",
    category: "Warning",
    timestamp: "2 hours ago",
    date: "2026-09-13",
    read: false,
    targetRole: "student",
    sender: "Academics Branch",
    priority: "high"
  },
  {
    id: "NOTIF-02",
    title: "Mid-Term Examination Schedule Released",
    message: "Mid-term theory examinations for 6th Semester will commence from October 5th. Hall tickets will be issued only to candidates having >=75% overall attendance.",
    category: "Circular",
    timestamp: "5 hours ago",
    date: "2026-09-13",
    read: false,
    targetRole: "all",
    sender: "Office of the Controller of Examinations",
    priority: "medium"
  },
  {
    id: "NOTIF-03",
    title: "Faculty Monthly Attendance Submission Due",
    message: "All faculty members are requested to lock and finalize monthly attendance registers for August by 5:00 PM tomorrow for principal review.",
    category: "Academic",
    timestamp: "1 day ago",
    date: "2026-09-12",
    read: true,
    targetRole: "faculty",
    sender: "Dr. Robert Vance, Principal",
    priority: "medium"
  },
  {
    id: "NOTIF-04",
    title: "Parent Alert: Ward Attendance Status",
    message: "Dear Parent, your ward Alex Morgan (Roll: CS2024-042) has an overall attendance of 81.3%. However, attendance in 2 subjects is below 75%. Please check the parent portal.",
    category: "Warning",
    timestamp: "1 day ago",
    date: "2026-09-12",
    read: false,
    targetRole: "parent",
    sender: "Dean of Student Welfare",
    priority: "high"
  },
  {
    id: "NOTIF-05",
    title: "National Tech Symposium 2026 Registrations",
    message: "Annual Inter-College Hackathon and Tech Symposium registrations are now open. Participating students will receive academic attendance credit.",
    category: "Circular",
    timestamp: "2 days ago",
    date: "2026-09-11",
    read: true,
    targetRole: "all",
    sender: "College Tech Council",
    priority: "low"
  },
  {
    id: "NOTIF-06",
    title: "Medical Leave Approved (CS2024-042)",
    message: "Medical leave for 2 days (Sept 3 - Sept 4) has been verified and excused in the system records by Dr. Sarah Jenkins.",
    category: "Leave",
    timestamp: "4 days ago",
    date: "2026-09-09",
    read: true,
    targetRole: "student",
    sender: "Class In-Charge",
    priority: "low"
  },
  {
    id: "NOTIF-07",
    title: "Institutional Attendance Summary Report Ready",
    message: "The comprehensive 1st-cycle attendance audit for all 5 engineering branches has been generated and is ready for Principal review.",
    category: "Academic",
    timestamp: "3 days ago",
    date: "2026-09-10",
    read: true,
    targetRole: "principal",
    sender: "ERP Academic Cell",
    priority: "medium"
  }
];

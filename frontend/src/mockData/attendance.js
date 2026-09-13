export const STUDENT_SUBJECT_ATTENDANCE = [
  {
    code: "CS601",
    name: "Advanced Database Systems",
    faculty: "Dr. Sarah Jenkins",
    conducted: 32,
    attended: 27,
    absent: 5,
    percentage: 84.4,
    minRequired: 75,
    margin: 3, // can miss 3 classes and remain >= 75%
    status: "Good",
    credits: 4
  },
  {
    code: "CS602",
    name: "Computer Networks & Security",
    faculty: "Prof. Alan Miller",
    conducted: 30,
    attended: 26,
    absent: 4,
    percentage: 86.7,
    minRequired: 75,
    margin: 4,
    status: "Good",
    credits: 4
  },
  {
    code: "CS603",
    name: "Machine Learning & AI",
    faculty: "Dr. Priya Sharma",
    conducted: 31,
    attended: 28,
    absent: 3,
    percentage: 90.3,
    minRequired: 75,
    margin: 6,
    status: "Good",
    credits: 3
  },
  {
    code: "CS604",
    name: "Cloud Computing & DevOps",
    faculty: "Prof. Marcus Cole",
    conducted: 29,
    attended: 21,
    absent: 8,
    percentage: 72.4,
    minRequired: 75,
    margin: -3, // Needs to attend next 3 classes to reach 75%
    status: "Warning",
    credits: 3
  },
  {
    code: "CS605",
    name: "Software Engineering & Agile",
    faculty: "Dr. Sarah Jenkins",
    conducted: 35,
    attended: 29,
    absent: 6,
    percentage: 82.9,
    minRequired: 75,
    margin: 3,
    status: "Good",
    credits: 3
  },
  {
    code: "CS606",
    name: "Distributed Systems Lab",
    faculty: "Dr. Sarah Jenkins",
    conducted: 25,
    attended: 17,
    absent: 8,
    percentage: 68.0,
    minRequired: 75,
    margin: -7, // Needs to attend next 7 lab classes to reach 75%
    status: "Critical",
    credits: 2
  }
];

export const STUDENT_TODAY_TIMETABLE = [
  {
    id: "TT-01",
    time: "09:00 AM - 10:00 AM",
    subjectCode: "CS601",
    subjectName: "Advanced Database Systems",
    room: "LH-204",
    faculty: "Dr. Sarah Jenkins",
    status: "Present",
    completed: true
  },
  {
    id: "TT-02",
    time: "10:00 AM - 11:00 AM",
    subjectCode: "CS602",
    subjectName: "Computer Networks & Security",
    room: "LH-204",
    faculty: "Prof. Alan Miller",
    status: "Present",
    completed: true
  },
  {
    id: "TT-03",
    time: "11:15 AM - 12:15 PM",
    subjectCode: "CS604",
    subjectName: "Cloud Computing & DevOps",
    room: "Lab-3",
    faculty: "Prof. Marcus Cole",
    status: "Absent",
    completed: true
  },
  {
    id: "TT-04",
    time: "01:00 PM - 02:00 PM",
    subjectCode: "CS605",
    subjectName: "Software Engineering & Agile",
    room: "LH-204",
    faculty: "Dr. Sarah Jenkins",
    status: "Upcoming",
    completed: false
  },
  {
    id: "TT-05",
    time: "02:00 PM - 04:00 PM",
    subjectCode: "CS606",
    subjectName: "Distributed Systems Lab",
    room: "Systems Lab 1",
    faculty: "Dr. Sarah Jenkins",
    status: "Upcoming",
    completed: false
  }
];

export const FACULTY_TODAY_SCHEDULE = [
  {
    id: "FS-01",
    time: "09:00 AM - 10:00 AM",
    subjectCode: "CS601",
    subjectName: "Advanced Database Systems",
    department: "CSE",
    semester: "6th Sem",
    section: "A",
    room: "LH-204",
    totalStudents: 20,
    marked: true,
    presentCount: 18,
    absentCount: 2
  },
  {
    id: "FS-02",
    time: "01:00 PM - 02:00 PM",
    subjectCode: "CS605",
    subjectName: "Software Engineering & Agile",
    department: "CSE",
    semester: "6th Sem",
    section: "A",
    room: "LH-204",
    totalStudents: 20,
    marked: false,
    presentCount: 0,
    absentCount: 0
  },
  {
    id: "FS-03",
    time: "02:00 PM - 04:00 PM",
    subjectCode: "CS606",
    subjectName: "Distributed Systems Lab",
    department: "CSE",
    semester: "6th Sem",
    section: "B",
    room: "Systems Lab 1",
    totalStudents: 18,
    marked: false,
    presentCount: 0,
    absentCount: 0
  }
];

export const ATTENDANCE_HISTORY_LOG = [
  { id: "LOG-01", date: "2026-09-12", time: "09:00 AM", subject: "CS601: Advanced Database Systems", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" },
  { id: "LOG-02", date: "2026-09-12", time: "10:00 AM", subject: "CS602: Computer Networks & Security", faculty: "Prof. Alan Miller", status: "Present", sessionType: "Lecture" },
  { id: "LOG-03", date: "2026-09-12", time: "11:15 AM", subject: "CS604: Cloud Computing & DevOps", faculty: "Prof. Marcus Cole", status: "Absent", sessionType: "Lab" },
  { id: "LOG-04", date: "2026-09-11", time: "09:00 AM", subject: "CS603: Machine Learning & AI", faculty: "Dr. Priya Sharma", status: "Present", sessionType: "Lecture" },
  { id: "LOG-05", date: "2026-09-11", time: "10:00 AM", subject: "CS605: Software Engineering", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" },
  { id: "LOG-06", date: "2026-09-11", time: "01:00 PM", subject: "CS606: Distributed Systems Lab", faculty: "Dr. Sarah Jenkins", status: "Absent", sessionType: "Lab" },
  { id: "LOG-07", date: "2026-09-10", time: "09:00 AM", subject: "CS601: Advanced Database Systems", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" },
  { id: "LOG-08", date: "2026-09-10", time: "10:00 AM", subject: "CS602: Computer Networks & Security", faculty: "Prof. Alan Miller", status: "Present", sessionType: "Lecture" },
  { id: "LOG-09", date: "2026-09-10", time: "11:15 AM", subject: "CS603: Machine Learning & AI", faculty: "Dr. Priya Sharma", status: "Late", sessionType: "Lecture" },
  { id: "LOG-10", date: "2026-09-09", time: "09:00 AM", subject: "CS604: Cloud Computing & DevOps", faculty: "Prof. Marcus Cole", status: "Absent", sessionType: "Lecture" },
  { id: "LOG-11", date: "2026-09-09", time: "10:00 AM", subject: "CS605: Software Engineering", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" },
  { id: "LOG-12", date: "2026-09-08", time: "09:00 AM", subject: "CS601: Advanced Database Systems", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" },
  { id: "LOG-13", date: "2026-09-08", time: "10:00 AM", subject: "CS602: Computer Networks & Security", faculty: "Prof. Alan Miller", status: "Present", sessionType: "Lecture" },
  { id: "LOG-14", date: "2026-09-08", time: "01:00 PM", subject: "CS606: Distributed Systems Lab", faculty: "Dr. Sarah Jenkins", status: "Absent", sessionType: "Lab" },
  { id: "LOG-15", date: "2026-09-07", time: "09:00 AM", subject: "CS603: Machine Learning & AI", faculty: "Dr. Priya Sharma", status: "Present", sessionType: "Lecture" },
  { id: "LOG-16", date: "2026-09-07", time: "10:00 AM", subject: "CS605: Software Engineering", faculty: "Dr. Sarah Jenkins", status: "Present", sessionType: "Lecture" }
];

export const INSTITUTION_DEPARTMENT_STATS = [
  { department: "Computer Science & Engineering", code: "CSE", totalStudents: 480, facultyCount: 24, avgAttendance: 84.8, defaulters: 28 },
  { department: "Information Technology", code: "IT", totalStudents: 360, facultyCount: 18, avgAttendance: 83.2, defaulters: 22 },
  { department: "Electronics & Communication", code: "ECE", totalStudents: 410, facultyCount: 20, avgAttendance: 81.5, defaulters: 34 },
  { department: "Mechanical Engineering", code: "ME", totalStudents: 340, facultyCount: 16, avgAttendance: 76.9, defaulters: 48 },
  { department: "Civil Engineering", code: "CE", totalStudents: 290, facultyCount: 14, avgAttendance: 79.4, defaulters: 26 }
];

// Mock user accounts for AttendX
export const DEMO_USERS = {
  student: {
    id: "STU202401",
    role: "student",
    name: "Alex Morgan",
    email: "alex.morgan@college.edu",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rollNo: "CS2024-042",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    section: "Section A",
    batch: "2022 - 2026",
    advisor: "Dr. Sarah Jenkins",
    parentName: "Mr. David Morgan",
    parentEmail: "david.morgan@gmail.com",
    parentPhone: "+1 (555) 876-5432",
    attendanceRate: 81.4
  },
  faculty: {
    id: "FAC104",
    role: "faculty",
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@college.edu",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-CS-104",
    department: "Computer Science & Engineering",
    designation: "Associate Professor & Class In-Charge",
    cabin: "Block B, Room 302",
    assignedSubjects: [
      { code: "CS601", name: "Advanced Database Systems", semester: "6th Sem", section: "A" },
      { code: "CS605", name: "Software Engineering & Agile", semester: "6th Sem", section: "A" },
      { code: "CS606", name: "Distributed Systems Lab", semester: "6th Sem", section: "B" }
    ],
    totalClassesConducted: 94
  },
  principal: {
    id: "PRN001",
    role: "principal",
    name: "Dr. Robert Vance",
    email: "robert.vance@college.edu",
    phone: "+1 (555) 987-6543",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    employeeId: "EMP-ADM-001",
    department: "College Administration",
    designation: "Principal & Dean of Academics",
    office: "Main Administration Block, Suite 101",
    institution: "St. Jude Institute of Technology",
    accreditation: "NAAC A++ Grade, NBA Accredited"
  },
  parent: {
    id: "PAR501",
    role: "parent",
    name: "Mr. David Morgan",
    email: "david.morgan@gmail.com",
    phone: "+1 (555) 876-5432",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    relation: "Father",
    occupation: "Senior Electrical Engineer",
    wardId: "STU202401",
    wardName: "Alex Morgan",
    wardRollNo: "CS2024-042",
    wardDepartment: "Computer Science & Engineering",
    wardSemester: "6th Semester - Sec A"
  }
};

export const adminNav = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "Student Management", href: "/admin/students" },
  { title: "Staff Management", href: "/admin/staff" },
  { title: "Class Management", href: "/admin/classes" },
  { title: "Reports", href: "/admin/reports" },
];

export const staffNav = [
  { title: "Dashboard", href: "/staff/dashboard" },
  { title: "Attendance", href: "/staff/attendance" },
];

export const studentNav = [
  { title: "Dashboard", href: "/student/dashboard" },
  { title: "Attendance", href: "/student/attendance" },
  { title: "Assignment", href: "/student/assignment" },
  {
    title: "Exam",
    items: [
      {
        title: "Admit Card",
        href: "/student/admit-card",
      },
      {
        title: "Result",
        href: "/student/results",
      },
      {
        title: "Supplementary Exam Fees",
        href: "/student/supplementary-exam-fees",
      },
      {
        title: "Convocation Registration",
        href: "/student/convocation-registration",
      },
    ],
  },
];

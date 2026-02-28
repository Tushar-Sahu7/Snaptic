// ─── Student profile ────────────────────────────────────────
export const STUDENT = {
  name:       "Arjun Sharma",
  firstName:  "Arjun",
  department: "Computer Science",
  year:       "Year 3",
  roll:       "CS2021065",
  avatar:     null, // set to image URL if available
  program:    "B.Tech",
  semester:   "Semester 6",
};

// ─── Today's stats ──────────────────────────────────────────
export const TODAY_STATS = {
  todayAttendance:   85,
  overallAttendance: 92,
  classesTotal:      4,
  classesCompleted:  2,
  streak:            7, // days
};

// ─── Today's schedule ───────────────────────────────────────
export const SCHEDULE = [
  {
    id: 1,
    time:    "09:00 AM",
    end:     "10:30 AM",
    subject: "Database Management",
    code:    "CS301",
    room:    "Room 301",
    teacher: "Prof. Mehta",
    status:  "present",   // present | absent | upcoming | ongoing
  },
  {
    id: 2,
    time:    "10:30 AM",
    end:     "12:00 PM",
    subject: "Computer Networks",
    code:    "CS302",
    room:    "Room 405",
    teacher: "Prof. Singh",
    status:  "present",
  },
  {
    id: 3,
    time:    "02:00 PM",
    end:     "03:30 PM",
    subject: "Operating Systems",
    code:    "CS303",
    room:    "Room 202",
    teacher: "Prof. Rao",
    status:  "upcoming",
  },
  {
    id: 4,
    time:    "03:30 PM",
    end:     "05:00 PM",
    subject: "Compiler Design",
    code:    "CS304",
    room:    "Lab 101",
    teacher: "Prof. Verma",
    status:  "upcoming",
  },
];

// ─── Notifications ──────────────────────────────────────────
export const NOTIFICATIONS = [
  {
    id: 1,
    type:    "success",
    title:   "Attendance Marked",
    message: "Your attendance was marked for Database Management at 9:00 AM.",
    time:    "2 min ago",
  },
  {
    id: 2,
    type:    "warning",
    title:   "Attendance Alert",
    message: "Your attendance is below 75% in Computer Networks. Please maintain regular attendance.",
    time:    "1 hour ago",
  },
  {
    id: 3,
    type:    "info",
    title:   "Class Rescheduled",
    message: "Compiler Design lab on Friday has been moved to Lab 102.",
    time:    "3 hours ago",
  },
];

// ─── Attendance history per subject ─────────────────────────
export const SUBJECT_ATTENDANCE = [
  { subject: "Database Management", code: "CS301", present: 22, total: 24, pct: 92 },
  { subject: "Computer Networks",   code: "CS302", present: 17, total: 24, pct: 71 },
  { subject: "Operating Systems",   code: "CS303", present: 20, total: 22, pct: 91 },
  { subject: "Compiler Design",     code: "CS304", present: 18, total: 20, pct: 90 },
  { subject: "Software Engineering",code: "CS305", present: 14, total: 16, pct: 88 },
];

// ─── Monthly attendance for mini chart ──────────────────────
export const MONTHLY_DATA = [
  { month: "Oct", pct: 88 },
  { month: "Nov", pct: 91 },
  { month: "Dec", pct: 78 },
  { month: "Jan", pct: 85 },
  { month: "Feb", pct: 92 },
  { month: "Mar", pct: 87 },
];

// ─── Leave history ──────────────────────────────────────────
export const LEAVE_HISTORY = [
  {
    id: 1,
    type:   "Medical Leave",
    from:   "Mar 20",
    to:     "Mar 22",
    days:   3,
    reason: "Fever and doctor's appointment",
    status: "pending",
  },
  {
    id: 2,
    type:   "Personal Leave",
    from:   "Mar 10",
    to:     "Mar 11",
    days:   2,
    reason: "Family event",
    status: "approved",
  },
  {
    id: 3,
    type:   "Medical Leave",
    from:   "Feb 14",
    to:     "Feb 14",
    days:   1,
    reason: "Dental appointment",
    status: "approved",
  },
  {
    id: 4,
    type:   "Personal Leave",
    from:   "Jan 28",
    to:     "Jan 29",
    days:   2,
    reason: "Travel",
    status: "rejected",
  },
];

// ─── Subjects (for leave form dropdown) ─────────────────────
export const SUBJECTS = [
  "Database Management",
  "Computer Networks",
  "Operating Systems",
  "Compiler Design",
  "Software Engineering",
  "All Subjects",
];
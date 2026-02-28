// ── Teacher profile ──────────────────────────────────────────
export const TEACHER = {
  name:       "Prof. Priya Anderson",
  firstName:  "Priya",
  department: "Computer Science Department",
  empId:      "EMP2018042",
  role:       "Associate Professor",
  avatar:     null,
};

// ── Today's classes ──────────────────────────────────────────
export const TODAY_CLASSES = [
  {
    id:       "c1",
    code:     "CS101",
    name:     "Intro to Programming",
    room:     "Room 301",
    time:     "09:00 AM",
    end:      "10:30 AM",
    students: 45,
    status:   "completed",   // completed | ongoing | upcoming
    attended: 41,
  },
  {
    id:       "c2",
    code:     "CS202",
    name:     "Data Structures",
    room:     "Room 405",
    time:     "11:00 AM",
    end:      "12:30 PM",
    students: 38,
    status:   "ongoing",
    attended: null,
  },
  {
    id:       "c3",
    code:     "CS303",
    name:     "Algorithm Design",
    room:     "Lab 102",
    time:     "02:00 PM",
    end:      "03:30 PM",
    students: 42,
    status:   "upcoming",
    attended: null,
  },
  {
    id:       "c4",
    code:     "CS404",
    name:     "Compiler Design",
    room:     "Room 210",
    time:     "04:00 PM",
    end:      "05:00 PM",
    students: 30,
    status:   "upcoming",
    attended: null,
  },
];

// ── Students per class ────────────────────────────────────────
export const CLASS_STUDENTS = {
  c2: [
    { id: "s01", name: "Arjun Sharma",    roll: "CS2021001", photo: null },
    { id: "s02", name: "Priya Mehta",     roll: "CS2021002", photo: null },
    { id: "s03", name: "Rahul Verma",     roll: "CS2021003", photo: null },
    { id: "s04", name: "Sneha Iyer",      roll: "CS2021004", photo: null },
    { id: "s05", name: "Karan Patel",     roll: "CS2021005", photo: null },
    { id: "s06", name: "Divya Singh",     roll: "CS2021006", photo: null },
    { id: "s07", name: "Ankit Joshi",     roll: "CS2021007", photo: null },
    { id: "s08", name: "Pooja Nair",      roll: "CS2021008", photo: null },
    { id: "s09", name: "Vikram Das",      roll: "CS2021009", photo: null },
    { id: "s10", name: "Meera Bose",      roll: "CS2021010", photo: null },
    { id: "s11", name: "Rohan Gupta",     roll: "CS2021011", photo: null },
    { id: "s12", name: "Asha Reddy",      roll: "CS2021012", photo: null },
    { id: "s13", name: "Nikhil Rao",      roll: "CS2021013", photo: null },
    { id: "s14", name: "Tanvi Kulkarni",  roll: "CS2021014", photo: null },
    { id: "s15", name: "Siddharth Roy",   roll: "CS2021015", photo: null },
    { id: "s16", name: "Kavya Menon",     roll: "CS2021016", photo: null },
    { id: "s17", name: "Aditya Kumar",    roll: "CS2021017", photo: null },
    { id: "s18", name: "Ishaan Trivedi",  roll: "CS2021018", photo: null },
    { id: "s19", name: "Riya Kapoor",     roll: "CS2021019", photo: null },
    { id: "s20", name: "Yash Desai",      roll: "CS2021020", photo: null },
    { id: "s21", name: "Shreya Pillai",   roll: "CS2021021", photo: null },
    { id: "s22", name: "Dev Saxena",      roll: "CS2021022", photo: null },
    { id: "s23", name: "Nisha Choudhary", roll: "CS2021023", photo: null },
    { id: "s24", name: "Aarav Mishra",    roll: "CS2021024", photo: null },
    { id: "s25", name: "Leena Shah",      roll: "CS2021025", photo: null },
    { id: "s26", name: "Harsh Agarwal",   roll: "CS2021026", photo: null },
    { id: "s27", name: "Anjali Tiwari",   roll: "CS2021027", photo: null },
    { id: "s28", name: "Manish Yadav",    roll: "CS2021028", photo: null },
    { id: "s29", name: "Swati Bhatt",     roll: "CS2021029", photo: null },
    { id: "s30", name: "Varun Jain",      roll: "CS2021030", photo: null },
    { id: "s31", name: "Poonam Wagh",     roll: "CS2021031", photo: null },
    { id: "s32", name: "Ayaan Sheikh",    roll: "CS2021032", photo: null },
    { id: "s33", name: "Shivani Pandey",  roll: "CS2021033", photo: null },
    { id: "s34", name: "Tarun Bansal",    roll: "CS2021034", photo: null },
    { id: "s35", name: "Nandini Gore",    roll: "CS2021035", photo: null },
    { id: "s36", name: "Sahil Mathur",    roll: "CS2021036", photo: null },
    { id: "s37", name: "Deepa Negi",      roll: "CS2021037", photo: null },
    { id: "s38", name: "Kunal Ahuja",     roll: "CS2021038", photo: null },
  ],
  c3: Array.from({ length: 42 }, (_, i) => ({
    id:    `s3${String(i + 1).padStart(2, "0")}`,
    name:  `Student ${i + 1}`,
    roll:  `CS2021${String(100 + i + 1)}`,
    photo: null,
  })),
  c4: Array.from({ length: 30 }, (_, i) => ({
    id:    `s4${String(i + 1).padStart(2, "0")}`,
    name:  `Student ${i + 1}`,
    roll:  `CS2022${String(i + 1).padStart(3, "0")}`,
    photo: null,
  })),
};

// ── Leave requests ────────────────────────────────────────────
export const LEAVE_REQUESTS = [
  { id: 1, student: "Sarah Johnson",  reason: "Medical",  time: "10 min ago", status: "pending"  },
  { id: 2, student: "Michael Chen",   reason: "Family",   time: "1 hour ago", status: "pending"  },
  { id: 3, student: "Emily Davis",    reason: "Academic", time: "2 hours ago",status: "reviewed" },
  { id: 4, student: "Rahul Verma",    reason: "Medical",  time: "3 hours ago",status: "approved" },
];

// ── Attendance overview (class-wise %) ───────────────────────
export const ATTENDANCE_OVERVIEW = [
  { classId: "c1", code: "CS101", name: "Intro to Programming", pct: 85, students: 45 },
  { classId: "c2", code: "CS202", name: "Data Structures",       pct: 92, students: 38 },
  { classId: "c3", code: "CS303", name: "Algorithm Design",      pct: 78, students: 42 },
  { classId: "c4", code: "CS404", name: "Compiler Design",       pct: 88, students: 30 },
];

// ── Weekly schedule ───────────────────────────────────────────
export const WEEKLY_SCHEDULE = {
  Mon: [
    { code:"CS101", name:"Intro to Programming", time:"09:00–10:30", room:"Room 301" },
    { code:"CS202", name:"Data Structures",       time:"11:00–12:30", room:"Room 405" },
  ],
  Tue: [
    { code:"CS303", name:"Algorithm Design",  time:"10:00–11:30", room:"Lab 102"   },
    { code:"CS404", name:"Compiler Design",   time:"02:00–03:00", room:"Room 210"  },
  ],
  Wed: [
    { code:"CS101", name:"Intro to Programming", time:"09:00–10:30", room:"Room 301" },
    { code:"CS303", name:"Algorithm Design",      time:"11:00–12:30", room:"Lab 102"  },
  ],
  Thu: [
    { code:"CS202", name:"Data Structures",   time:"11:00–12:30", room:"Room 405" },
    { code:"CS404", name:"Compiler Design",   time:"03:00–04:00", room:"Room 210" },
  ],
  Fri: [
    { code:"CS101", name:"Intro to Programming", time:"09:00–10:30", room:"Room 301" },
    { code:"CS202", name:"Data Structures",       time:"02:00–03:30", room:"Room 405" },
  ],
  Sat: [],
  Sun: [],
};

// ── AI insights ───────────────────────────────────────────────
export const AI_INSIGHTS = [
  { id:1, type:"warning", text:"Attendance dropping in Algorithm Design class — 5 students below 75%." },
  { id:2, type:"info",    text:"CS101 has the highest engagement streak this semester." },
  { id:3, type:"alert",   text:"Rahul Verma has missed 4 consecutive Data Structures classes." },
];
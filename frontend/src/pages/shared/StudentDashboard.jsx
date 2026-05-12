import { useMemo } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Clock,
  ArrowRight,
  Loader2,
  BookOpen,
  GraduationCap,
  ScanFace,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatIST, getNowIST, isClassInSession, parseSchedule } from "@/lib/date-utils";
import ClassCard from "@/components/shared/ClassCard";

// ─── constants ────────────────────────────────────────────────────────────────

const SESSION_LIVE_STATUSES = ["inprogress"];
const SESSION_UPCOMING_STATUSES = ["scheduled"];
const SESSION_DONE_STATUSES = ["submitted", "finalized", "missed"];

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = getNowIST().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Extract display fields from a session.
 * When classId is populated it's an object { _id, name, icon, status }.
 */
function resolveSession(s) {
  const classObj = typeof s.classId === "object" ? s.classId : null;
  return {
    ...s,
    _classId: classObj?._id || s.classId,
    className: classObj?.name || "Unnamed Class",
    classColor: classObj?.color || s.classColor || "var(--color-primary)",
  };
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconColor, loading }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-muted/60 shrink-0", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight truncate">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              value
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── session row (read-only for students) ─────────────────────────────────────

function SessionRow({ session }) {
  const s = resolveSession(session);

  const statusLabel =
    {
      inprogress: "Live",
      scheduled: "Upcoming",
      submitted: "Submitted",
      finalized: "Finalized",
      missed: "Missed",
    }[s.status] ?? s.status;

  const statusClass =
    {
      inprogress: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      scheduled: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      finalized: "bg-blue-700/10 text-blue-700 border-blue-700/20",
      missed: "bg-red-500/10 text-red-600 border-red-500/20",
    }[s.status] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/40 transition-all duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-1 h-8 rounded-full shrink-0 opacity-70"
          style={{ backgroundColor: s.classColor }}
        />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{s.className}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 opacity-50" />
            {formatIST(s.startTime, "hh:mm a")}
            {s.location && ` · ${s.location}`}
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5",
          statusClass
        )}
      >
        {statusLabel}
      </Badge>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

/**
 * StudentDashboard
 *
 * Data sources:
 * - `user`    — from AuthContext (includes classCount, faceEnrolled)
 * - `classes` — from useClasses() (returns enrolled classes for students)
 * - `sessions` is NOT used because /api/attendance/today is teacher-only.
 *   Instead we derive today's schedule from each class's RRULE via the
 *   ClassCard component + useClasses data.
 *
 * The student dashboard does NOT have live session feeds because
 * the teacher marks attendance, not the student. Instead it shows:
 * 1. Enrollment & Face ID status
 * 2. Overall attendance percentage (from class data)
 * 3. Enrolled classes via ClassCard
 * 4. Quick navigation to profile, classes, face enrollment
 */
export default function StudentDashboard({
  user,
  classes,
  loading,
  navigate,
}) {
  const enrolledClasses = useMemo(() => {
    const importDateUtils = async () => {
      // Note: isClassInSession and parseSchedule are already imported from @/lib/date-utils
    };

    return (classes || [])
      .filter((c) => c.status === "active")
      .map((c) => ({
        ...c,
        _parsedSchedule: parseSchedule(c.schedule),
      }))
      .sort((a, b) => {
        const { onTime: onTimeA } = isClassInSession(a);
        const { onTime: onTimeB } = isClassInSession(b);

        const getPriority = (c, onTime) => {
          if (onTime) return 3;
          const now = getNowIST();
          const currentDay = (now.getDay() + 6) % 7;
          if (c._parsedSchedule?.daysOfWeek?.includes(currentDay)) return 2;
          return 1;
        };

        const prioA = getPriority(a, onTimeA);
        const prioB = getPriority(b, onTimeB);

        if (prioA !== prioB) return prioB - prioA;

        // Tie-break: Start Time
        const timeA = a._parsedSchedule?.startTime || "99:99";
        const timeB = b._parsedSchedule?.startTime || "99:99";
        if (timeA !== timeB) return timeA.localeCompare(timeB);

        return (a.name || "").localeCompare(b.name || "");
      });
  }, [classes]);

  const enrolledCount = enrolledClasses.length;

  // Compute overall student attendance % from class-level attendancePercentage
  const attendancePct = useMemo(() => {
    const withData = enrolledClasses.filter(
      (c) => c.attendancePercentage !== undefined && c.attendancePercentage !== null
    );
    if (withData.length === 0) return null;
    const avg =
      withData.reduce((sum, c) => sum + (c.attendancePercentage || 0), 0) /
      withData.length;
    return Math.round(avg);
  }, [enrolledClasses]);

  const attendanceColor =
    attendancePct === null
      ? "text-muted-foreground"
      : attendancePct >= 85
        ? "text-emerald-600"
        : attendancePct >= 75
          ? "text-amber-600"
          : "text-red-600";

  const attendanceIconColor =
    attendancePct === null
      ? "text-muted-foreground"
      : attendancePct >= 85
        ? "text-emerald-500"
        : attendancePct >= 75
          ? "text-amber-500"
          : "text-red-500";

  const todayDateStr = format(getNowIST(), "EEEE, MMMM d");
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  // Preview classes (first 4)
  const previewClasses = enrolledClasses.slice(0, 4);

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {todayDateStr}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name?.split(" ")[0] ?? "Student"} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            {enrolledCount > 0
              ? `Enrolled in ${enrolledCount} class${enrolledCount > 1 ? "es" : ""}`
              : "You are not enrolled in any classes yet"}
          </p>
        </div>

        {/* Avatar with face status */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 w-fit">
          <div className="relative">
            <Avatar className="h-12 w-12">
              {user?.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 border-background",
                user?.faceEnrolled ? "bg-emerald-500" : "bg-amber-500"
              )}
            >
              {user?.faceEnrolled ? (
                <ScanFace className="w-3 h-3 text-white" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">
              {user?.name || "Student"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.faceEnrolled ? "Face ID ready" : "Face ID not set up"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Face Enrollment Alert ── */}
      {!user?.faceEnrolled && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-amber-700 dark:text-amber-400">
              Face ID not enrolled
            </p>
            <p className="text-xs text-muted-foreground">
              Your teacher needs to scan your face to mark attendance. Enroll
              now to get started.
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => navigate("/student/face-enrollment")}
          >
            Enroll Now
          </Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Enrolled Classes"
          value={enrolledCount}
          icon={BookOpen}
          iconColor="text-primary"
          loading={loading}
        />
        <StatCard
          label="My Attendance"
          value={
            attendancePct !== null ? (
              <span className={attendanceColor}>{attendancePct}%</span>
            ) : (
              "—"
            )
          }
          icon={GraduationCap}
          iconColor={attendanceIconColor}
          loading={loading}
        />
        <StatCard
          label="Face ID Status"
          value={user?.faceEnrolled ? "Active" : "Not Set"}
          icon={ScanFace}
          iconColor={user?.faceEnrolled ? "text-emerald-500" : "text-amber-500"}
          loading={loading}
        />
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Enrolled classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg tracking-tight">My Classes</h2>
              <p className="text-sm text-muted-foreground">
                Classes you are enrolled in
              </p>
            </div>
            {enrolledClasses.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 font-semibold"
                onClick={() => navigate("/student/classes")}
              >
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : previewClasses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {previewClasses.map((cls) => (
                <ClassCard
                  key={cls._id}
                  cls={cls}
                  onClick={(id) => navigate(`/student/classes/${id}`)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm">
              <CardContent className="py-16 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  No classes yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Your teacher will enroll you into classes. Check back soon!
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Quick nav */}
        <Card className="lg:col-span-1 h-fit border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Space</CardTitle>
            <CardDescription>Quick navigation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              {
                label: "My Classes",
                icon: BookOpen,
                onClick: () => navigate("/student/classes"),
                primary: true,
              },
              {
                label: "Face ID",
                icon: ScanFace,
                onClick: () => navigate("/student/face-enrollment"),
              },
              {
                label: "Profile Settings",
                icon: Settings,
                onClick: () => navigate("/student/profile"),
              },
            ].map(({ label, icon: Icon, onClick, primary }) => (
              <Button
                key={label}
                variant={primary ? "default" : "outline"}
                className="w-full h-11 justify-between group px-4"
                onClick={onClick}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-all" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── At-Risk Alert (if attendance < 75%) ── */}
      {attendancePct !== null && attendancePct < 75 && (
        <Card className="border-red-500/20 bg-red-500/5 shadow-sm">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-red-500/10 shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-600 dark:text-red-400">
                Attendance Alert
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your overall attendance is at{" "}
                <span className="font-bold text-red-600">{attendancePct}%</span>,
                which is below the recommended 75% threshold. Regular attendance
                is important — reach out to your teacher if you need help.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

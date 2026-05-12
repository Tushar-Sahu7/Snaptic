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
  Users,
  Clock,
  Plus,
  ArrowRight,
  Loader2,
  UserCheck,
  CalendarDays,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  ScanFace,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    classIcon: classObj?.icon || "BookOpen",
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

// ─── session row ──────────────────────────────────────────────────────────────

function SessionRow({ session, navigate }) {
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

  const isClickable =
    SESSION_LIVE_STATUSES.includes(s.status) ||
    SESSION_UPCOMING_STATUSES.includes(s.status);

  const handleClick = () => {
    if (!isClickable) return;
    if (SESSION_LIVE_STATUSES.includes(s.status)) {
      navigate(`/teacher/classes/${s._classId}/attendance`);
    } else {
      navigate(`/teacher/take-attendance?classId=${s._classId}`);
    }
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-border/50",
        "bg-card/40 transition-all duration-200",
        isClickable &&
          "hover:bg-muted/30 hover:border-foreground/10 cursor-pointer group"
      )}
    >
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
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5",
            statusClass
          )}
        >
          {statusLabel}
        </Badge>
        {isClickable && (
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function TeacherDashboard({
  user,
  classes,
  sessions,
  loading,
  navigate,
}) {
  const activeClasses = useMemo(() => {
    return classes
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
          const hasToday = c._parsedSchedule?.daysOfWeek?.includes(currentDay);

          if (hasToday) return 2;
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

  const totalStudents = useMemo(
    () => activeClasses.reduce((a, c) => a + (c.studentCount || 0), 0),
    [activeClasses]
  );

  const liveSessions = useMemo(
    () =>
      sessions
        .filter((s) => SESSION_LIVE_STATUSES.includes(s.status))
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    [sessions]
  );
  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((s) => SESSION_UPCOMING_STATUSES.includes(s.status))
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    [sessions]
  );
  const doneSessions = useMemo(
    () =>
      sessions
        .filter((s) => SESSION_DONE_STATUSES.includes(s.status))
        .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || "")),
    [sessions]
  );

  const liveAndUpcoming = [...liveSessions, ...upcomingSessions];
  const todayDateStr = format(getNowIST(), "EEEE, MMMM d");

  // Top 3 active classes for ClassCard preview
  const previewClasses = activeClasses.slice(0, 3);

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {todayDateStr}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "Teacher"} 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          {liveSessions.length > 0
            ? `You have ${liveSessions.length} live session${liveSessions.length > 1 ? "s" : ""} right now.`
            : upcomingSessions.length > 0
              ? `${upcomingSessions.length} session${upcomingSessions.length > 1 ? "s" : ""} coming up today.`
              : "No sessions scheduled for today."}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Classes"
          value={activeClasses.length}
          icon={LayoutDashboard}
          iconColor="text-primary"
          loading={loading}
        />
        <StatCard
          label="Total Students"
          value={totalStudents}
          icon={Users}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatCard
          label="Sessions Today"
          value={sessions.length}
          icon={Calendar}
          iconColor="text-violet-500"
          loading={loading}
        />
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions */}
        <Card className="lg:col-span-1 h-fit border-border/60 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks at a glance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              {
                label: "Take Attendance",
                icon: UserCheck,
                onClick: () => navigate("/teacher/take-attendance"),
                primary: true,
              },
              {
                label: "Create New Class",
                icon: Plus,
                onClick: () => navigate("/teacher/classes"),
              },
              {
                label: "View Records",
                icon: ClipboardList,
                onClick: () => navigate("/teacher/classes"),
              },
              {
                label: "Face Enrollment",
                icon: ScanFace,
                onClick: () => navigate("/teacher/face-enrollment"),
              },
              {
                label: "Profile Settings",
                icon: Settings,
                onClick: () => navigate("/teacher/profile"),
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
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Right: Sessions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Live + Upcoming */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Live &amp; Upcoming Today
                </CardTitle>
                <CardDescription>
                  Sessions you need to action
                </CardDescription>
              </div>
              {liveAndUpcoming.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[9px] font-bold uppercase tracking-widest"
                >
                  {liveAndUpcoming.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : liveAndUpcoming.length > 0 ? (
                <div className="space-y-2">
                  {liveAndUpcoming.map((s) => (
                    <SessionRow
                      key={s._id}
                      session={s}
                      navigate={navigate}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2">
                  <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No live or upcoming sessions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Done sessions today */}
          {doneSessions.length > 0 && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Completed Today</CardTitle>
                <CardDescription>
                  Sessions that have already run
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {doneSessions.map((s) => (
                    <SessionRow
                      key={s._id}
                      session={s}
                      navigate={navigate}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── My Classes preview (ClassCards) ── */}
      {previewClasses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg tracking-tight">My Classes</h2>
              <p className="text-sm text-muted-foreground">
                Your active classes at a glance
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 font-semibold"
              onClick={() => navigate("/teacher/classes")}
            >
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewClasses.map((cls) => (
              <ClassCard
                key={cls._id}
                cls={cls}
                onClick={(id) => navigate(`/teacher/classes/${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

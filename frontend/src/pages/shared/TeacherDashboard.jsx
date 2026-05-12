import { useMemo, useState } from "react";
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
  MapPin,
  Radio,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";
import { formatIST, getNowIST, isClassInSession, parseSchedule } from "@/lib/date-utils";
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import ClassFormDialog from "@/features/classes/components/ClassFormDialog";

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
    location: s.location || classObj?.location || "",
    duration: classObj?.schedule?.duration || s.duration || 60,
  };
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconColor, loading, className }) {
  return (
    <Card className={cn("border-border/60 shadow-sm overflow-hidden group", className)}>
      <CardContent className="p-6 flex flex-col justify-between h-full relative">
        <div className={cn("p-3 rounded-2xl bg-muted/60 w-fit transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight mt-1">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              value
            )}
          </p>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-muted/20 rounded-full blur-2xl group-hover:bg-muted/40 transition-colors" />
      </CardContent>
    </Card>
  );
}

// ─── session row ──────────────────────────────────────────────────────────────

function SessionRow({ session, navigate, showRecordBtn }) {
  const s = resolveSession(session);
  const now = getNowIST();

  // Timing logic
  const start = new Date(s.startTime);
  const end = s.endTime ? new Date(s.endTime) : new Date(start.getTime() + s.duration * 60000);
  const isWithinTime = now >= start && now <= end;
  const isLive = isWithinTime || SESSION_LIVE_STATUSES.includes(s.status);

  const statusLabel = isLive ? "Live" :
    {
      scheduled: "Upcoming",
      submitted: "Submitted",
      finalized: "Finalized",
      missed: "Missed",
    }[s.status] ?? s.status;

  const statusClass = isLive
    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    : {
      scheduled: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      submitted: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      finalized: "bg-blue-700/10 text-blue-700 border-blue-700/20",
      missed: "bg-red-500/10 text-red-600 border-red-500/20",
    }[s.status] ?? "bg-muted text-muted-foreground border-border";

  const isClickable = isLive;

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
        "flex items-center justify-between p-4 rounded-2xl border border-border/50",
        "bg-card/40 transition-all duration-300",
        isClickable
          ? "hover:bg-muted/30 hover:border-foreground/10 cursor-pointer group shadow-sm hover:shadow-md"
          : "opacity-80"
      )}
    >
      <div className="flex items-center gap-4 min-w-0">
        <div
          className="w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden transition-transform duration-500 group-hover:rotate-3 group-hover:scale-105"
          style={{
            backgroundColor: `color-mix(in oklch, ${s.classColor}, transparent 88%)`,
            color: s.classColor,
            border: `1px solid color-mix(in oklch, ${s.classColor}, transparent 80%)`,
          }}
        >
          <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px]" />
          <LucideIcon name={s.classIcon} size={22} className="relative z-10" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-bold text-sm tracking-tight truncate text-foreground/90">{s.className}</p>
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 opacity-50" />
              <span>{formatIST(s.startTime, "hh:mm a")} - {formatIST(end, "hh:mm a")}</span>
            </div>
            <span className="opacity-30 select-none">•</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3 h-3 opacity-50" />
              <span className="truncate">
                {s.location || "Online"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {showRecordBtn ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl h-9 px-4 text-xs font-bold bg-background/50 hover:bg-background border-border/60 hover:border-foreground/20 transition-all shadow-sm active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/classes/${s._classId}?tab=records`);
            }}
          >
            View Record
          </Button>
        ) : (
          <>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1",
                statusClass,
                isLive && "shadow-lg shadow-emerald-500/10"
              )}
            >
              {isLive && <Radio className="w-3 h-3 mr-1.5 animate-pulse" />}
              {statusLabel}
            </Badge>
            {isClickable && (
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-4 h-4 text-foreground/70" />
              </div>
            )}
          </>
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
  refresh,
}) {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
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

  const featuredClass = useMemo(() => {
    if (loading || activeClasses.length === 0) return null;
    return activeClasses.find((c) => {
      const { onTime } = isClassInSession(c);
      if (onTime) return true;

      const now = getNowIST();
      const currentDay = (now.getDay() + 6) % 7;
      return c._parsedSchedule?.daysOfWeek?.includes(currentDay);
    });
  }, [activeClasses, loading]);

  const sessionMap = useMemo(() => {
    return sessions.reduce((acc, s) => {
      acc[s.classId?._id || s.classId] = s;
      return acc;
    }, {});
  }, [sessions]);

  const activeSessions = useMemo(() => {
    return sessions
      .filter((s) =>
        [...SESSION_LIVE_STATUSES, ...SESSION_UPCOMING_STATUSES].includes(s.status)
      )
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [sessions]);

  const completedSessions = useMemo(() => {
    return sessions
      .filter((s) => SESSION_DONE_STATUSES.includes(s.status))
      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  }, [sessions]);

  const totalStudents = useMemo(
    () => activeClasses.reduce((a, c) => a + (c.studentCount || 0), 0),
    [activeClasses]
  );

  const todayDateStr = format(getNowIST(), "EEEE, MMMM d");
  const liveCount = sessions.filter(s => SESSION_LIVE_STATUSES.includes(s.status)).length;
  const upcomingCount = sessions.filter(s => SESSION_UPCOMING_STATUSES.includes(s.status)).length;

  // Top 3 active classes for ClassCard preview (excluding featured)
  const previewClasses = activeClasses
    .filter(c => c._id !== featuredClass?._id)
    .slice(0, 3);

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 px-1">
          {todayDateStr}
        </p>
        <h1 className="text-4xl font-bold tracking-tight mt-1">
          {getGreeting()}, {user?.name?.split(" ")[0] ?? "Teacher"} 👋
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          {liveCount > 0
            ? `You have ${liveCount} live session${liveCount > 1 ? "s" : ""} right now.`
            : upcomingCount > 0
              ? `${upcomingCount} session${upcomingCount > 1 ? "s" : ""} coming up today.`
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

      {/* ── Featured Session ── */}
      {featuredClass && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 whitespace-nowrap">
              Featured Session
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 group">
              <ClassCard
                cls={featuredClass}
                onClick={(id) => navigate(`/teacher/classes/${id}`)}
                className="h-full border-primary/20 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-700"
                footer={
                  <AttendanceActionGroup
                    cls={featuredClass}
                    session={sessionMap[featuredClass._id]}
                    className="w-full"
                  />
                }
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 rounded-[2.5rem] bg-linear-to-br from-primary/3 to-primary/1 border border-primary/5 p-8 flex flex-col justify-center gap-6 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    Today's Focus
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    This session is prioritized for today. You can quickly track attendance or manage student lists directly.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                        <Users size={12} className="text-muted-foreground/50" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ready for tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upcoming Sessions (8/12 width) */}
        <Card className="lg:col-span-8 border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Sessions</CardTitle>
              <CardDescription>Scheduled for today</CardDescription>
            </div>
            {activeSessions.length > 0 && (
              <Badge variant="secondary" className="rounded-full text-[10px] font-black tracking-widest px-2.5">
                {activeSessions.length}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeSessions.length > 0 ? (
              <ScrollArea className="h-[380px] px-6 pb-6">
                <div className="space-y-3 pt-2">
                  {activeSessions.map((s) => (
                    <SessionRow key={s._id} session={s} navigate={navigate} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="py-20 text-center space-y-3">
                <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/30" />
                <p className="text-sm font-bold text-muted-foreground">
                  No upcoming sessions today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (4/12 width) */}
        <Card className="lg:col-span-4 h-fit border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
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
                onClick: () => setFormDialogOpen(true),
              },
              {
                label: "My Classes",
                icon: BookOpen,
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
                className={cn(
                  "w-full h-12 justify-between group px-4 rounded-xl font-bold transition-all",
                  !primary && "hover:bg-muted"
                )}
                onClick={onClick}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Completed Sessions Today (Full or Wide) */}
        {completedSessions.length > 0 && (
          <Card className="lg:col-span-12 border-border/60 shadow-sm flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Completed Today</CardTitle>
                <CardDescription>Sessions that have already done</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] font-black tracking-widest px-2.5 opacity-50">
                {completedSessions.length}
              </Badge>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedSessions.map((s) => (
                  <SessionRow key={s._id} session={s} navigate={navigate} showRecordBtn />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── My Classes Section ── */}

      {/* ── My Classes Section ── */}
      {previewClasses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">My Classes</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Manage your active classes
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl h-10 px-4 gap-2 font-bold hover:bg-muted"
              onClick={() => navigate("/teacher/classes")}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <ClassFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={(newClass) => {
          refresh?.();
          if (newClass?._id) {
            navigate(`/teacher/classes/${newClass._id}`);
          }
        }}
      />
    </div>
  );
}

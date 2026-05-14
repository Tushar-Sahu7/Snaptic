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
  MapPin,
  CalendarDays,
  Radio,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import { cn } from "@/lib/utils";
import { formatIST, getNowIST, isClassInSession, parseSchedule } from "@/lib/date-utils";
import ClassCard from "@/components/shared/ClassCard";
import ClassCardSkeleton from "@/components/shared/ClassCardSkeleton";
import SessionRowSkeleton from "@/components/shared/SessionRowSkeleton";
import DashboardSkeleton from "@/components/shared/DashboardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

// ─── constants ────────────────────────────────────────────────────────────────

const SESSION_LIVE_STATUSES = ["inprogress"];
const SESSION_UPCOMING_STATUSES = ["scheduled"];
const SESSION_DONE_STATUSES = ["submitted", "finalized"];

// ─── helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = getNowIST().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Extract display fields from a session.
 */
function resolveSession(s) {
  const classObj = typeof s.classId === "object" ? s.classId : null;
  return {
    ...s,
    _classId: classObj?._id || s.classId,
    className: classObj?.name || s.className || "Unnamed Class",
    classColor: classObj?.color || s.classColor || "var(--color-primary)",
    classIcon: classObj?.icon || s.classIcon || "BookOpen",
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
          <div className="text-3xl font-bold tracking-tight mt-1 flex items-baseline gap-1">
            {loading ? (
              <Skeleton className="w-12 h-8" />
            ) : (
              value
            )}
          </div>
        </div>
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

  // Attendance logic for students
  const attendance = s.attendance; // From backend update
  const isPresent = attendance?.status === "present";
  const isAbsent = attendance?.status === "absent";

  return (
    <div 
      onClick={() => navigate?.(`/student/classes/${s._classId}`)}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl border border-border/50",
        "bg-card/40 transition-all duration-300 hover:bg-muted/30 hover:border-foreground/10 cursor-pointer group shadow-sm hover:shadow-md"
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
              <span className="truncate">{s.location || "Online"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {showRecordBtn ? (
          <div className="flex items-center gap-3">
             {attendance ? (
              <Badge 
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1",
                  isPresent 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                )}
                variant="outline"
              >
                {isPresent ? "Present" : "Absent"}
              </Badge>
            ) : (
              <Badge 
                variant="outline" 
                className="text-[9px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1 bg-red-500/10 text-red-600 border-red-500/20"
              >
                Absent
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl h-9 px-4 text-xs font-bold bg-background/50 hover:bg-background border-border/60 hover:border-foreground/20 transition-all shadow-sm active:scale-95 hidden md:flex"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/student/classes/${s._classId}?tab=records`);
              }}
            >
              View Record
            </Button>
          </div>
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
            <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4 text-foreground/70" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function StudentDashboard({
  user,
  classes,
  sessions = [],
  loading,
  navigate,
}) {
  const now = getNowIST();
  const currentDay = (now.getDay() + 6) % 7; // 0=Mon, 6=Sun

  const enrolledClasses = useMemo(() => {
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
  }, [classes, currentDay]);

  // Merge real sessions with derived ones for a complete "Today's Schedule"
  const sessionsToday = useMemo(() => {
    const realSessions = sessions.map(s => resolveSession(s));
    const realClassIds = new Set(realSessions.map(s => s._classId));

    const derived = enrolledClasses
      .filter(c => c._parsedSchedule?.daysOfWeek?.includes(currentDay))
      .filter(c => !realClassIds.has(c._id))
      .map(c => {
        const [hours, minutes] = c._parsedSchedule.startTime.split(":").map(Number);
        const startTime = new Date(now);
        startTime.setHours(hours, minutes, 0, 0);
        
        return {
          _id: `derived-${c._id}`,
          classId: c,
          _classId: c._id,
          className: c.name,
          classColor: c.color,
          classIcon: c.icon,
          startTime: startTime.toISOString(),
          location: c.location,
          status: "scheduled",
          duration: c._parsedSchedule.duration || 60
        };
      });

    return [...realSessions, ...derived].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions, enrolledClasses, currentDay, now]);

  const activeSessions = useMemo(() => {
    return sessionsToday.filter(s => 
      [...SESSION_LIVE_STATUSES, ...SESSION_UPCOMING_STATUSES].includes(s.status)
    );
  }, [sessionsToday]);

  const completedSessions = useMemo(() => {
    return sessionsToday.filter(s => 
      SESSION_DONE_STATUSES.includes(s.status)
    );
  }, [sessionsToday]);

  const featuredClass = useMemo(() => {
    if (loading || enrolledClasses.length === 0) return null;
    return enrolledClasses.find((c) => {
      const { onTime } = isClassInSession(c);
      if (onTime) return true;
      return c._parsedSchedule?.daysOfWeek?.includes(currentDay);
    });
  }, [enrolledClasses, loading, currentDay]);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const todayDateStr = format(now, "EEEE, MMMM d");
  
  const liveCount = sessionsToday.filter(s => SESSION_LIVE_STATUSES.includes(s.status)).length;
  const upcomingCount = sessionsToday.filter(s => s.status === "scheduled").length;

  // Top 3 active classes for preview
  const previewClasses = enrolledClasses
    .filter(c => c._id !== featuredClass?._id)
    .slice(0, 3);

  // Attendance summary is no longer needed in view
  const isFaceReady = user?.faceEnrolled;

  if (loading && !enrolledClasses.length) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-7xl space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 px-1">
            {todayDateStr}
          </p>
          <h1 className="text-4xl font-bold tracking-tight mt-1">
            {getGreeting()}, {user?.name?.split(" ")[0] ?? "Student"} 👋
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {liveCount > 0 
              ? `You have ${liveCount} live class${liveCount > 1 ? "es" : ""} right now!` 
              : upcomingCount > 0 
                ? `You have ${upcomingCount} class${upcomingCount > 1 ? "es" : ""} scheduled for today.`
                : "No classes scheduled for today."}
          </p>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-4 p-4 rounded-[2rem] bg-muted/30 border border-border/50 backdrop-blur-sm group hover:bg-muted/50 transition-all duration-500">
          <div className="relative">
            <Avatar className="h-14 w-14 border-2 border-background shadow-lg transition-transform duration-500 group-hover:scale-105">
              {user?.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-background shadow-sm",
              user?.faceEnrolled ? "bg-emerald-500" : "bg-amber-500"
            )}>
              {user?.faceEnrolled ? <CheckCircle2 className="w-3 h-3 text-white" /> : <AlertTriangle className="w-3 h-3 text-white" />}
            </div>
          </div>
          <div className="pr-4">
            <p className="font-bold text-base leading-tight tracking-tight">
              {user?.name || "Student"}
            </p>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mt-1",
              user?.faceEnrolled ? "text-emerald-600" : "text-amber-600"
            )}>
              {user?.faceEnrolled ? "Face ID Ready" : "Face ID Missing"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {!user?.faceEnrolled && (
        <div className="flex items-center gap-5 p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 shadow-xl shadow-amber-500/5 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <ScanFace className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-amber-900 dark:text-amber-400">
              Action Required: Enroll Face ID
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Your Face ID is needed for biometric attendance. Please enroll now to avoid being marked absent.
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl px-5 font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            onClick={() => navigate("/student/face-enrollment")}
          >
            Enroll Now
          </Button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="My Classes"
          value={enrolledClasses.length}
          icon={BookOpen}
          iconColor="text-primary"
          loading={loading}
        />
        <StatCard
          label="Sessions Today"
          value={sessionsToday.length}
          icon={CalendarDays}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatCard
          label="Face Status"
          value={isFaceReady ? "Ready" : "Missing"}
          icon={ScanFace}
          iconColor={isFaceReady ? "text-emerald-500" : "text-amber-500"}
          loading={loading}
        />
      </div>

      {/* ── Featured Session ── */}
      {featuredClass && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 whitespace-nowrap">
              Your Next Class
            </h2>
            <div className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <ClassCard
                cls={featuredClass}
                onClick={(id) => navigate(`/student/classes/${id}`)}
                hideAttendance={true}
                className="h-full border-primary/20 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-700"
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex-1 rounded-[2.5rem] bg-linear-to-br from-primary/3 to-primary/1 border border-primary/5 p-8 flex flex-col justify-center gap-6 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">
                    Learning Focus
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {isClassInSession(featuredClass).onTime 
                      ? "This class is live! Head over to the classroom and make sure you're ready for attendance."
                      : "Stay on track! Check your materials and be on time for your next scheduled session today."}
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full text-[9px] font-black tracking-widest px-3 py-1">
                    {user?.faceEnrolled ? "READY FOR SCAN" : "ENROLLMENT NEEDED"}
                  </Badge>
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
            {loading && activeSessions.length === 0 ? (
                <div className="space-y-3 px-6 pt-2 pb-6">
                  {[1, 2, 3].map((i) => <SessionRowSkeleton key={i} />)}
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
        <Card className="lg:col-span-4 border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            <CardDescription>Common tasks at a glance</CardDescription>
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
                label: "Face Enrollment",
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

        {/* Completed Today (Full or Wide) */}
        {completedSessions.length > 0 && (
          <Card className="lg:col-span-12 border-border/60 shadow-sm flex flex-col">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Today's Attendance</CardTitle>
                <CardDescription>Attendance for completed sessions</CardDescription>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] font-black tracking-widest px-2.5 opacity-50">
                {completedSessions.length}
              </Badge>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="space-y-3 pt-2">
                {loading && completedSessions.length === 0 ? (
                  [1, 2, 3].map((i) => <SessionRowSkeleton key={i} />)
                ) : (
                  completedSessions.map((s) => (
                    <SessionRow key={s._id} session={s} navigate={navigate} showRecordBtn />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── My Classes Section ── */}
      {previewClasses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">My Classes</h2>
              <p className="text-sm text-muted-foreground font-medium">
                Overview of your enrolled classes
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl h-10 px-4 gap-2 font-bold hover:bg-muted"
              onClick={() => navigate("/student/classes")}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewClasses.map((cls) => (
              <ClassCard
                key={cls._id}
                cls={cls}
                hideAttendance={true}
                onClick={(id) => navigate(`/student/classes/${id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

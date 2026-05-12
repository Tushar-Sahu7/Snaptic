import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Plus,
  Calendar,
  ArrowRight,
  Loader2,
  BookOpen,
  GraduationCap,
  Check,
  CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { formatTime } from "@/lib/date-utils";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const { classes, loading: classesLoading } = useClasses();
  const { todaySessions, isPending: sessionsLoading } = useTodayAttendance();

  const isLoading = classesLoading || sessionsLoading;

  // Teacher specific initials logic
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  // Stats calculation
  const stats = useMemo(() => {
    if (isTeacher) {
      const activeClasses = classes.filter(c => c.status === "active");
      const totalStudents = activeClasses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
      const sessionsTodayCount = Object.keys(todaySessions).length;

      // Calculate teacher attendance rate (average across all active classes)
      let attendanceRate = 0;
      let totalPresent = 0;
      let totalPossible = 0;
      activeClasses.forEach(cls => {
        if (cls.attendanceStats) {
          totalPresent += cls.attendanceStats.present || 0;
          totalPossible += cls.attendanceStats.total || 0;
        }
      });
      if (totalPossible > 0) {
        attendanceRate = Math.round((totalPresent / totalPossible) * 100);
      }

      return [
        { label: "Active Classes", value: activeClasses.length, icon: LayoutDashboard, color: "text-primary", bg: "bg-primary/10" },
        { label: "Total Students", value: totalStudents, icon: Users, color: "text-chart-1", bg: "bg-chart-1/10" },
        { label: "Attendance Rate", value: `${attendanceRate}%`, icon: TrendingUp, color: "text-chart-2", bg: "bg-chart-2/10" },
        { label: "Sessions Today", value: sessionsTodayCount, icon: Calendar, color: "text-chart-3", bg: "bg-chart-3/10" },
      ];
    } else {
      // Student Stats
      const enrolledClasses = user?.enrollments || [];
      const enrolledCount = enrolledClasses.length;
      // Calculate student attendance rate
      let studentAttendanceRate = 0;
      let attended = 0;
      let total = 0;
      enrolledClasses.forEach(cls => {
        if (cls.attendanceStats) {
          attended += cls.attendanceStats.present || 0;
          total += cls.attendanceStats.total || 0;
        }
      });
      if (total > 0) {
        studentAttendanceRate = Math.round((attended / total) * 100);
      }
      // Find next class (by soonest startTime today or future)
      let nextClass = null;
      let soonest = Infinity;
      enrolledClasses.forEach(cls => {
        if (cls.nextSession && cls.nextSession.startTime) {
          const start = new Date(cls.nextSession.startTime).getTime();
          if (start > Date.now() && start < soonest) {
            soonest = start;
            nextClass = cls;
          }
        }
      });
      let nextClassLabel = nextClass ? nextClass.name : "No upcoming class";
      let nextClassTime = nextClass && nextClass.nextSession ? formatTime(nextClass.nextSession.startTime) : "-";

      return [
        { label: "Enrolled Classes", value: enrolledCount, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
        { label: "Attendance Rate", value: `${studentAttendanceRate}%`, icon: GraduationCap, color: "text-chart-2", bg: "bg-chart-2/10" },
        { label: "Next Class", value: nextClassLabel, icon: Clock, color: "text-chart-3", bg: "bg-chart-3/10", subValue: nextClassTime },
      ];
    }
  }, [isTeacher, classes, todaySessions, user]);

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">
            Welcome back, {user?.name }
          </h1>
          <p className="text-muted-foreground text-base">
            {isTeacher 
              ? "Here's what's happening in your classes today." 
              : "Here's what's happening with your classes today."}
          </p>
        </div>

        {!isTeacher && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              {user?.faceEnrolled && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-background shadow-sm">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className={cn(
        "grid gap-6",
        isTeacher ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
      )}>
        {stats.map((stat, i) => (
          <Card key={i} className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm hover:shadow-md border-border/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl ring-1 ring-foreground/5", stat.bg, stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />}
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-semibold block tracking-tight">
                  {isLoading ? "..." : stat.value}
                </span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                {stat.subValue && <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Actions (Teacher) or Focus (Student) */}
        <Card className="lg:col-span-1 h-fit border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>{isTeacher ? "Quick Actions" : "Daily Focus"}</CardTitle>
            <CardDescription>
              {isTeacher ? "Common administrative tasks" : "Your schedule summary"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isTeacher ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-between group px-4 font-semibold hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => navigate("/teacher/schedule")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    Schedule Hub
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full h-12 justify-between group px-4 font-semibold hover:bg-primary/5 hover:border-primary/30 transition-all"
                  onClick={() => navigate("/teacher/classes")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
                      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    Create New Class
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Button>
              </>
            ) : (
              <div className="py-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Today's Schedule</p>
                    {isTeacher ? (
                      <p className="text-xs text-muted-foreground">{Object.keys(todaySessions).length} Sessions today</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">{user?.enrollments ? user.enrollments.length : 0} Classes remaining</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "Your dashboard is streamlined to focus on today's active sessions. Attendance history is available in the records section."
                </p>
                <Button 
                  className="w-full h-10 font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => navigate("/student/classes")}
                >
                  View My Classes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Column: Sessions Today */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Sessions Today</CardTitle>
              <CardDescription>
                {isTeacher ? "Live tracking of your upcoming classes" : "Your active and upcoming sessions"}
              </CardDescription>
            </div>
            {isTeacher && (
              <Badge variant="secondary" className="rounded-md font-bold uppercase text-[9px] tracking-widest px-2 py-0.5">
                {Object.keys(todaySessions).length} Total
              </Badge>
            )}
          </CardHeader>
          <CardContent>
             {Object.keys(todaySessions).length > 0 ? (
               <div className="space-y-3">
                  {Object.values(todaySessions).map((s) => (
                    <div 
                      key={s._id} 
                      className="group flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 hover:border-foreground/10 cursor-pointer transition-all duration-200"
                      onClick={() => {
                        const cId = typeof s.classId === 'object' ? s.classId._id : s.classId;
                        if (isTeacher) {
                          navigate(`/teacher/take-attendance?classId=${cId}&autoStart=true`);
                        } else {
                          navigate(`/student/classes/${cId}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-1 h-8 rounded-full opacity-60" style={{ backgroundColor: s.classColor || 'var(--color-primary)' }} />
                         <div>
                            <p className="font-semibold text-sm">{s.className}</p>
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Clock className="w-3 h-3 opacity-50" /> {formatTime(s.startTime)} · {s.location || 'No Location'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={s.status === 'inprogress' ? 'default' : 'secondary'} className="rounded-md font-bold text-[9px] uppercase tracking-wider">
                          {s.status}
                        </Badge>
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="py-16 text-center space-y-6">
                  <div className="p-5 bg-muted/40 rounded-full w-fit mx-auto ring-1 ring-foreground/5">
                    <Clock className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-muted-foreground">No sessions scheduled for today</p>
                    <p className="text-xs text-muted-foreground/60">
                      {isTeacher 
                        ? "Your classes will appear here when they are in session."
                        : "Relax! You have no classes scheduled for the rest of today."}
                    </p>
                  </div>
                  {isTeacher && (
                    <Button variant="ghost" size="sm" className="text-xs font-semibold gap-2" onClick={() => navigate("/teacher/schedule")}>
                      Go to Schedule Hub <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

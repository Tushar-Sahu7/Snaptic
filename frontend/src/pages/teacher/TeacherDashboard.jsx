import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    LayoutDashboard, 
    Users, 
    CheckCircle2, 
    TrendingUp, 
    Clock, 
    Plus,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { classes, loading: classesLoading } = useClasses();
  const { todaySessions, isPending: sessionsLoading } = useTodayAttendance();

  const stats = useMemo(() => {
    const activeClasses = classes.filter(c => c.status === "active");
    const totalStudents = activeClasses.reduce((acc, c) => acc + (c.studentCount || 0), 0);
    const sessionsToday = Object.keys(todaySessions).length;
    
    return [
      { label: "Active Classes", value: activeClasses.length, icon: LayoutDashboard, color: "text-primary", bg: "bg-muted/50" },
      { label: "Total Students", value: totalStudents, icon: Users, color: "text-primary", bg: "bg-muted/50" },
      { label: "Attendance Rate", value: "94%", icon: TrendingUp, color: "text-primary", bg: "bg-muted/50" },
      { label: "Sessions Today", value: sessionsToday, icon: Calendar, color: "text-primary", bg: "bg-muted/50" },
    ];
  }, [classes, todaySessions]);

  const isLoading = classesLoading || sessionsLoading;

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground/90">Overview</h1>
        <p className="text-muted-foreground text-base">
          Welcome back! Here's what's happening in your classes today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="hover:translate-y-[-2px] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} ring-1 ring-foreground/5`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />}
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-semibold block tracking-tight">
                  {isLoading ? "..." : stat.value}
                </span>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             <Button 
                variant="outline" 
                className="w-full h-12 justify-between group px-4 font-semibold"
                onClick={() => navigate("/teacher/schedule")}
             >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-muted/80">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    Schedule Hub
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
             </Button>

             <Button 
                variant="outline" 
                className="w-full h-12 justify-between group px-4 font-semibold"
                onClick={() => navigate("/teacher/classes")}
             >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted group-hover:bg-muted/80">
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                    Create New Class
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
             </Button>
          </CardContent>
        </Card>

        {/* Sessions Today */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Sessions Today</CardTitle>
              <CardDescription>Live tracking of your upcoming classes</CardDescription>
            </div>
            <Badge variant="secondary" className="rounded-md font-bold uppercase text-[9px] tracking-[0.1em] px-2 py-0.5">
              {Object.keys(todaySessions).length} Total
            </Badge>
          </CardHeader>
          <CardContent>
             {Object.keys(todaySessions).length > 0 ? (
               <div className="space-y-3">
                  {Object.values(todaySessions).map((s) => (
                    <div 
                      key={s._id} 
                      className="group flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 hover:border-foreground/10 cursor-pointer transition-all duration-200"
                      onClick={() => navigate(`/teacher/attendance/scan/${s._id}`)}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-1 h-8 rounded-full opacity-60" style={{ backgroundColor: s.classColor || 'oklch(0.7 0 0)' }} />
                         <div>
                            <p className="font-semibold text-sm">{s.className}</p>
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                              <Clock className="w-3 h-3 opacity-50" /> {s.startTime} · {s.location || 'No Location'}
                            </p>
                         </div>
                      </div>
                      <Badge variant={s.status === 'inprogress' ? 'default' : 'secondary'} className="rounded-md font-bold text-[9px] uppercase tracking-wider">
                        {s.status}
                      </Badge>
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
                    <p className="text-xs text-muted-foreground/60">Your classes will appear here when they are in session.</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold gap-2" onClick={() => navigate("/teacher/schedule")}>
                    Go to Schedule Hub <ArrowRight className="w-3 h-3" />
                  </Button>
               </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

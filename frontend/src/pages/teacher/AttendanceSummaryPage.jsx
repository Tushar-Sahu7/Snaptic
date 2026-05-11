import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useAttendanceSessionDetail } from "@/features/attendance/hooks/useAttendance";
import { 
  CheckCircle2, 
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
export default function AttendanceSummaryPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  
  const { data, isLoading, error } = useAttendanceSessionDetail(sessionId);

  const stats = useMemo(() => {
    if (!data?.records) return { present: 0, absent: 0, total: 0 };
    const records = data.records;
    return {
      present: records.filter(r => r.status === "present").length,
      absent: records.filter(r => r.status === "absent").length,
      total: records.length
    };
  }, [data?.records]);

  const dateFormatted = useMemo(() => {
    if (!data?.session?.dateString) return "";
    try {
      const date = new Date(data.session.dateString);
      if (isNaN(date.getTime())) return data.session.dateString;
      
      return date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return data.session.dateString;
    }
  }, [data?.session?.dateString]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Failed to load summary</h2>
        <Button onClick={() => navigate("/teacher/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  const { session } = data;
  const presentRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
  const isFinalized = session.status === "finalized";

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className={`p-4 rounded-2xl ${isFinalized ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
          {isFinalized ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isFinalized ? "Session Finalized" : "Attendance Submitted!"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isFinalized 
              ? "The official class schedule has ended. This session is now read-only."
              : "Today's session has been finalized and recorded in the class history."
            }
          </p>
        </div>
        {isFinalized && (
          <Badge variant="secondary" className="px-4 py-1 rounded-full font-medium">
            Read-Only Asset
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Session Info Card */}
        <Card className="rounded-3xl border-none shadow-sm bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Clock className="w-4 h-4" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-background">
                   <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <p className="text-xs font-bold text-muted-foreground uppercase">Date</p>
                   <p className="text-lg font-semibold">{dateFormatted}</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-background">
                   <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <p className="text-xs font-bold text-muted-foreground uppercase">Class Size</p>
                   <p className="text-lg font-semibold">{stats.total} Enrolled Students</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Breakdown Card */}
        <Card className="rounded-3xl border-none shadow-sm bg-muted/30">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              <Users className="w-4 h-4" />
              Attendance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-end justify-between">
               <div>
                  <p className="text-4xl font-black">{presentRate}%</p>
                  <p className="text-sm font-medium text-muted-foreground">Presence Rate</p>
               </div>
               <div className="flex gap-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-600">{stats.present}</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Present</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-rose-500">{stats.absent}</p>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Absent</p>
                  </div>
               </div>
            </div>
            
            {/* Simple Progress Bar */}
            <div className="h-3 w-full bg-background rounded-full overflow-hidden flex">
               <div className="h-full bg-emerald-500" style={{ width: `${presentRate}%` }} />
               <div className="h-full bg-rose-200" style={{ width: `${100 - presentRate}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-8 border-t flex flex-col sm:flex-row gap-4 justify-center">
         <Button 
           size="lg" 
           className="rounded-full px-8 gap-2 h-12"
           onClick={() => navigate(`/teacher/classes/${session.classId?._id || session.classId}/records/${sessionId}`)}
         >
           <ClipboardList className="w-5 h-5" />
           View Record
         </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchSessionRecords } from "@/features/attendance/api/attendance.api";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  LayoutDashboard,
  Calendar,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AttendanceSummaryPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const { data } = await fetchSessionRecords(sessionId);
        setSession(data.session);
        
        // Calculate stats
        const records = data.records;
        setStats({
          present: records.filter(r => r.status === "present").length,
          absent: records.filter(r => r.status === "absent").length,
          late: records.filter(r => r.status === "late").length,
          total: records.length
        });
      } catch (err) {
        toast.error("Failed to load session summary");
        navigate("/teacher/classes");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center py-20">
        <Loader2 className="size-10 animate-spin text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold">Generating Summary...</h2>
      </div>
    );
  }

  const date = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const presentRate = Math.round((stats.present / stats.total) * 100);

  const isFinalized = session.status === "finalized";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`size-20 rounded-[32px] flex items-center justify-center shadow-sm border-4 ${isFinalized ? 'bg-red-100 text-red-600 border-red-50' : 'bg-emerald-100 text-emerald-600 border-emerald-50'}`}>
          {isFinalized ? <Clock className="size-10" /> : <CheckCircle2 className="size-10" />}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {isFinalized ? "Session Finalized" : "Attendance Submitted!"}
          </h1>
          <p className="text-muted-foreground font-medium max-w-sm mx-auto">
            {isFinalized 
              ? "The official class schedule has ended. This session is now read-only and securely logged."
              : "The session for today has been finalized and recorded in the class history."
            }
          </p>
        </div>
        {isFinalized && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] uppercase font-black tracking-widest px-3 py-1">
            Read-Only Asset
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Stats Card */}
        <Card className="rounded-3xl border-2 border-emerald-500/10 bg-emerald-50/5 shadow-xs overflow-hidden">
          <CardHeader className="bg-emerald-50/30 border-b pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Clock className="size-5 text-emerald-600" />
              Session Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                   <Calendar className="size-5" />
                </div>
                <div>
                   <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Date</p>
                   <p className="font-bold text-sm">{date}</p>
                </div>
             </div>
             
             <div className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                   <Users className="size-5" />
                </div>
                <div>
                   <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider leading-none mb-1">Roster Size</p>
                   <p className="font-bold text-sm tracking-tight">{stats.total} Registered Students</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Attendance Breakdown */}
        <Card className="rounded-3xl border-2 shadow-xs overflow-hidden">
           <CardHeader className="bg-accent/30 border-b pb-4">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Users className="size-5 text-primary" />
              Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
               <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-2xl">
                  <span className="text-sm font-bold text-emerald-700">Present</span>
                  <span className="text-xl font-black text-emerald-700">{presentRate}%</span>
               </div>
               
               <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col bg-accent/30 p-4 rounded-3xl items-center">
                    <span className="text-2xl font-black">{stats.present}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Present</span>
                  </div>
                   <div className="flex flex-col bg-accent/30 p-4 rounded-3xl items-center">
                    <span className="text-2xl font-black text-destructive">{stats.absent}</span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Absent</span>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
         <Button 
           size="lg" 
           className="w-full h-14 rounded-2xl font-bold gap-2 shadow-md shadow-emerald-500/20"
           onClick={() => navigate("/teacher/dashboard")}
         >
           <LayoutDashboard className="size-5" />
           Back to Dashboard
         </Button>
      </div>
    </div>
  );
}

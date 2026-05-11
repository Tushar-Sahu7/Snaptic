import React from "react";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar,
  AlertCircle,
  TrendingUp,
  History,
  Camera,
  Keyboard,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export default function AttendanceLedger({ history, stats, studentName, classId, isTeacher = true }) {
  const navigate = useNavigate();

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-muted/10 rounded-3xl border border-dashed border-border/60">
        <div className="p-6 rounded-full bg-muted/20 border border-border/40 mb-6">
          <History className="w-12 h-12 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No records for this student</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">
          Once attendance sessions are submitted, the history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none bg-primary/5 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-12 h-12 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Attendance Rate</CardDescription>
            <CardTitle className="text-4xl font-black text-primary">{Math.round(stats.attendancePercentage)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-1000 ease-out" 
                style={{ width: `${stats.attendancePercentage}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-emerald-500/5 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Sessions Present</CardDescription>
            <CardTitle className="text-4xl font-black text-emerald-600">{stats.presentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-bold text-emerald-600/80">
              Out of {stats.totalSessions} total sessions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none bg-destructive/5 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-destructive/60">Sessions Absent</CardDescription>
            <CardTitle className="text-4xl font-black text-destructive">{stats.absentCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-bold text-destructive/80">
              {stats.absentCount === 0 ? "Perfect record!" : "Needs attention"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        <h3 className="text-lg font-black flex items-center gap-2 px-2">
          <History className="w-5 h-5 text-primary" />
          Detailed History
        </h3>
        
        <div className="space-y-3">
          {history.map((record, index) => {
            const isPresent = record.status === "present";
            return (
              <Card 
                key={record.recordId} 
                className={cn(
                  "rounded-2xl border-border/40 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer",
                  isPresent ? "hover:border-emerald-500/20" : "hover:border-destructive/20"
                )}
                onClick={() => navigate(isTeacher ? `/teacher/classes/${classId}/sessions/${record.session._id}` : `/student/classes/${classId}/sessions/${record.session._id}`)}
              >
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      isPresent 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]" 
                        : "bg-destructive/10 text-destructive border border-destructive/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)]"
                    )}>
                      {isPresent ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-foreground">
                          {format(new Date(record.session.startTime), "EEEE, MMM d")}
                        </p>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground font-bold">
                          {format(new Date(record.session.startTime), "h:mm a")}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        {record.method && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80">
                            {record.method === 'face' ? <Camera className="w-3.5 h-3.5" /> : <Keyboard className="w-3.5 h-3.5" />}
                            <span className="capitalize">{record.method} scan</span>
                          </div>
                        )}
                        {record.markedAt && (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Marked at {format(new Date(record.markedAt), "h:mm a")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={cn(
                      "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                      isPresent 
                        ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                        : "bg-destructive text-white hover:bg-destructive/90"
                    )}>
                      {isPresent ? "Present" : "Absent"}
                    </Badge>
                    <div className="p-2 rounded-xl bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

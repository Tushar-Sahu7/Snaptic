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
  ArrowRight,
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AttendanceLedger({ history, stats, studentName, classId, isTeacher = true }) {

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
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm hover:shadow-md border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl ring-1 ring-foreground/5 bg-primary/10 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-semibold block tracking-tight">
                {Math.round(stats.attendancePercentage)}%
              </span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm hover:shadow-md border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl ring-1 ring-foreground/5 bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-semibold block tracking-tight">
                {stats.presentCount}
              </span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions Present</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">Out of {stats.totalSessions} sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:translate-y-[-2px] transition-all duration-300 shadow-sm hover:shadow-md border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl ring-1 ring-foreground/5 bg-destructive/10 text-destructive">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-2xl font-semibold block tracking-tight">
                {stats.absentCount}
              </span>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions Absent</p>
              <p className="text-[10px] text-muted-foreground/60 font-medium mt-1">
                {stats.absentCount === 0 ? "Perfect record!" : "Needs attention"}
              </p>
            </div>
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
                  "rounded-2xl border-border/40 shadow-sm transition-all duration-300 group",
                  isPresent ? "hover:border-emerald-500/10" : "hover:border-destructive/10"
                )}
              >
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "size-12 rounded-2xl flex items-center justify-center transition-transform",
                      isPresent 
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                        : "bg-destructive/10 text-destructive border border-destructive/20"
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

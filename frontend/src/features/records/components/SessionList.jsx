import React from "react";
import { useNavigate } from "react-router";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function SessionList({ sessions, classId, isTeacher = true }) {
  const navigate = useNavigate();

  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="p-6 rounded-full bg-muted/20 border border-border/40 mb-6">
          <Calendar className="w-12 h-12 text-muted-foreground/30" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No sessions recorded</h3>
        <p className="text-muted-foreground max-w-xs mx-auto mt-2 font-medium">
          Once attendance is finalized for a class session, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <Card 
          key={session._id}
          className="group relative overflow-hidden border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
          onClick={() => navigate(isTeacher ? `/teacher/classes/${classId}/records/${session._id}` : `/student/classes/${classId}/records/${session._id}`)}
        >
          {/* Subtle background glow on hover */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold tracking-tight text-foreground/80">
                    {format(new Date(session.date), "MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium ml-1">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                </div>
              </div>
              
              <Badge 
                variant="outline" 
                className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-md"
              >
                Finalized
              </Badge>
            </div>

            <div className="space-y-4">
              {isTeacher && session.stats && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Present</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-foreground">{session.stats.present}</span>
                      <span className="text-xs text-muted-foreground font-bold">/ {session.stats.total}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Attendance</span>
                    <div className="text-xl font-black text-primary">
                      {Math.round((session.stats.present / session.stats.total) * 100)}%
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                    View Record
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  {session.updatedAt && (
                    <span className="text-[10px] text-muted-foreground font-medium mt-1">
                      Taken at {format(new Date(session.updatedAt), "h:mm a")}
                    </span>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <DropdownMenuItem 
                      onClick={() => navigate(isTeacher ? `/teacher/classes/${classId}/records/${session._id}` : `/student/classes/${classId}/records/${session._id}`)}
                      className="rounded-lg font-medium"
                    >
                      <ChevronRight className="mr-2 w-4 h-4" /> View Record
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

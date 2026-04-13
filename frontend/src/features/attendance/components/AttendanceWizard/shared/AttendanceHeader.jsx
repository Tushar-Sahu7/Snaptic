import { ArrowLeft, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

export const AttendanceHeader = ({ 
  session, 
  isFinalized, 
  timeLeft, 
  endTimeFormatted,
  step, 
  onTerminate 
}) => {
  const navigate = useNavigate();

  const statusLabel = isFinalized ? "Finalized" 
    : session?.status === "submitted" ? "Submitted"
    : session ? "Live" 
    : "Not Started";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => navigate("/teacher/dashboard")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-sm font-black tracking-tight uppercase truncate">
              {session?.classId?.name || "Ready to Start"}
            </h2>
            {/* Mobile-only status badge */}
            <div
              className={cn(
                "sm:hidden px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest shadow-none shrink-0",
                isFinalized
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : session?.status === "submitted"
                    ? "bg-accent/50 text-primary border-accent"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              )}
            >
              {statusLabel}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <Clock className="size-3" />
            {!session 
              ? "Select a class" 
              : isFinalized 
                ? "Session Locked" 
                : `Live until ${endTimeFormatted || "..."} (${timeLeft})`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-11 sm:ml-0">
        {session && !isFinalized && step < 4 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive h-8 px-2 font-bold text-[10px] uppercase hover:bg-destructive/10"
            onClick={onTerminate}
          >
            <Trash2 className="size-3 mr-1.5" />
            Terminate
          </Button>
        )}
        <div
          className={cn(
            "hidden sm:block px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-colors shadow-xs",
            isFinalized
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : session?.status === "submitted"
                ? "bg-accent/50 text-primary border-accent"
                : "bg-emerald-50/80 text-emerald-600 border-emerald-200/50",
          )}
        >
          {statusLabel}
        </div>
      </div>
    </div>
  );
};

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, CalendarDays, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export const SessionCard = memo(function SessionCard({ session, action, className }) {
  if (!session) return null;

  const startTimeStr = formatTime(session.start_instant || session.startTime);
  const dateStr = formatDate(session.start_instant || session.startTime);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={session.status} />
            <h4 className="font-semibold text-base sm:text-lg">
              {dateStr}
            </h4>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 shrink-0" />
              <span>{startTimeStr} {session.duration_minutes ? `(${session.duration_minutes}m)` : ""}</span>
            </div>
            
            {session.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate max-w-[200px]">{session.location}</span>
              </div>
            )}
          </div>
        </div>
        
        {action && (
          <div className="shrink-0 mt-2 sm:mt-0">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

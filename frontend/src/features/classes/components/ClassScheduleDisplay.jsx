import React from "react";
import { Clock } from "lucide-react";
import { formatDays, formatClassTimeRange } from "@/lib/date-utils";

export default function ClassScheduleDisplay({ schedule }) {
  if (!schedule?.rrule) return null;

  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider transition-colors hover:bg-secondary hover:text-foreground group cursor-default">
      <Clock size={12} className="text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
      <span>{formatDays(schedule)}</span>
      <span className="text-muted-foreground/30 mx-0.5">•</span>
      <span>{formatClassTimeRange({ schedule })}</span>
    </span>
  );
}

import React from "react";
import { Clock } from "lucide-react";
import { formatDays, format12Hour, formatDuration } from "@/lib/utils";

export default function ClassScheduleDisplay({ daysOfWeek, startTime, duration }) {
  if (!daysOfWeek || daysOfWeek.length === 0) return null;

  return (
    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider transition-colors hover:bg-secondary hover:text-foreground group cursor-default">
      <Clock size={12} className="text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
      <span>{formatDays(daysOfWeek)}</span>
      <span className="text-muted-foreground/30 mx-0.5">•</span>
      <span>
        {(() => {
          try {
            if (!startTime) return "Not Set";
            const [startH, startM] = startTime.split(":").map(Number);
            const start = new Date();
            start.setHours(startH, startM, 0, 0);
            const durationMins = duration || 60;
            const end = new Date(start.getTime() + durationMins * 60000);
            const endH = end.getHours();
            const endM = end.getMinutes().toString().padStart(2, "0");
            return `${format12Hour(startTime)} - ${format12Hour(`${endH}:${endM}`)} (${formatDuration(durationMins)})`;
          } catch (e) {
            return format12Hour(startTime);
          }
        })()}
      </span>
    </span>
  );
}

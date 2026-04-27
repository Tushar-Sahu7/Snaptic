import React from "react";
import { Clock } from "lucide-react";
import { formatDays, format12Hour } from "@/lib/utils";

export default function ClassScheduleDisplay({ schedules }) {
  if (!schedules || schedules.length === 0) return null;

  // Summarize schedules: if only one, show detail. 
  // If multiple, show "X Sessions/week" or a list.
  if (schedules.length === 1) {
    const s = schedules[0];
    return (
      <span className="flex items-center gap-1.5 truncate">
        <Clock size={12} className="text-muted-foreground shrink-0" />
        {formatDays(s.days)} · {format12Hour(s.startTime)}
      </span>
    );
  }

  // Count total days
  const allDays = new Set();
  schedules.forEach(s => s.days.forEach(d => allDays.add(d)));

  return (
    <span className="flex items-center gap-1.5 truncate">
      <Clock size={12} className="text-muted-foreground shrink-0" />
      {allDays.size} days/week · {schedules.length} patterns
    </span>
  );
}

import React from "react";
import { Clock } from "lucide-react";
import { formatDays, format12Hour } from "@/lib/utils";

export default function ClassScheduleDisplay({ daysOfWeek, startTime }) {
  if (!daysOfWeek || daysOfWeek.length === 0) return null;

  return (
    <span className="flex items-center gap-1.5 truncate">
      <Clock size={12} className="text-muted-foreground shrink-0" />
      {formatDays(daysOfWeek)} · {format12Hour(startTime)}
    </span>
  );
}

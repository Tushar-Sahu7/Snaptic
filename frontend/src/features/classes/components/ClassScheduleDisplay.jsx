import React from "react";
import { Clock } from "lucide-react";
import { formatDays, format12Hour, formatRoom } from "@/lib/utils";

export default function ScheduleDisplay({ schedule, className }) {
  if (!schedule || (!schedule.days?.length && !schedule.day)) return null;

  const daysStr = schedule.days?.length > 0
    ? formatDays(schedule.days)
    : schedule.day
      ? schedule.day.substring(0, 3)
      : "";

  return (
    <span className={`flex items-center gap-1 ${className || ""}`}>
      <Clock data-icon="inline-start" className="size-3.5" />
      {daysStr}
      {schedule.startTime && ` · ${format12Hour(schedule.startTime)}`}
      {schedule.endTime && ` – ${format12Hour(schedule.endTime)}`}
      {schedule.room && ` · ${formatRoom(schedule.room)}`}
    </span>
  );
}

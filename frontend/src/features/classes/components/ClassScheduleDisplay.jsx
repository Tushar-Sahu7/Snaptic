import React from "react";
import { Clock } from "lucide-react";
import { formatDays, format12Hour, formatRoom } from "@/lib/utils";

export default function ScheduleDisplay({ schedule }) {
  if (!schedule || (!schedule.days?.length && !schedule.day)) return null;

  const daysStr = schedule.days?.length > 0
    ? formatDays(schedule.days)
    : schedule.day
      ? schedule.day.substring(0, 3)
      : "";

  return (
    <span>
      <Clock data-icon="inline-start" />
      {daysStr}
      {schedule.startTime && ` · ${format12Hour(schedule.startTime)}`}
      {schedule.endTime && ` – ${format12Hour(schedule.endTime)}`}
      {schedule.room && ` · ${formatRoom(schedule.room)}`}
    </span>

  );
}

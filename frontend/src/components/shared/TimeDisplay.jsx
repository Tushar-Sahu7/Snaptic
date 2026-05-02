import { formatTime, formatDate, formatRelative } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

export function TimeDisplay({ 
  instantStr, 
  timezone = "UTC", 
  showDate = false, 
  showRelative = false,
  className,
  icon = true
}) {
  if (!instantStr) return null;

  const timeStr = formatTime(instantStr, timezone);
  const dateStr = showDate ? formatDate(instantStr, timezone) : "";
  const relativeStr = showRelative ? formatRelative(instantStr) : "";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)}>
      {icon && <Clock className="size-3.5 shrink-0" />}
      <span className="flex items-center gap-1.5">
        {showDate && <span>{dateStr}</span>}
        {showDate && timeStr && <span>•</span>}
        <span>{timeStr}</span>
        {showRelative && (
          <span className="ml-1 text-xs opacity-75">({relativeStr})</span>
        )}
      </span>
    </span>
  );
}

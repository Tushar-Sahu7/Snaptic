import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, MapPin, Clock } from "lucide-react";
import { ClassIcon } from "./ClassIcon";
import { formatDays, format12Hour, formatRoom, cn } from "@/lib/utils";

const calculateDuration = (start, end) => {
  if (!start || !end) return "";
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const totalMinutes = eh * 60 + em - (sh * 60 + sm);
    if (totalMinutes <= 0) return "";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
  } catch (e) {
    return "";
  }
};

/**
 * Shared ClassCard component using a slot-based composition pattern.
 * Supports Teacher, Student, and Attendance Selection views.
 *
 * Slots:
 * - badge: React node for status badges (top-right)
 * - actions: React node for management tools (top-right)
 * - footer: React node for bottom content/buttons
 */
const ClassCard = memo(
  ({
    cls,
    onClick,
    badge,
    actions,
    footer,
    variant = "default",
    className,
  }) => {
    const duration = calculateDuration(
      cls.schedule?.startTime,
      cls.schedule?.endTime,
    );
    const isArchived = cls.status === "archived";

    return (
      <Card
        className={cn(
          "group relative cursor-pointer transition-all border-2 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg bg-card active:scale-[0.98]",
          variant === "highlight"
            ? "border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-50/5"
            : "hover:border-primary/40",
          isArchived && "opacity-80 grayscale-[0.2]",
          className,
        )}
        onClick={() => onClick?.(cls._id)}
      >
        <CardContent className="px-5 py-3.5 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border shadow-xs shrink-0 transition-transform group-hover:scale-105",
                  variant === "highlight"
                    ? "bg-emerald-500 text-white border-emerald-400"
                    : "bg-accent text-accent-foreground",
                  isArchived && "opacity-70",
                )}
              >
                <ClassIcon name={cls.icon} className="size-5" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-bold text-base leading-tight truncate",
                      isArchived && "text-muted-foreground",
                    )}
                  >
                    {cls.name}
                  </h3>
                  {isArchived && (
                    <Badge
                      variant="outline"
                      className="rounded-full px-2 py-0 font-black text-[8px] uppercase tracking-wider text-muted-foreground border-muted-foreground/20 bg-muted/20 shrink-0"
                    >
                      Archived
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground mt-0.5">
                  <MapPin className="size-2.5" />
                  <span className="truncate">
                    {cls.schedule?.room
                      ? formatRoom(cls.schedule.room)
                      : "No Room Set"}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
              aria-label="Class management actions"
            >
              {badge}
              {actions}
            </div>
          </div>

          {/* Schedule & Stats Section */}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-[13px]">
              <Clock className="size-3.5 text-muted-foreground" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-foreground/90">
                  {cls.schedule?.startTime
                    ? format12Hour(cls.schedule.startTime)
                    : "--"}{" "}
                  -{" "}
                  {cls.schedule?.endTime
                    ? format12Hour(cls.schedule.endTime)
                    : "--"}
                </span>
                {duration && (
                  <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                    ({duration})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[13px]">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground/90 truncate">
                {cls.schedule?.days?.length > 0
                  ? formatDays(cls.schedule.days)
                  : "No days set"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[13px]">
              <Users className="size-3.5 text-muted-foreground" />
              <span className="font-bold text-foreground/90">
                {cls.studentCount || cls.studentIds?.length || 0} Students
                Enrolled
              </span>
            </div>
          </div>

          {/* Footer Section */}
          {footer && (
            <div
              className="mt-4 pt-4 border-t border-dashed"
              onClick={(e) => e.stopPropagation()}
            >
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
);

ClassCard.displayName = "ClassCard";

export default ClassCard;

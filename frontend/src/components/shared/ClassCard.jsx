import { memo } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, MapPin, Clock, ChevronRight } from "lucide-react";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import { formatDays, format12Hour, formatRoom, isClassInSession, cn } from "@/lib/utils";

const ClassCard = memo(
  ({
    cls,
    onClick,
    badge,
    actions,
    footer,
    className,
  }) => {
    const { onTime, activeSchedule } = isClassInSession(cls);
    const isArchived = cls.status === "archived";

    // Primary schedule to show in the main slot
    const primarySchedule = activeSchedule || cls.schedules?.[0];

    return (
      <Card
        className={cn(
          "group relative overflow-hidden transition-all hover:shadow-md cursor-pointer",
          onTime && "border-primary ring-1 ring-primary/20 bg-primary/5",
          className
        )}
        onClick={() => onClick?.(cls._id)}
      >
        <CardContent className="p-0">
          <div className="p-5 space-y-6">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-border bg-background shadow-sm transition-transform group-hover:scale-105"
                  style={{ color: cls.color || "inherit" }}
                >
                  <LucideIcon name={cls.icon} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg leading-none truncate">
                      {cls.name}
                    </h3>
                    {isArchived && <Badge variant="secondary" className="h-5 text-[10px]">Archived</Badge>}
                    {onTime && <Badge className="h-5 text-[10px] bg-primary animate-pulse">In Session</Badge>}
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                    <MapPin size={12} />
                    <span className="truncate">
                      {primarySchedule?.location ? formatRoom(primarySchedule.location) : "No location set"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {badge}
                {actions}
              </div>
            </div>

            {/* Schedule Summary Section */}
            <div className="grid grid-cols-2 gap-4 py-1">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <Clock size={10} /> Timing
                </span>
                <div className="text-sm font-medium">
                  {primarySchedule ? (
                    <>
                      {format12Hour(primarySchedule.startTime)}
                      <span className="text-muted-foreground mx-1">·</span>
                      {primarySchedule.duration}m
                    </>
                  ) : "--"}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                  <CalendarDays size={10} /> Recurrence
                </span>
                <div className="text-sm font-medium">
                  {primarySchedule ? formatDays(primarySchedule.days) : "No days"}
                  {cls.schedules?.length > 1 && (
                    <span className="text-[10px] text-primary ml-1.5 font-bold">
                      +{cls.schedules.length - 1} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users size={12} />
                <span>{cls.studentCount || 0} Students</span>
              </div>
              
              <ChevronRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {footer && (
            <div 
              className="bg-muted/30 p-3 border-t border-border"
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

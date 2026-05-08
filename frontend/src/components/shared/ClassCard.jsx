import { memo } from "react";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Clock,
  CalendarDays,
  ChevronRight,
  Users,
} from "lucide-react";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import {
  formatDays,
  format12Hour,
  formatRoom,
  isClassInSession,
  formatClassTimeRange,
  formatClassValidity,
} from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * ClassCard - A premium, tactile card representing a teaching class.
 * Follows MUJI-inspired "Without Thought" design principles.
 */
const ClassCard = memo(
  ({ cls, onClick, actions, footer, badge, className, layout = "grid" }) => {
    const isList = layout === "list";
    const { onTime } = isClassInSession(cls);
    const isArchived = cls.status === "archived";

    // Derive colors using OKLCH for perceptual uniformity
    const brandColor = cls.color || "oklch(0.4 0.02 160)"; // Default to a refined slate if not provided

    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.(cls._id);
      }
    };

    return (
      <Card
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex overflow-hidden transition-all duration-500",
          isList ? "flex-col sm:flex-row items-center p-4 gap-4" : "flex-col",
          "bg-background border border-border/50 shadow-sm",
          "hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          onTime && "ring-2 ring-primary/10 border-primary/20",
          className,
        )}
        onClick={() => onClick?.(cls._id)}
      >
        {/* Decorative "Thread" - Subtle vertical line for a tactile feel */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ backgroundColor: brandColor }}
        />

        <div
          className={cn(
            "flex flex-1 gap-8",
            isList
              ? "flex-col sm:flex-row items-center p-0 gap-4 sm:gap-8"
              : "flex-col p-7",
          )}
        >
          {/* Top Section: Icon & Identity */}
          <div
            className={cn(
              "flex items-start justify-between gap-4",
              isList ? "w-full sm:w-auto" : "",
            )}
          >
            <div className="flex gap-5 items-center min-w-0">
              {/* Tactile "Squircle" Icon Container */}
              <div
                className={cn(
                  "rounded-[22px] flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden transition-all duration-700 group-hover:rotate-[4deg] group-hover:scale-105",
                  isList ? "w-12 h-12 rounded-xl" : "w-16 h-16",
                )}
                style={{
                  backgroundColor: `color-mix(in oklch, ${brandColor}, transparent 92%)`,
                  color: brandColor,
                }}
              >
                {/* Glassy Overlay */}
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]" />
                <LucideIcon
                  name={cls.icon}
                  size={isList ? 24 : 32}
                  strokeWidth={1.5}
                  className="relative z-10 drop-shadow-sm"
                />
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-bold tracking-tight text-foreground leading-tight truncate",
                      isList ? "text-lg" : "text-2xl",
                    )}
                  >
                    {cls.name}
                  </h3>
                  {isArchived && (
                    <Badge
                      variant="secondary"
                      className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border-amber-500/20 whitespace-nowrap"
                    >
                      Archived
                    </Badge>
                  )}
                  {badge && <div className="shrink-0">{badge}</div>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <div
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: brandColor }}
                  />
                  <span className="truncate">
                    {cls.location ? formatRoom(cls.location) : "Online Session"}
                  </span>
                </div>
              </div>
            </div>

            {!isList && (
              <div
                className="flex items-center -mr-2"
                onClick={(e) => e.stopPropagation()}
              >
                {actions}
              </div>
            )}
          </div>

          {/* Info Grid: Timing, Days & Validity */}
          <div
            className={cn(
              "grid",
              isList 
                ? "hidden lg:grid grid-cols-3 flex-1 px-8 border-x border-border/40 gap-6" 
                : "grid-cols-2 gap-x-10 gap-y-6",
            )}
          >
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                <Clock size={10} className="opacity-70" /> Schedule
              </p>
              <p className={cn("text-sm font-bold text-foreground/90", isList && "whitespace-nowrap")}>
                {formatClassTimeRange(cls)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                <CalendarDays size={10} className="opacity-70" /> Occurrence
              </p>
              <p className="text-sm font-bold text-foreground/90 truncate">
                {formatDays(cls.schedule)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                <CalendarDays size={10} className="opacity-70" /> Validity
              </p>
              <p className="text-sm font-bold text-foreground/90">
                {formatClassValidity(cls.schedule)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            className={cn(
              "flex items-center gap-3",
              isList
                ? "hidden lg:flex"
                : "mt-auto pt-6 border-t border-border/40 justify-between",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {cls.previewStudents?.length > 0 || cls.students?.length > 0 ? (
                  (cls.previewStudents || cls.students).slice(0, 3).map((student) => (
                    <Avatar key={student._id} className="w-10 h-10 border-2 border-background shadow-sm">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {student.name?.slice(0, 2).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                  ))
                ) : cls.studentCount > 0 ? (
                  [...Array(Math.min(cls.studentCount, 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm"
                    >
                      <Users size={14} className="text-muted-foreground/40" />
                    </div>
                  ))
                ) : (
                  <div className="w-10 h-10 rounded-full border-2 border-dashed border-border/50 bg-muted/20 flex items-center justify-center">
                    <Users size={14} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="text-foreground">{cls.studentCount || 0}</span>{" "}
                Students
              </p>
            </div>

            {!isList && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                <ChevronRight size={18} strokeWidth={2.5} />
              </div>
            )}
          </div>

          {isList && (
            <div
              className="flex items-center gap-2 ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* External Footer Action (Attendance) - Only in Grid View or integrated differently */}
        {footer && !isList && (
          <div
            className="px-4 pb-4 bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-2 border-t border-border/40">
              {footer}
            </div>
          </div>
        )}
      </Card>
    );
  },
);

ClassCard.displayName = "ClassCard";

export default ClassCard;

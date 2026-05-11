import { memo } from "react";
import { useAuth } from "@/context/AuthContext";
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
    const { user } = useAuth();
    const isList = layout === "list";
    const isStudent = user?.role === "student";
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
                  <span className="truncate">
                    {cls.location ? formatRoom(cls.location) : "Online Session"}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex items-center -mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              {!isStudent && !isList && actions}
            </div>
          </div>

          {/* Info Grid: Timing, Days & Validity */}
          <div
            className={cn(
              "grid",
              isList
                ? "hidden lg:grid grid-cols-4 flex-1 px-8 border-x border-border/40 gap-6"
                : "grid-cols-2 gap-x-10 gap-y-6",
            )}
          >
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                <Clock size={10} className="opacity-70" /> Schedule
              </p>
              <p
                className={cn(
                  "text-sm font-bold text-foreground/90",
                  isList && "whitespace-nowrap",
                )}
              >
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

            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                Attendance
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground/90">
                  {isStudent
                    ? `${Math.round(cls.attendancePercentage || 0)}%`
                    : `${cls.averageAttendance || 0}%`}
                </p>
              </div>
            </div>
          </div>

          {/* Stats & Identity */}
          <div
            className={cn(
              "flex items-center gap-3",
              isList
                ? "flex"
                : "mt-auto pt-6 border-t border-border/40 justify-between",
            )}
          >
            <div className="flex items-center gap-4">
              {!isList && (
                <div className="flex -space-x-2 overflow-hidden py-1">
                  {cls.previewStudents?.length > 0 ? (
                    <>
                      {cls.previewStudents.slice(0, 3).map((student, i) => (
                        <Avatar
                          key={i}
                          className="w-12 h-12 border-2 border-background shadow-sm transition-transform hover:translate-y-[-2px] hover:z-10"
                        >
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-bold">
                            {student.name?.slice(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </>
                  ) : (cls.studentCount || 0) > 0 ? (
                    <div className="w-12 h-12 rounded-full border-2 border-background bg-primary/5 flex items-center justify-center shadow-sm">
                      <Users size={24} className="text-primary/40" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-border/50 bg-muted/20 flex items-center justify-center">
                      <Users size={24} className="text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                  Students
                </p>
                <p className="text-xs font-bold text-foreground/80">
                  {cls.studentCount || 0} Enrolled
                </p>
              </div>
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
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                <ChevronRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          )}
        </div>

        {/* Footer Area - Role Aware */}
        {!isList && (isStudent || footer) && (
          <div
            className="px-4 pb-4 bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-2 border-t border-border/40">
              {isStudent ? (
                <div className="flex items-center gap-3.5 py-1.5 px-1 ml-auto w-fit">
                  <div className={cn(
                    "relative w-12 h-12 shrink-0 rounded-full shadow-sm overflow-hidden transition-transform hover:scale-105 flex items-center justify-center",
                    cls.teacher?.avatar ? "border border-border/50 bg-muted" : "border-2 border-dashed border-border/50 bg-background"
                  )}>
                    {cls.teacher?.avatar ? (
                      <img 
                        src={cls.teacher.avatar.startsWith('http') || cls.teacher.avatar.startsWith('data:') ? cls.teacher.avatar : `data:image/jpeg;base64,${cls.teacher.avatar}`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black bg-primary/10 text-primary">
                        {cls.teacher?.name?.slice(0, 2).toUpperCase() || "T"}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest leading-none">
                      by teacher
                    </p>
                    <p className="text-sm font-bold text-foreground tracking-tight leading-tight">
                      {cls.teacher?.name || "Teacher Name"}
                    </p>
                  </div>
                </div>
              ) : (
                footer
              )}
            </div>
          </div>
        )}
      </Card>
    );
  },
);

ClassCard.displayName = "ClassCard";

export default ClassCard;

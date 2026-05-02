import { memo } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, CalendarDays, ChevronRight, Users, Radio } from "lucide-react";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import { formatDays, format12Hour, formatRoom, isClassInSession, cn } from "@/lib/utils";

/**
 * ClassCard - A premium, tactile card representing a teaching class.
 * Follows MUJI-inspired "Without Thought" design principles.
 */
const ClassCard = memo(({ cls, onClick, actions, footer, className }) => {
  const { onTime } = isClassInSession(cls);
  const isArchived = cls.status === "archived";

  // Derive colors using OKLCH for perceptual uniformity
  const brandColor = cls.color || "oklch(0.2 0 0)"; // Default to a deep neutral if not provided
  
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden transition-all duration-500",
        "bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 shadow-sm",
        "hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 active:scale-[0.98]",
        onTime && "ring-2 ring-primary/10 border-primary/20",
        isArchived && "opacity-75 grayscale-[0.5]",
        className
      )}
      onClick={() => onClick?.(cls._id)}
    >
      {/* Decorative "Thread" - Subtle vertical line for a tactile feel */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: brandColor }}
      />
      
      <div className="p-7 flex flex-col flex-1 gap-8">
        {/* Top Section: Icon & Identity */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-5 items-center min-w-0">
            {/* Tactile "Squircle" Icon Container */}
            <div 
              className="w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden transition-all duration-700 group-hover:rotate-[4deg] group-hover:scale-105"
              style={{ 
                backgroundColor: `color-mix(in oklch, ${brandColor}, transparent 92%)`,
                color: brandColor 
              }}
            >
              {/* Glassy Overlay */}
              <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]" />
              <LucideIcon name={cls.icon} size={32} strokeWidth={1.5} className="relative z-10 drop-shadow-sm" />
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                {cls.name}
              </h3>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brandColor }} />
                <span className="truncate">
                  {cls.location ? formatRoom(cls.location) : "Online Session"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center -mr-2" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        </div>

        {/* Live Indicator - If in session */}
        {onTime && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.15em] w-fit animate-in fade-in slide-in-from-left-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Now
          </div>
        )}

        {/* Info Grid: Timing & Days */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Clock size={12} className="opacity-70" /> Schedule
            </p>
            <p className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              {cls.startTime ? (
                <>
                  {format12Hour(cls.startTime)}
                  <span className="text-zinc-300 dark:text-zinc-700 mx-2 font-light">|</span>
                  {cls.duration}m
                </>
              ) : "Not Set"}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <CalendarDays size={12} className="opacity-70" /> Occurrence
            </p>
            <p className="text-base font-bold text-zinc-800 dark:text-zinc-200 truncate">
              {formatDays(cls.daysOfWeek)}
            </p>
          </div>
        </div>

        {/* Bottom Section: Engagement & CTA */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center shadow-sm"
                >
                  <Users size={12} className="text-zinc-300" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <span className="text-zinc-900 dark:text-zinc-100">{cls.studentCount || 0}</span> Enrolled
            </p>
          </div>

          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-500">
            <ChevronRight size={18} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* External Footer Action (Attendance) */}
      {footer && (
        <div 
          className="px-4 pb-4 bg-white dark:bg-zinc-950"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 ring-1 ring-inset ring-black/[0.03] dark:ring-white/[0.03]">
            {footer}
          </div>
        </div>
      )}

      {/* Archived Overlay */}
      {isArchived && (
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none">
          <div className="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl scale-110 -rotate-3">
            Archived
          </div>
        </div>
      )}
    </Card>
  );
});

ClassCard.displayName = "ClassCard";

export default ClassCard;



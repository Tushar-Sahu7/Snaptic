import { useAttendanceAction } from "@/features/attendance/hooks/useAttendanceAction";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Unified Attendance Action component.
 * Handles split buttons for initialization and single buttons for all other states.
 * Uses useAttendanceAction hook for logic.
 */
export const AttendanceButton = ({ cls, session, onSelect, className }) => {
  const { isSplit, primary, secondary } = useAttendanceAction(cls, session);

  if (!primary) return null;

  const handleSelect = (mode) => {
    if (primary.disabled && mode === primary.mode) return;
    onSelect?.(cls, mode);
  };

  const commonBtnClass =
    "rounded-xl font-black h-10 sm:h-11 uppercase text-[10px] sm:text-[11px] tracking-wider gap-1.5 shadow-sm transition-all active:scale-[0.98]";

  if (isSplit) {
    return (
      <div className={cn("flex flex-col xl:flex-row gap-2 xl:gap-1.5 w-full", className)}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(primary.mode);
          }}
          className={cn("w-full xl:flex-1 h-11 xl:h-11 px-4 xl:px-2", commonBtnClass)}
        >
          {primary.label}
          {primary.icon && (
            <primary.icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect(secondary.mode);
          }}
          className={cn(
            "w-full xl:flex-1 h-11 xl:h-11 px-4 xl:px-2 border-primary/20 hover:bg-primary/5",
            commonBtnClass,
          )}
        >
          {secondary.label}
          {secondary.icon && (
            <secondary.icon className="size-4 shrink-0 transition-transform group-hover:scale-110" />
          )}
        </Button>
      </div>
    );
  }


  return (
    <Button
      disabled={primary.disabled}
      variant={primary.variant === "secondary" ? "outline" : primary.variant}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(primary.mode);
      }}
      className={cn(
        "w-full px-6 h-12 sm:h-12",
        commonBtnClass,
        primary.disabled &&
          "opacity-60 cursor-not-allowed border-dashed bg-muted/30 text-muted-foreground shadow-none",
        primary.variant === "secondary" && "border-dashed",
        className,
      )}
    >
      {primary.label}
      {primary.icon && (
        <primary.icon
          className={cn(
            "size-4 sm:size-5 shrink-0",
            primary.disabled && "opacity-40",
          )}
        />
      )}
    </Button>

  );
};

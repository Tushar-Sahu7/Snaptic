import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AttendanceStepper = ({ step, isFinalized, onStepClick }) => {
  const steps = [
    { id: 1, label: "Select", short: "Select" },
    { id: 2, label: "Scan", short: "Scan" },
    { id: 3, label: "Mark", short: "Mark" },
    { id: 4, label: "Review & Submit", short: "Review" },
  ];

  return (
    <div className="relative max-w-xl mx-auto w-full px-2 sm:px-4">
      {/* Background Line */}
      <div className="absolute top-[16px] sm:top-[18px] left-8 right-8 sm:left-16 sm:right-16 h-[2px] bg-muted z-0">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out origin-left"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between relative z-10">
        {steps.map((s, idx) => {
          const isCompleted = step > s.id;
          const isActive = step === s.id;
          const isClickable =
            !isFinalized &&
            step !== s.id &&
            (s.id < step ||
              (s.id === 2 && step === 3) ||
              (s.id === 3 && step === 4));

          return (
            <button
              key={s.id}
              disabled={!isClickable}
              onClick={() => onStepClick(s.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 sm:gap-2 relative transition-all duration-300 ease-out w-12 sm:w-24",
                isActive && "scale-105",
                !isClickable && "cursor-default",
              )}
            >
              <div
                className={cn(
                  "size-8 sm:size-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold text-[10px] sm:text-xs bg-card ring-offset-2",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary ring-4 ring-primary/10"
                      : "border-muted text-muted-foreground bg-muted/30",
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-4 sm:size-5 stroke-[2.5]" />
                ) : (
                  s.id
                )}
              </div>
              <span
                className={cn(
                  "text-[7px] sm:text-[9px] font-black uppercase tracking-widest sm:tracking-[0.15em] transition-colors whitespace-nowrap",
                  isActive ? "text-primary" : "text-muted-foreground/60",
                )}
              >
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

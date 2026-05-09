import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const AttendanceStepper = ({ step, isFinalized, isSubmitted, onStepClick }) => {
  const steps = [
    { id: 1, label: "Select Class", short: "Select" },
    { id: 2, label: "Recognition", short: "Scan" },
    { id: 3, label: "Manual Mark", short: "Mark" },
    { id: 4, label: "Final Review", short: "Review" },
  ];

  return (
    <nav className="w-full bg-background overflow-x-auto no-scrollbar">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between gap-6 md:gap-12 min-w-max md:min-w-0 max-w-4xl mx-auto">
          {steps.map((s, idx) => {
            const isStep4Done = s.id === 4 && isSubmitted && step === 4;
            const isCompleted = step > s.id || isStep4Done;
            const isActive = step === s.id;
            const isClickable =
              !isFinalized &&
              (s.id < step ||
                (s.id === 2 && step === 3) ||
                (s.id === 3 && step === 4) ||
                (s.id === 4 && isStep4Done)); // Allow clicking step 4 if already on it and submitted

            return (
              <div key={s.id} className="flex items-center gap-6 md:gap-12 flex-1 last:flex-none">
                <button
                  disabled={!isClickable}
                  onClick={() => onStepClick(s.id)}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap relative",
                    isCompleted
                      ? "text-emerald-600"
                      : isActive 
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    isClickable && "cursor-pointer active:scale-95"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-500 z-10",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isActive 
                        ? "bg-foreground text-background"
                        : "bg-muted border border-border"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                    ) : (
                      <span>{s.id}</span>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-0">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Step {s.id}</p>
                    <span className={cn(
                      "font-bold text-[10px] uppercase tracking-widest transition-all duration-500",
                      isActive ? "opacity-100" : "opacity-60"
                    )}>
                      <span className="hidden lg:inline">{s.label}</span>
                      <span className="lg:hidden">{s.short}</span>
                    </span>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="stepper-active"
                      className="absolute inset-0 bg-muted/50 rounded-xl z-0 border border-border/50"
                    />
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] min-w-[10px] max-w-[60px] relative overflow-hidden bg-border/40">
                    {step > s.id && (
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        className="absolute inset-0 bg-emerald-500"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

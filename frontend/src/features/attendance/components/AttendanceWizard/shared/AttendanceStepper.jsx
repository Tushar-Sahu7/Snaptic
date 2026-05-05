import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const AttendanceStepper = ({ step, isFinalized, onStepClick }) => {
  const steps = [
    { id: 1, label: "Select Class", short: "Select" },
    { id: 2, label: "Recognition", short: "Scan" },
    { id: 3, label: "Manual Mark", short: "Mark" },
    { id: 4, label: "Final Review", short: "Review" },
  ];

  return (
    <nav className="w-full bg-white/40 dark:bg-zinc-950/40 backdrop-blur-3xl border-b border-zinc-200/50 dark:border-zinc-900 overflow-x-auto no-scrollbar">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between gap-6 md:gap-12 min-w-max md:min-w-0 max-w-5xl mx-auto">
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
              <div key={s.id} className="flex items-center gap-6 md:gap-12 flex-1 last:flex-none">
                <button
                  disabled={!isClickable}
                  onClick={() => onStepClick(s.id)}
                  className={cn(
                    "group flex items-center gap-4 px-4 py-2.5 rounded-2xl transition-all duration-500 whitespace-nowrap relative",
                    isActive 
                      ? "text-zinc-900 dark:text-zinc-50"
                      : isCompleted
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
                    isClickable && "cursor-pointer active:scale-95"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all duration-700 z-10",
                    isActive 
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl shadow-zinc-900/20 dark:shadow-white/10 rotate-3"
                      : isCompleted
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                    ) : (
                      <span className={cn(isActive && "scale-110")}>{s.id}</span>
                    )}
                  </div>

                  <div className="flex flex-col items-start gap-0.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Step 0{s.id}</p>
                    <span className={cn(
                      "font-black text-[11px] uppercase tracking-widest transition-all duration-500",
                      isActive ? "opacity-100" : "opacity-60"
                    )}>
                      <span className="hidden lg:inline">{s.label}</span>
                      <span className="lg:hidden">{s.short}</span>
                    </span>
                  </div>

                  {isActive && (
                    <motion.div 
                      layoutId="stepper-active"
                      className="absolute inset-0 bg-white dark:bg-zinc-900/50 rounded-2xl -z-0 border border-zinc-200/50 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none"
                    />
                  )}
                </button>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-px min-w-[20px] max-w-[80px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900" />
                    {step > s.id && (
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        className="absolute inset-0 bg-emerald-500/40"
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

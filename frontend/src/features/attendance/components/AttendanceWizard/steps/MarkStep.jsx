import { ChevronRight, RotateCcw, ClipboardEdit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAttendanceCard } from "../shared/StudentAttendanceCard";
import { motion } from "motion/react";

export const MarkStep = ({
  students,
  profiles,
  attendanceState,
  isFinalized,
  loading,
  onMarkManual,
  onBackToScan,
  onConfirm,
}) => {
  return (
    <div className="space-y-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl p-10 lg:p-14 rounded-[56px] border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group"
      >
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-1000" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2.5 rounded-2xl bg-primary/10 shadow-inner">
              <ClipboardEdit className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-70">Step 03 — Manual Calibration</span>
          </div>
          <h3 className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 italic uppercase leading-none">
            Calibration <br /> & Review
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-lg leading-relaxed text-xl">
            Fine-tune recognized records. Tap student cards to toggle status manually before the final verification dashboard.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-5 shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToScan}
            disabled={loading || isFinalized}
            className="h-16 rounded-[28px] border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-[0.2em] text-[10px] px-10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95 group shadow-sm hover:shadow-md"
          >
            <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-700" />
            Recapture
          </Button>
          <Button
            size="lg"
            onClick={onConfirm}
            className="h-16 rounded-[28px] font-black uppercase tracking-[0.2em] text-[11px] px-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xl shadow-zinc-900/30 dark:shadow-white/10 hover:scale-105 transition-all active:scale-95 border-none"
          >
            Proceed to Review
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>

      {!students?.length ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 flex flex-col items-center justify-center text-center space-y-10 rounded-[60px] border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-950/30 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full scale-150 animate-pulse group-hover:bg-primary/30 transition-colors" />
            <div className="relative p-10 rounded-[44px] bg-white dark:bg-zinc-900 text-zinc-300 shadow-2xl border border-zinc-100 dark:border-zinc-800 group-hover:scale-110 transition-transform duration-500">
              <AlertCircle className="w-20 h-20 text-zinc-400 dark:text-zinc-500" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h4 className="font-black text-4xl text-zinc-900 dark:text-zinc-50 italic uppercase tracking-tighter">Empty Roster</h4>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm text-xl leading-relaxed">
              No students are currently enrolled in this specific class session.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={onBackToScan}
            className="h-16 rounded-[24px] border-zinc-200 dark:border-zinc-800 font-black uppercase tracking-widest text-[11px] px-12 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-xl active:scale-95"
          >
            Return to Scanner
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...students]
            .sort((a, b) => {
              const pA = profiles[a._id.toString()];
              const pB = profiles[b._id.toString()];
              const nameA = pA?.name || a.name || a.email?.split("@")[0] || "";
              const nameB = pB?.name || b.name || b.email?.split("@")[0] || "";
              return nameA.localeCompare(nameB);
            })
            .map((student, idx) => {
              const sId = student._id.toString();
              const state = attendanceState[sId] || {
                status: "absent",
                method: "manual",
              };
              const profile = profiles[sId];

              return (
                <motion.div
                  key={sId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: idx * 0.03,
                    duration: 0.5,
                    ease: [0.23, 1, 0.32, 1]
                  }}
                >
                  <StudentAttendanceCard
                    student={student}
                    state={state}
                    profile={profile}
                    isFinalized={isFinalized}
                    loading={loading}
                    onClick={() =>
                      onMarkManual(
                        student._id,
                        state.status === "present" ? "absent" : "present",
                        "manual",
                      )
                    }
                  />
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
};


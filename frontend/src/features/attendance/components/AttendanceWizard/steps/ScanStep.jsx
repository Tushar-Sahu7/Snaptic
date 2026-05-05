import { ChevronRight, SquarePen, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import AttendanceRecognitionStep from "../../AttendanceRecognitionStep";
import { motion } from "motion/react";

export const ScanStep = ({
  session,
  students,
  profiles,
  attendanceState,
  isFinalized,
  loading,
  modelsLoaded,
  faceApi,
  onMarkPresent,
  onComplete,
}) => {
  const presentCount = Object.values(attendanceState).filter(
    (v) => v.status === "present",
  ).length;

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col h-full space-y-8 pb-10">
      {/* Immersive Camera Container */}
      <div className="relative flex-1 rounded-[48px] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-black shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] group">
        <AttendanceRecognitionStep
          students={[...students].sort((a, b) => {
            const pA = profiles[a._id.toString()];
            const pB = profiles[b._id.toString()];
            const nameA = pA?.name || a.name || a.email?.split("@")[0] || "";
            const nameB = pB?.name || b.name || b.email?.split("@")[0] || "";
            return nameA.localeCompare(nameB);
          })}
          profiles={profiles}
          attendanceState={attendanceState}
          onMarkPresent={onMarkPresent}
          onComplete={onComplete}
          sessionData={session}
          modelsLoaded={modelsLoaded}
          faceApi={faceApi}
        />
        
        {/* Detection Overlay - Top Left */}
        <div className="absolute top-8 left-8 flex flex-col gap-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 text-white shadow-2xl"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Recognition Live</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/10 text-white shadow-2xl"
          >
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Auto-Optimizing View</span>
          </motion.div>
        </div>

        {/* Floating Stats - Bottom Right */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-3xl p-6 rounded-[32px] border border-white/10 shadow-2xl space-y-1"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Class Presence</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{presentCount}</span>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">/ {students.length}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[40px] border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
      >
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Step 02</p>
              <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-50 italic uppercase tracking-tight">Active Scanning</h4>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
          
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-xs text-center sm:text-left">
            The system is identifying students in real-time. You can switch to manual marking at any time.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="ghost"
            onClick={onComplete}
            disabled={loading || isFinalized}
            className="flex-1 md:flex-none rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Manual Mark
          </Button>
          <Button
            size="lg"
            onClick={onComplete}
            disabled={loading || isFinalized}
            className="flex-1 md:flex-none rounded-[24px] h-16 px-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-zinc-900/20 dark:shadow-white/5 hover:scale-105 active:scale-95 transition-all"
          >
            Finish & Review
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

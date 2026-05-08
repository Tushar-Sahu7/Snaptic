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
    <div className="flex flex-col h-full space-y-6 pb-10">
      {/* Immersive Camera Container */}
      <div className="relative flex-1 rounded-3xl overflow-hidden border border-border bg-black shadow-sm group">
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
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border text-foreground shadow-sm"
          >
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Live Scan</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-md border border-border text-foreground shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Auto-Optimizing</span>
          </motion.div>
        </div>

        {/* Floating Stats - Bottom Right */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-2 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/80 backdrop-blur-md p-5 rounded-2xl border border-border shadow-sm space-y-0.5"
          >
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Present</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground tabular-nums">{presentCount}</span>
              <span className="text-xs font-medium text-muted-foreground">/ {students.length}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted/30 p-6 rounded-3xl border border-border"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Recognition</p>
              <h4 className="text-lg font-bold text-foreground tracking-tight">Active Scan</h4>
            </div>
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-border" />
          
          <p className="text-xs font-medium text-muted-foreground max-w-xs text-center sm:text-left">
            The system is identifying students in real-time. Switch to manual marking if needed.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="ghost"
            onClick={onComplete}
            disabled={loading || isFinalized}
            className="flex-1 md:flex-none rounded-xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground transition-all"
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Manual
          </Button>
          <Button
            onClick={onComplete}
            disabled={loading || isFinalized}
            className="flex-1 md:flex-none rounded-xl h-12 px-8 bg-foreground text-background font-bold uppercase tracking-widest text-[10px] transition-all"
          >
            Finish & Review
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

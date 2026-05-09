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
      {/* Header matching Step 1 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase">
            Face Scanning
          </h3>
          <p className="text-sm text-muted-foreground font-medium tracking-tight">
            Point the camera at students to automatically mark their attendance.
          </p>
        </div>
        
        <Button 
          onClick={onComplete}
          disabled={loading}
          className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          Finish & Review
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Immersive Camera Container */}
      <div className="relative flex-1 rounded-2xl overflow-hidden border border-border shadow-sm group">
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
      </div>
    </div>
  );
};

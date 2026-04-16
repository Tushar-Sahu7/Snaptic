import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttendanceRecognitionStep from "../../AttendanceRecognitionStep";

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

  return (
    <div className="h-full flex flex-col gap-0 sm:gap-6 max-w-4xl mx-auto px-0">
      <div className="flex-1 flex flex-col sm:flex-none sm:bg-card sm:border sm:rounded-3xl overflow-hidden sm:shadow-sm sm:aspect-video relative">
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
        {/* Mobile Header indicator is now inside AttendanceRecognitionStep */}
      </div>

      <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:bg-card p-2 sm:p-6 rounded-3xl sm:border sm:shadow-sm transition-all sm:hover:shadow-md gap-6 sm:gap-0">
        <div className="flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center px-4 sm:px-0 sm:ml-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight leading-none mb-1">
              Detection
            </span>
            <span className="inline text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
              Real-time scanner active
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-between px-2 sm:px-0">
          <div className="text-right">
            <span className="block text-2xl font-black tabular-nums tracking-tighter leading-none mb-1">
              {presentCount}
              <span className="text-sm text-muted-foreground font-bold ml-1 opacity-40">
                / {students.length}
              </span>
            </span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
              Detected
            </span>
          </div>
          <Button
            onClick={onComplete}
            disabled={loading || isFinalized}
            className="w-full sm:w-auto sm:flex-none rounded-2xl h-14 px-8 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 group"
          >
            {loading ? <Loader2 className="animate-spin mr-2 size-5" /> : null}
            Next Step
            <ChevronRight className="size-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

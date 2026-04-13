import { ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentAttendanceCard } from "../shared/StudentAttendanceCard";

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
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 sm:px-0">
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight leading-none mb-1">
            Manual Review
          </h3>
          <p className="text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">
            Tap a card to override presence
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToScan}
            disabled={loading || isFinalized}
            className="flex-1 sm:flex-none rounded-xl h-11 px-4 font-black uppercase text-[10px] tracking-widest border-2 hover:bg-muted"
          >
            <RotateCcw className="size-3.5 mr-2" />
            Scanner
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 sm:flex-none rounded-xl h-11 px-6 font-black uppercase text-[10px] tracking-[0.15em] shadow-xl shadow-primary/20 group"
          >
            Confirm
            <ChevronRight className="size-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...students]
          .sort((a, b) => {
            const pA = profiles[a._id.toString()];
            const pB = profiles[b._id.toString()];
            const nameA = pA?.name || a.name || a.email?.split("@")[0] || "";
            const nameB = pB?.name || b.name || b.email?.split("@")[0] || "";
            return nameA.localeCompare(nameB);
          })
          .map((student) => {
            const sId = student._id.toString();
            const state = attendanceState[sId] || {
              status: "absent",
              method: "manual",
            };
            const profile = profiles[sId];

            return (
              <StudentAttendanceCard
                key={sId}
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
            );
          })}
      </div>
    </div>
  );
};

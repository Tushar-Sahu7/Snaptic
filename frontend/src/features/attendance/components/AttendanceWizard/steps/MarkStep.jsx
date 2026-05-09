import {
  ChevronRight,
  RotateCcw,
  ClipboardEdit,
  AlertCircle,
} from "lucide-react";
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
    <div className="space-y-10 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-card p-8 lg:p-12 rounded-[40px] border border-border relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="p-2 rounded-xl bg-muted">
              <ClipboardEdit className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Step 03 — Manual Calibration
            </span>
          </div>
          <h3 className="text-4xl font-black tracking-tighter text-foreground leading-tight">
            Calibration <br /> & Review
          </h3>
          <p className="text-muted-foreground font-medium max-w-lg leading-relaxed text-lg">
            Fine-tune recognized records. Tap student cards to toggle status
            manually before the final verification dashboard.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={onBackToScan}
            disabled={loading || isFinalized}
            className="h-14 rounded-2xl border-border font-black uppercase tracking-widest text-[10px] px-8 hover:bg-muted transition-all active:scale-95 group"
          >
            <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-700" />
            Recapture
          </Button>
          <Button
            size="lg"
            onClick={onConfirm}
            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] px-10 bg-foreground text-background hover:opacity-90 transition-all active:scale-95"
          >
            Proceed to Review
            <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </motion.div>

      {!students?.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 flex flex-col items-center justify-center text-center space-y-8 rounded-[40px] border-2 border-dashed border-border bg-muted/30"
        >
          <div className="p-8 rounded-3xl bg-background border border-border text-muted-foreground">
            <AlertCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h4 className="font-black text-2xl text-foreground tracking-tight">
              Empty Class
            </h4>
            <p className="text-muted-foreground font-medium max-w-sm text-base">
              No students are currently enrolled in this specific class session.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={onBackToScan}
            className="h-14 rounded-2xl border-border font-black uppercase tracking-widest text-[10px] px-10 hover:bg-foreground hover:text-background transition-all active:scale-95"
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
                    ease: [0.23, 1, 0.32, 1],
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

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
    <div>

      <div>
        <div>
          <h3>
            Manual Review
          </h3>
          <p>
            Tap a card to override presence
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToScan}
            disabled={loading || isFinalized}
          >
            <RotateCcw />
            Scanner
          </Button>
          <Button
            onClick={onConfirm}
          >
            Confirm
            <ChevronRight />
          </Button>
        </div>
      </div>


      <div>

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

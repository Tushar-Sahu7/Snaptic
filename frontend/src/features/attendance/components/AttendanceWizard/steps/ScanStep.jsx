import { ChevronRight, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
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

  const isMobile = useIsMobile();

  return (
    <div>

      <div>

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

      <div>

        <div>

          <div>

            <span>
              Detection
            </span>
            <span>

              Real-time scanner active
            </span>
          </div>
        </div>

        <div>

          <div>

            <span>

              {presentCount}
              <span>
                / {students.length}
              </span>
            </span>
            <span>
              Detected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onComplete}
              disabled={loading || isFinalized}
              size={isMobile ? "icon" : "default"}
              title="Skip to Manual"
            >
              <SquarePen data-icon={!isMobile ? "inline-start" : undefined} />
              {!isMobile && "Skip to Manual"}
            </Button>
            <Button
              onClick={onComplete}
              disabled={loading || isFinalized}
            >
              {loading ? <Spinner data-icon="inline-start" /> : null}
              Next Step
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </div>

  );
};

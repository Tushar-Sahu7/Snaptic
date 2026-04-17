import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { AttendanceResetButton } from "@/features/attendance/components/AttendanceResetButton";

export const AttendanceHeader = ({
  session,
  isFinalized,
  timeLeft,
  endTimeFormatted,
  step,
}) => {
  const navigate = useNavigate();

  const statusLabel = isFinalized
    ? "Finalized"
    : session?.status === "submitted"
      ? "Submitted"
      : session
        ? "Live"
        : "Not Started";

  return (
    <div>
      <div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/teacher/dashboard")}
        >
          <ArrowLeft />
        </Button>

        <div>
          <div>
            <h2>
              {session?.classId?.name || "Ready to Start"}
            </h2>

            {/* Mobile-only status badge */}
            <div>
              {statusLabel}
            </div>
          </div>

          <div>
            <Clock />
            {!session
              ? "Select a class"
              : isFinalized
                ? "Session Locked"
                : `Live until ${endTimeFormatted || "..."} (${timeLeft})`}
          </div>
        </div>
      </div>


      <div>
        {session && !isFinalized && step > 1 && step < 4 && (
          <AttendanceResetButton
            sessionId={session?._id}
            showLabel
            onSuccess={() => navigate("/teacher/dashboard")}
          />
        )}
        <div>
          {statusLabel}
        </div>
      </div>
    </div>

  );
};

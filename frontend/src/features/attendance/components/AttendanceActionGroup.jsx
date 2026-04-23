import { ButtonGroup } from "@/components/ui/button-group";
import { isWithinSchedule } from "@/lib/utils";
import { PrimaryAttendanceAction } from "./PrimaryAttendanceAction";
import { ManualEntryButton } from "./ManualEntryButton";
import { ViewRecordButton } from "./ViewRecordButton";
import { AttendanceResetButton } from "./AttendanceResetButton";

/**
 * AttendanceActionGroup
 *
 * Layout orchestrator that composes the correct attendance buttons
 * based on the current session state.
 *
 * Composition Matrix:
 * ┌─────────────┬─────────────────────────────────────────────────┐
 * │ Status       │ Buttons                                        │
 * ├─────────────┼─────────────────────────────────────────────────┤
 * │ none         │ <PrimaryAttendanceAction> + <ManualEntryButton>│
 * │ inProgress   │ <PrimaryAttendanceAction> + <ResetButton>      │
 * │ submitted    │ <PrimaryAttendanceAction> + <ViewRecordButton> │
 * │ finalized    │ <PrimaryAttendanceAction>                      │
 * └─────────────┴─────────────────────────────────────────────────┘
 *
 * @param {object}   cls       - The class object.
 * @param {object}   session   - The today session object (or null/undefined).
 * @param {boolean}  showText  - Passed through to all child buttons.
 * @param {string}   size      - Passed through to all child buttons.
 * @param {string}   className - Additional className for the group container.
 */
export const AttendanceActionGroup = ({
  cls,
  session,
  showText = true,
  size,
  className,
}) => {
  if (!cls) return null;

  const status = session?.status;
  const studentCount = cls.studentCount || cls.studentIds?.length || 0;

  // Edge case: No students — only show the primary (which resolves to "Assign Students")
  if (studentCount === 0) {
    return (
      <PrimaryAttendanceAction
        cls={cls}
        session={session}
        showText={showText}
        size={size}
        className={className}
      />
    );
  }

  // Finalized — only primary (resolves to "View Records")
  if (status === "finalized") {
    return (
      <PrimaryAttendanceAction
        cls={cls}
        session={session}
        showText={showText}
        size={size}
        className={className}
      />
    );
  }

  // In-Progress — primary ("Resume") + reset button
  if (status === "inProgress") {
    return (
      <ButtonGroup className={className}>
        <ButtonGroup className="flex-1">
          <PrimaryAttendanceAction
            cls={cls}
            session={session}
            showText={showText}
            size={size}
            className="w-full"
          />
        </ButtonGroup>
        <ButtonGroup>
          <AttendanceResetButton sessionId={session._id} />
        </ButtonGroup>

      </ButtonGroup>
    );
  }

  // Submitted — primary ("Update Record") + view record button
  if (status === "submitted") {
    return (
      <ButtonGroup className={className}>
        <ButtonGroup className="flex-1">
          <PrimaryAttendanceAction
            cls={cls}
            session={session}
            showText={showText}
            size={size}
            className="w-full"
          />
        </ButtonGroup>
        <ButtonGroup>
          <ViewRecordButton
            session={session}
            showText={false}
            variant="outline"
          />
        </ButtonGroup>
      </ButtonGroup>
    );
  }

  // No session yet — check schedule
  const { onTime } = isWithinSchedule(cls.schedule);

  // Off-schedule: just show the disabled primary alone
  if (!onTime) {
    return (
      <PrimaryAttendanceAction
        cls={cls}
        session={session}
        showText={showText}
        size={size}
        className={className}
      />
    );
  }

  // On-time, no session: "Face AI" + "Manual Entry"
  return (
    <ButtonGroup className={className}>
      <ButtonGroup className="flex-1">
        <PrimaryAttendanceAction
          cls={cls}
          session={session}
          showText={showText}
          size={size}
          className="w-full"
        />
      </ButtonGroup>
      <ButtonGroup className="flex-1">
        <ManualEntryButton
          cls={cls}
          showText={showText}
          size={size}
          variant="outline"
          className="w-full"
        />
      </ButtonGroup>
    </ButtonGroup>
  );
};

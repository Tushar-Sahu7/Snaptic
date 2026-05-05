import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { isClassInSession } from "@/lib/utils";
import {
  ScanFace,
  Play,
  Clock,
  AlertCircle,
  SquarePen,
  Eye,
} from "lucide-react";

/**
 * Resolves the button state from the session lifecycle + schedule.
 *
 * Returns: { label, icon, variant, disabled, route }
 *
 * State Matrix:
 * ┌─────────────┬──────────────┬────────────────────┬──────────────────────────────┐
 * │ Session      │ Schedule     │ Label              │ Navigation                   │
 * ├─────────────┼──────────────┼────────────────────┼──────────────────────────────┤
 * │ none         │ onTime       │ Face AI            │ wizard step 2                │
 * │ none         │ before start │ Starts at X:XX     │ disabled                     │
 * │ none         │ after end    │ Not Taken          │ disabled                     │
 * │ inProgress   │ any          │ Resume             │ wizard step 2                │
 * │ submitted    │ any          │ Update Record      │ wizard step 3 (manual)       │
 * │ finalized    │ any          │ View Records       │ session record page          │
 * ├─────────────┼──────────────┼────────────────────┼──────────────────────────────┤
 * │ (no students)│ any          │ Assign Students    │ class detail page            │
 * └─────────────┴──────────────┴────────────────────┴──────────────────────────────┘
 */
function resolveState(cls, session) {
  const studentCount = cls.studentCount || cls.students?.length || cls.studentIds?.length || 0;

  // Edge case: no students enrolled
  if (studentCount === 0) {
    return {
      label: "Assign Students",
      icon: AlertCircle,
      variant: "outline",
      disabled: false,
      route: (classId) => `/teacher/classes/${classId}?action=add-student`,
    };
  }

  // Finalized — always view-only
  if (session?.status === "finalized") {
    return {
      label: "View Records",
      icon: Eye,
      variant: "outline",
      disabled: false,
      // TODO: Replace with the actual session-record route once built
      route: (classId, sessionId) =>
        `/teacher/attendance/${sessionId}/summary`,
    };
  }

  // In-Progress — resume face scan
  if (session?.status === "inprogress") {
    return {
      label: "Resume",
      icon: Play,
      variant: "default",
      disabled: false,
      route: (classId) =>
        `/teacher/classes/${classId}/attendance?autoStart=true`,
    };
  }

  // Submitted — update records via manual mark step
  if (session?.status === "submitted") {
    return {
      label: "Update Record",
      icon: SquarePen,
      variant: "default",
      disabled: false,
      route: (classId) =>
        `/teacher/classes/${classId}/attendance?manual=true`,
    };
  }

  // No session yet — check schedule
  const { onTime, message } = isClassInSession(cls);

  if (onTime) {
    return {
      label: "Face AI",
      icon: ScanFace,
      variant: "default",
      disabled: false,
      route: (classId) =>
        `/teacher/classes/${classId}/attendance?autoStart=true`,
    };
  }

  // Off-schedule (before start, after end, or not scheduled today)
  // isClassInSession returns messages like "Starts at 9:00 AM", "Ended at 10:00 AM", or "Not in session"
  const isAfterEnd = message?.startsWith("Ended at");
  
  let finalLabel = message; // Defaults to "Starts at..." or "Next scheduled for..."
  if (isAfterEnd) {
    finalLabel = "Not Taken";
  }

  return {
    label: finalLabel,
    icon: Clock,
    variant: "secondary",
    disabled: true,
    route: null,
  };
}

/**
 * PrimaryAttendanceAction
 *
 * A smart, self-routing button that reflects the full attendance session lifecycle.
 * Drop it anywhere with `cls` and `session` — it handles the rest.
 *
 * @param {object}   cls       - The class object (must include _id, schedule, studentCount/studentIds).
 * @param {object}   session   - The today session object (or null/undefined if none).
 * @param {boolean}  showText  - Whether to show the label text. Defaults to true.
 * @param {string}   size      - Button size override. Auto-detected from screen width if omitted.
 * @param {function} onClick   - Optional click override. Receives (cls, resolvedState). Return false to prevent navigation.
 * @param {string}   className - Additional className for layout purposes.
 */
export const PrimaryAttendanceAction = ({
  cls,
  session,
  showText = true,
  size,
  onClick,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!cls) return null;

  const state = resolveState(cls, session);
  const resolvedSize = size || (isMobile ? "sm" : "default");

  // When showText is false, use icon-only button sizing
  const buttonSize = showText
    ? resolvedSize
    : isMobile
      ? "icon-sm"
      : "icon";

  const handleClick = (e) => {
    e.stopPropagation();

    if (state.disabled) return;

    // Allow parent to intercept (e.g., inside the Wizard)
    if (onClick) {
      const result = onClick(cls, state);
      if (result === false) return;
    }

    // Self-navigate
    if (state.route) {
      const classId = cls._id;
      const sessionId = session?._id;
      navigate(state.route(classId, sessionId));
    }
  };

  const button = (
    <Button
      size={buttonSize}
      variant={state.variant}
      disabled={state.disabled}
      className={className}
      onClick={handleClick}
      {...props}
    >
      <state.icon data-icon={showText ? "inline-start" : undefined} />
      {showText && state.label}
    </Button>
  );

  // Wrap in tooltip when icon-only for accessibility
  if (!showText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{state.label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};
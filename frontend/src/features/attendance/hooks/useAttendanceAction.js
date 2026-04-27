import { isClassInSession } from "@/lib/utils";
import {
  ScanFace,
  SquarePen,
  Play,
  Clock,
  AlertCircle,
  History,
  Trash2
} from "lucide-react";

/**
 * Hook to compute the attendance action state for a class.
 * Centralizes the logic for splitting vs. single button based on class schedule and current session status.
 */
export const useAttendanceAction = (cls, session) => {
  if (!cls) return { isSplit: false, primary: null, secondary: null };

  const { onTime, message } = isClassInSession(cls, session);
  const studentCount = cls.studentCount || 0;

  // Split logic: Only when On Schedule, No Session exists yet today, and there are students.
  const isSplit = onTime && !session && studentCount > 0;

  let primary = {
    label: "Take Attendance",
    mode: "auto",
    icon: ScanFace,
    variant: "default",
    disabled: false,
    description: null
  };
  let secondary = null;

  // 1. Edge Case: No Students
  if (studentCount === 0) {
    primary = {
      label: "Assign Students First",
      mode: "setup",
      icon: AlertCircle,
      variant: "outline",
      disabled: false,
      classListOnly: true,
      description: "Enroll students to start tracking"
    };
  }
  // 2. Finalized Session (Always History)
  else if (session?.status === "finalized") {
    primary = {
      label: "View Records",
      mode: "history",
      icon: History,
      variant: "outline",
      disabled: false
    };
  }
  // 3. Active Session Logic
  else if (session?.status === "inprogress") {
    primary = {
      label: "Resume Session",
      mode: "manual",
      icon: Play,
      variant: "default",
      disabled: false
    };
    secondary = {
      mode: "reset",
      icon: Trash2,
      variant: "outline",
      iconOnly: true
    };
  }
  // 4. Submitted Session Logic
  else if (session?.status === "submitted") {
    if (onTime) {
      primary = {
        label: "Update Records",
        mode: "manual",
        icon: SquarePen,
        variant: "default",
        disabled: false
      };
      secondary = {
        mode: "reset",
        icon: Trash2,
        variant: "outline",
        iconOnly: true
      };
    } else {
      primary = {
        label: "View Records",
        mode: "history",
        icon: History,
        variant: "outline",
        disabled: false
      };
    }
  }
  // 5. Not Started Logic
  else if (onTime) {
    primary = {
      label: "Face AI",
      mode: "auto",
      icon: ScanFace,
      variant: "default",
      disabled: false
    };
    secondary = {
      label: "Manual Entry",
      mode: "manual",
      icon: SquarePen,
      variant: "outline",
      disabled: false
    };
  }
  // 6. Off-Schedule Logic
  else {
    primary = {
      label: message || "Off Schedule",
      mode: "view",
      icon: Clock,
      variant: "secondary",
      disabled: true
    };
  }

  return {
    isSplit,
    primary,
    secondary,
    studentCount,
    onTime
  };
};

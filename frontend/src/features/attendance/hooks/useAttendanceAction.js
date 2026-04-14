import { isWithinSchedule } from "@/lib/utils";
import {
  Scan,
  Users,
  ChevronRight,
  Clock,
  AlertCircle,
  History
} from "lucide-react";

/**
 * Hook to compute the attendance action state for a class.
 * Centralizes the logic for splitting vs. single button based on class schedule and current session status.
 */
export const useAttendanceAction = (cls, session) => {
  if (!cls) return { isSplit: false, primary: null, secondary: null };

  const { onTime, message } = isWithinSchedule(cls.schedule);
  const studentCount = cls.studentCount || cls.studentIds?.length || 0;

  // Split logic: Only when On Schedule, No Session exists yet today, and there are students.
  const isSplit = onTime && !session && studentCount > 0;

  let primary = {
    label: "Take Attendance",
    mode: "auto",
    icon: Scan,
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
      classListOnly: true, // Hint for ClassListPage
      description: "Enroll students to start tracking"
    };
  }
  // 2. Active Session Logic
  else if (session?.status === "inProgress") {
    primary = {
      label: "Resume Session",
      mode: "auto",
      icon: Scan,
      variant: "default",
      disabled: false
    };
  }
  // 3. Submitted Session Logic
  else if (session?.status === "submitted") {
    if (onTime) {
      primary = {
        label: "Update Records",
        mode: "manual",
        icon: ChevronRight,
        variant: "default",
        disabled: false
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
  // 4. Not Started Logic
  else if (onTime) {
    primary = {
      label: "Recognition",
      mode: "auto",
      icon: Scan,
      variant: "default",
      disabled: false
    };
    secondary = {
      label: "Manual Entry",
      mode: "manual",
      icon: Users,
      variant: "outline",
      disabled: false
    };
  }
  // 5. Off-Schedule Logic
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

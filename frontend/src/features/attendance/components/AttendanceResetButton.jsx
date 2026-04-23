import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { terminateAttendanceSession } from "@/features/attendance/api/attendance.api";

/**
 * AttendanceResetButton
 * 
 * A specialized button that triggers a destructive alert dialog to reset an attendance session.
 * Handles the API call and loading state internally.
 * 
 * @param {string} sessionId - The ID of the session to reset.
 * @param {boolean} showLabel - Whether to show the "Terminate" label.
 * @param {boolean} disabled - Whether the button is disabled.
 */
export const AttendanceResetButton = ({ sessionId, showLabel, disabled, onSuccess, ...props }) => {
  const [pending, setPending] = useState(false);
  const isMobile = useIsMobile();
  const dialogSize = isMobile ? "sm" : "default";

  const handleReset = async (e) => {
    // Prevent event bubbling if the button is used inside another clickable element
    e?.stopPropagation();
    
    if (!sessionId || pending) return;
    
    try {
      setPending(true);
      await terminateAttendanceSession(sessionId);
      
      // Notify the system that attendance has changed
      window.dispatchEvent(new Event("attendance-updated"));
      
      // Call success callback if provided
      onSuccess?.();
    } catch (err) {
      console.error("[AttendanceResetButton] Reset failed:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size={showLabel ? "sm" : (props.size || (isMobile ? "icon-sm" : "icon"))}
          disabled={disabled || pending}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {pending ? (
            <Spinner data-icon={showLabel ? "inline-start" : undefined} />
          ) : (
            <Trash2 data-icon={showLabel ? "inline-start" : undefined} />
          )}
          {showLabel && "Terminate"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size={dialogSize}>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2 />
          </AlertDialogMedia>
          <AlertDialogTitle>Reset attendance?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all records for this session and restart from step 1. 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleReset}
          >
            {isMobile ? "Reset Session" : "Yes, Reset Session"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

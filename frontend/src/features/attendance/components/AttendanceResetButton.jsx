import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
import { resetAttendanceSession } from "@/features/attendance/api/attendance.api";
import { cn } from "@/lib/utils";

/**
 * AttendanceResetButton
 * 
 * A specialized button that triggers a destructive alert dialog to reset an attendance session.
 * Adheres to Luminous Minimalism: Calm, authoritative, and physically heavy.
 */
export const AttendanceResetButton = ({ sessionId, showLabel, disabled, onSuccess, ...props }) => {
  const [pending, setPending] = useState(false);
  const isMobile = useIsMobile();
  const dialogSize = isMobile ? "sm" : "default";

  const handleReset = async (e) => {
    e?.stopPropagation();
    if (!sessionId || pending) return;
    
    try {
      setPending(true);
      await resetAttendanceSession(sessionId);
      window.dispatchEvent(new Event("attendance-updated"));
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
          variant="secondary"
          className={cn(
            "transition-all duration-300 ease-out-expo active:scale-95",
            showLabel && "px-4"
          )}
          size={showLabel ? "sm" : (props.size || (isMobile ? "icon-sm" : "icon"))}
          disabled={disabled || pending}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {pending ? (
            <Spinner data-icon={showLabel ? "inline-start" : undefined} />
          ) : (
            <RotateCcw className={cn("w-4 h-4", showLabel && "mr-2")} />
          )}
          {showLabel && "Reset Session"}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent 
        size={dialogSize} 
        className="border-none shadow-2xl bg-white/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 ease-out-expo"
      >
        <AlertDialogHeader className="space-y-4">
          <AlertDialogMedia className="bg-destructive/5 text-destructive w-12 h-12 rounded-full flex items-center justify-center border border-destructive/10">
            <RotateCcw className="w-6 h-6" />
          </AlertDialogMedia>
          <div className="space-y-1">
            <AlertDialogTitle className="font-serif text-2xl tracking-tight text-foreground">
              Reset biometric records?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-sans leading-relaxed">
              This will permanently delete all attendance marks for this session. The session will move back to scheduled, allowing for a fresh scan.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            className="border-none bg-secondary/50 hover:bg-secondary text-foreground transition-colors"
          >
            Keep records
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="font-sans font-medium px-6 active:scale-95 transition-transform"
            onClick={handleReset}
          >
            {pending ? "Resetting..." : "Confirm Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

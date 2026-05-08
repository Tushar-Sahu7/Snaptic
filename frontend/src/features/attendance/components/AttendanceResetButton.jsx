import { useState } from "react";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { resetAttendanceSession } from "@/features/attendance/api/attendance.api";
import { cn } from "@/lib/utils";

/**
 * AttendanceResetButton
 * 
 * A specialized button that triggers a confirmation dialog to reset an attendance session.
 * Matches the premium destructive dialog design used in ClassDeleteDialog.
 */
export const AttendanceResetButton = ({ sessionId, showLabel, disabled, onSuccess, ...props }) => {
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const resolvedSize = props.size || (isMobile ? "default" : "xl");
  const buttonSize = showLabel ? "sm" : (resolvedSize === "xl" ? "icon-xl" : resolvedSize === "lg" ? "icon-lg" : resolvedSize === "sm" ? "icon-sm" : "icon");

  const handleReset = async (e) => {
    e?.stopPropagation();
    if (!sessionId || pending) return;
    
    try {
      setPending(true);
      await resetAttendanceSession(sessionId);
      window.dispatchEvent(new Event("attendance-updated"));
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("[AttendanceResetButton] Reset failed:", err);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "transition-all duration-300 ease-out-expo active:scale-95",
            showLabel && "px-4"
          )}
          size={buttonSize}
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
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
        <div className="p-8 space-y-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-destructive">
                Reset Session?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                You are about to permanently clear all biometric records for this session.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border/50">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground/80">
              This action cannot be undone. All student attendance marks and 
              face scan history for this specific session will be permanently erased.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={pending}
              className="h-12 flex-1 rounded-xl font-black tracking-tight text-primary-foreground shadow-lg shadow-destructive/10 active:scale-95 transition-all"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 animate-spin w-4 h-4" />
                  Resetting...
                </>
              ) : (
                "Reset Permanently"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

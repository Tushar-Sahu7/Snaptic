import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResetSession } from "../hooks/useAttendance";
import { cn } from "@/lib/utils";

/**
 * AttendanceResetButton
 * 
 * A specialized button that triggers a destructive alert dialog to reset an attendance session.
 * Uses TanStack Query for mutation and follows the premium design from ClassDeleteDialog.
 */
export const AttendanceResetButton = ({ sessionId, showLabel, disabled, onSuccess, ...props }) => {
  const isMobile = useIsMobile();
  const resetMutation = useResetSession();

  const resolvedSize = props.size || (isMobile ? "default" : "xl");
  const buttonSize = showLabel ? "sm" : (resolvedSize === "xl" ? "icon-xl" : resolvedSize === "lg" ? "icon-lg" : resolvedSize === "sm" ? "icon-sm" : "icon");

  const handleReset = async () => {
    if (!sessionId || resetMutation.isPending) return;
    
    try {
      await resetMutation.mutateAsync(sessionId);
      onSuccess?.();
    } catch (err) {
      console.error("[AttendanceResetButton] Reset failed:", err);
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
          size={buttonSize}
          disabled={disabled || resetMutation.isPending}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {resetMutation.isPending ? (
            <Spinner data-icon={showLabel ? "inline-start" : undefined} />
          ) : (
            <RotateCcw className={cn("w-4 h-4", showLabel && "mr-2")} />
          )}
          {showLabel && "Reset Session"}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
        <div className="p-8 space-y-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogHeader className="p-0 text-left">
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-destructive">
                Reset Session?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                You are about to permanently clear all biometric records for this session.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border/50">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground/80">
              This action cannot be undone. All student attendance marks and 
              face scan history for this specific session will be permanently erased.
            </p>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
            <AlertDialogCancel asChild>
              <Button
                variant="ghost"
                disabled={resetMutation.isPending}
                className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
              >
                Keep records
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={resetMutation.isPending}
                className="h-12 flex-1 rounded-xl font-black tracking-tight text-primary-foreground shadow-lg shadow-destructive/10 active:scale-95 transition-all"
              >
                {resetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 animate-spin w-4 h-4" />
                    Resetting...
                  </>
                ) : (
                  "Reset Permanently"
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

import { AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TerminateDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm,
  title = "Terminate Session?",
  description = "This will permanently delete all records for this session. This action cannot be undone.",
  actionLabel = "Yes, Terminate Session",
  cancelLabel = "Wait, Keep Session"
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92%] sm:max-w-sm rounded-[2.5rem] border-2 p-6 sm:p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg sm:text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="size-5 sm:size-6 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm font-medium leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 mt-4 sm:mt-6">
          <AlertDialogAction 
            onClick={onConfirm}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground h-11 sm:h-12 font-black uppercase text-[10px] sm:text-xs tracking-widest w-full"
          >
            {actionLabel}
          </AlertDialogAction>
          <AlertDialogCancel className="rounded-xl border-2 h-11 sm:h-12 font-black uppercase text-[10px] sm:text-xs tracking-widest w-full mt-0">
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

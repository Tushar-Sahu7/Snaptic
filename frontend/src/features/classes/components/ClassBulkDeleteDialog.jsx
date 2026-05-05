import { useState } from "react";
import { bulkDeleteClasses } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function BulkDeleteClassesDialog({
  open,
  onOpenChange,
  count,
  classIds,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await bulkDeleteClasses(classIds);
      toast.success(
        `${count} ${count === 1 ? "class" : "classes"} deleted successfully`
      );
      onDeleted?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete classes"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-background">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <AlertDialogHeader className="p-0 text-left">
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">
                Bulk Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
                You are about to delete <span className="text-foreground font-bold">{count} {count === 1 ? "class" : "classes"}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-muted/50 border border-border">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              This will permanently delete the selected classes and remove all students from their rosters. This action <span className="text-destructive font-bold uppercase tracking-tight">cannot be undone</span>.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="p-6 bg-muted/30 border-t border-border sm:justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-11 px-6 rounded-xl font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-destructive/20 transition-all active:scale-[0.98]"
          >
            {deleting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              `Delete ${count} ${count === 1 ? "Class" : "Classes"}`
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

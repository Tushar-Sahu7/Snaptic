import { useState } from "react";
import { deleteClass } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteClassDialog({
  open,
  onOpenChange,
  classData,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteClass(classData._id);

      toast.success(`Class "${classData.name}" deleted successfully`);

      window.dispatchEvent(new CustomEvent("classes-updated"));
      onDeleted?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete class"
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-background">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                Delete Class?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                You are about to remove <span className="text-foreground font-bold">"{classData?.name}"</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-muted/50 border border-border">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
              This will remove the class and all students from the roster. You can temporarily undo this action from the notification toast that appears after deletion.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t border-border sm:justify-end gap-3">
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
              "Delete Permanently"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

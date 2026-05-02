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
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950">
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive shadow-sm">
              <AlertTriangle size={24} />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Delete Class?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                You are about to remove <span className="text-zinc-900 dark:text-zinc-200 font-bold">"{classData?.name}"</span>.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
              This will remove the class and all students from the roster. You can temporarily undo this action from the notification toast that appears after deletion.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-900 sm:justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="h-11 px-6 rounded-xl font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all"
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

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
import { Trash2, Loader2 } from "lucide-react";

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
      toast.error(err.response?.data?.message || "Failed to delete class");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
        <div className="p-8 space-y-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-2xl font-black tracking-tight text-destructive">
                Delete Class?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                You are about to permanently remove{" "}
                <span className="text-foreground font-bold underline underline-offset-4 decoration-destructive/20">
                  "{classData?.name}"
                </span>
                .
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 rounded-2xl bg-muted/40 border border-border/50">
            <p className="text-xs font-medium leading-relaxed text-muted-foreground/80">
              This action cannot be undone. All student records, attendance
              history, and configuration for this class will be permanently
              erased.
            </p>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
              className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="h-12 flex-1 rounded-xl font-black tracking-tight text-primary-foreground shadow-lg shadow-destructive/10 active:scale-95 transition-all"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 animate-spin w-4 h-4" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

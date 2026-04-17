import { useState } from "react";
import { deleteClass, restoreClasses } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      
      toast.success(`Class "${classData.name}" deleted successfully`, {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await restoreClasses([classData._id]);
              toast.success("Class restored");
              window.dispatchEvent(new CustomEvent("classes-updated"));
              onDeleted?.(); // Trigger refresh
            } catch {
              toast.error("Failed to restore class");
            }
          }
        }
      });
      
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
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            Delete "{classData?.name}"?
          </DialogTitle>

          <DialogDescription>
            This will remove the class and all students from the roster. 
            You can temporarily undo this action from the notification toast.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { deleteClass, restoreClasses } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete "{classData?.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the class and all students from the roster. 
            You can temporarily undo this action from the notification toast.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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
      toast.success(`${count} ${count === 1 ? "class" : "classes"} deleted successfully`);
      onDeleted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete classes");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {count} {count === 1 ? "class" : "classes"} permanently?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the selected classes and remove all students from
            their rosters. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

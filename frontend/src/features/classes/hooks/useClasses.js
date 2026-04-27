import { useState, useEffect, useCallback } from "react";
import { 
  fetchClasses, 
  updateClass, 
  bulkUpdateClassStatus, 
  restoreClasses,
  bulkDeleteClasses 
} from "@/features/classes/api/classes.api";
import { toast } from "sonner";

export function useClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadClasses = useCallback(async () => {
    try {
      const { data } = await fetchClasses();
      setClasses(data.classes);
    } catch {
      // silently fail — empty list shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
    window.addEventListener("classes-updated", loadClasses);
    return () => window.removeEventListener("classes-updated", loadClasses);
  }, [loadClasses]);

  const toggleArchive = useCallback(async (cls, endDate) => {
    const newStatus = cls.status === "archived" ? "active" : "archived";
    try {
      await updateClass(cls._id, { status: newStatus, endDate });
      
      const successMsg = `Class "${cls.name}" ${newStatus === "archived" ? "archived" : "unarchived"} successfully`;
      
      toast.success(successMsg, {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              const undoStatus = newStatus === "archived" ? "active" : "archived";
              await updateClass(cls._id, { status: undoStatus });
              toast.success("Action undone");
              loadClasses();
            } catch {
              toast.error("Failed to undo action");
            }
          }
        }
      });
      loadClasses();
    } catch (err) {
      toast.error("Failed to update class status");
    }
  }, [loadClasses]);

  const bulkUnarchiveAll = useCallback(async (ids, endDate) => {
    if (ids.length === 0) return;
    try {
      await bulkUpdateClassStatus(ids, "active", endDate);
      toast.success(`${ids.length} classes moved to active`, {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await bulkUpdateClassStatus(ids, "archived");
              toast.success("Bulk unarchive undone");
              loadClasses();
            } catch {
              toast.error("Failed to undo bulk unarchive");
            }
          }
        }
      });
      loadClasses();
    } catch (err) {
      toast.error("Failed to unarchive classes");
    }
  }, [loadClasses]);

  const bulkDeleteAll = useCallback(async (ids) => {
    if (ids.length === 0) return;
    try {
      await bulkDeleteClasses(ids);
      toast.success(`${ids.length} classes deleted`, {
        description: "They can be restored shortly",
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              await restoreClasses(ids);
              toast.success("Bulk delete undone");
              loadClasses();
            } catch {
              toast.error("Failed to restore classes");
            }
          }
        }
      });
      loadClasses();
    } catch (err) {
      toast.error("Failed to delete classes");
    }
  }, [loadClasses]);

  return {
    classes,
    loading,
    refresh: loadClasses,
    toggleArchive,
    bulkUnarchiveAll,
    bulkDeleteAll
  };
}

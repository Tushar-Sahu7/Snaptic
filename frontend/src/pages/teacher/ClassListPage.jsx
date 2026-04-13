import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useClasses } from "@/features/classes/hooks/useClasses";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  MoreVertical, 
  UserCheck, 
  History, 
  UserPlus, 
  Pencil, 
  ArchiveRestore, 
  Archive, 
  Trash2 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Shared Components
import ClassCard from "@/components/shared/ClassCard";
import { isWithinSchedule, WEEKDAYS } from "@/lib/utils";

// Decomposed Page Components
import ClassListHeader from "@/features/classes/components/ClassListHeader";
import ClassFormModal from "@/features/classes/components/ClassFormModal";
import ClassDeleteDialog from "@/features/classes/components/ClassDeleteDialog";

export default function ClassListPage() {
  const navigate = useNavigate();
  const { 
    classes, 
    loading, 
    refresh, 
    toggleArchive, 
    bulkUnarchiveAll, 
    bulkDeleteAll 
  } = useClasses();

  // Local State
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [deleteClassState, setDeleteClassState] = useState(null);
  const [bulkUnarchiveConfirm, setBulkUnarchiveConfirm] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Memoized Filtering & Sorting
  const filteredClasses = useMemo(() => {
    const filtered = classes.filter((cls) => {
      const isCorrectTab = tab === "active" ? cls.status === "active" : cls.status === "archived";
      if (!isCorrectTab) return false;

      if (search) {
        const query = search.toLowerCase();
        return (
          cls.name.toLowerCase().includes(query)
        );
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const { onTime: onTimeA } = isWithinSchedule(a.schedule);
      const { onTime: onTimeB } = isWithinSchedule(b.schedule);

      const getPriority = (c, onTime) => {
        if (onTime) return 3;

        // Check if scheduled for today but hasn't started
        if (c.schedule?.days && c.schedule.startTime) {
          const now = new Date();
          const currentDay = WEEKDAYS[now.getDay() === 0 ? 6 : now.getDay() - 1];
          if (c.schedule.days.includes(currentDay)) {
            const [sh, sm] = c.schedule.startTime.split(":").map(Number);
            const [ch, cm] = [now.getHours(), now.getMinutes()];
            const startTotal = sh * 60 + sm;
            const currentTotal = ch * 60 + cm;
            
            if (currentTotal < startTotal) return 2;
          }
          return 1; // Future scheduled
        }
        return 0; // No schedule
      };

      const prioA = getPriority(a, onTimeA);
      const prioB = getPriority(b, onTimeB);

      if (prioA !== prioB) return prioB - prioA;

      // Tie-break 1: Start Time (if same priority)
      if (a.schedule?.startTime && b.schedule?.startTime) {
        if (a.schedule.startTime !== b.schedule.startTime) {
          return a.schedule.startTime.localeCompare(b.schedule.startTime);
        }
      }

      // Tie-break 2: Name
      return a.name.localeCompare(b.name);
    });
  }, [classes, tab, search]);

  // Bulk Handlers
  const handleBulkUnarchive = async () => {
    setProcessing(true);
    await bulkUnarchiveAll(filteredClasses.map(c => c._id));
    setProcessing(false);
    setBulkUnarchiveConfirm(false);
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    await bulkDeleteAll(filteredClasses.map(c => c._id));
    setProcessing(false);
    setBulkDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 md:px-0 md:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
      <ClassListHeader
        tab={tab}
        onTabChange={setTab}
        search={search}
        onSearchChange={setSearch}
        onCreateClick={() => setCreateOpen(true)}
        onUnarchiveAll={() => setBulkUnarchiveConfirm(true)}
        onDeleteAll={() => setBulkDeleteConfirm(true)}
        canBulkAction={filteredClasses.length > 0}
        hasSearchQuery={!!search}
      />

      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onClick={(id) => navigate(`/teacher/classes/${id}`)}
              actions={
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1.5 rounded-lg">
                        <MoreVertical className="size-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl font-medium shadow-xl">

                      <DropdownMenuItem
                        onClick={() => navigate(`/teacher/classes/${cls._id}?tab=history`)}
                      >
                        <History className="size-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      {cls.status !== "archived" && (
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/teacher/classes/${cls._id}?action=add-student`)
                          }
                        >
                          <UserPlus className="size-4 mr-2" />
                          Add Student
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {cls.status !== "archived" && (
                        <DropdownMenuItem onClick={() => setEditClass(cls)}>
                          <Pencil className="size-4 mr-2" />
                          Edit Class
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => toggleArchive(cls)}>
                        {cls.status === "archived" ? (
                          <>
                            <ArchiveRestore className="size-4 mr-2" />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive className="size-4 mr-2" />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteClassState(cls)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
              footer={
                cls.status !== "archived" && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/teacher/take-attendance");
                    }}
                    className="w-full rounded-xl font-black h-10 uppercase text-[10px] tracking-widest gap-2 shadow-sm"
                  >
                    Take Attendance
                    <UserCheck className="size-3.5" />
                  </Button>
                )
              }
            />
          ))}
        </div>
      ) : (
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>
              {classes.length === 0
                ? "No classes yet"
                : search
                  ? "No results found"
                  : tab === "archived"
                    ? "Nothing archived"
                    : "No active classes"}
            </EmptyTitle>
            <EmptyDescription>
              {classes.length === 0
                ? "Create your first class to start managing students and attendance."
                : search
                  ? `We couldn't find any classes matching "${search}".`
                  : tab === "archived"
                    ? "Classes you archive will appear here."
                    : "You don't have any active classes right now."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {tab !== "archived" && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus data-icon="inline-start" />
                Create Class
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}

      {/* Modals & Dialogs */}
      <ClassFormModal 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={refresh} 
      />
      
      <ClassFormModal
        open={!!editClass}
        onOpenChange={(open) => !open && setEditClass(null)}
        classData={editClass}
        onSuccess={refresh}
      />

      <ClassDeleteDialog
        open={!!deleteClassState}
        onOpenChange={(open) => !open && setDeleteClassState(null)}
        classData={deleteClassState}
        onDeleted={refresh}
      />

      {/* Bulk Action Dialogs */}
      <Dialog open={bulkUnarchiveConfirm} onOpenChange={setBulkUnarchiveConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle>Unarchive {filteredClasses.length} classes?</DialogTitle>
            <DialogDescription>
              These classes will be moved back to your Active tab for everyone to see.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBulkUnarchiveConfirm(false)} 
              disabled={processing}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={handleBulkUnarchive} disabled={processing} className="w-full sm:w-auto rounded-xl">
              {processing ? "Unarchiving..." : "Unarchive All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-destructive flex items-center gap-2">
              Delete {filteredClasses.length} archived classes?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete these classes and their student rosters. This action cannot be undone (except via the temporary Undo button).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2">
            <Button 
              variant="outline" 
              onClick={() => setBulkDeleteConfirm(false)} 
              disabled={processing}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkDelete} 
              disabled={processing}
              variant="destructive"
              className="w-full sm:w-auto rounded-xl"
            >
              {processing ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

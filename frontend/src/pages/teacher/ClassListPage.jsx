import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { toast } from "sonner";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  MoreVertical,
  History,
  UserPlus,
  Pencil,
  ArchiveRestore,
  Archive,
  Trash2,
  Calendar,
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
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import { isClassInSession, WEEKDAYS } from "@/lib/utils";
import { useTodayAttendance } from "@/features/attendance/hooks/useTodayAttendance";

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
    bulkDeleteAll,
  } = useClasses();

  const { todaySessions } = useTodayAttendance();

  // Local State
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [deleteClassState, setDeleteClassState] = useState(null);
  const [bulkUnarchiveConfirm, setBulkUnarchiveConfirm] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [unarchiveClass, setUnarchiveClass] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bulkEndDate, setBulkEndDate] = useState("");

  // Memoized Filtering & Sorting
  const filteredClasses = useMemo(() => {
    const filtered = classes.filter((cls) => {
      const isCorrectTab =
        tab === "active" ? cls.status === "active" : cls.status === "archived";
      if (!isCorrectTab) return false;

      if (search) {
        const query = search.toLowerCase();
        return cls.name.toLowerCase().includes(query);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const { onTime: onTimeA } = isClassInSession(a);
      const { onTime: onTimeB } = isClassInSession(b);

      const getPriority = (c, onTime) => {
        if (onTime) return 3;

        // Check if scheduled for today
        const now = new Date();
        const currentDayInt = now.getDay() === 0 ? 7 : now.getDay();
        const hasToday = c.schedules?.some(s => s.days.includes(currentDayInt));
        
        if (hasToday) return 2;
        return 1;
      };

      const prioA = getPriority(a, onTimeA);
      const prioB = getPriority(b, onTimeB);

      if (prioA !== prioB) return prioB - prioA;

      // Tie-break: Name
      return a.name.localeCompare(b.name);
    });
  }, [classes, tab, search]);

  // Bulk Handlers
  const handleBulkUnarchive = async () => {
    if (!bulkEndDate) {
      toast.error("Please select an end date for these classes");
      return;
    }
    setProcessing(true);
    await bulkUnarchiveAll(filteredClasses.map((c) => c._id), bulkEndDate);
    setProcessing(false);
    setBulkUnarchiveConfirm(false);
    setBulkEndDate("");
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    await bulkDeleteAll(filteredClasses.map((c) => c._id));
    setProcessing(false);
    setBulkDeleteConfirm(false);
  };



  if (loading) {
    return (
      <div>
        <div>
          <Skeleton />
          <Skeleton />
        </div>
        <div>
          <Skeleton />
          <Skeleton />
        </div>
        <div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>

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
        <div>

          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onClick={(id) => navigate(`/teacher/classes/${id}`)}
              actions={
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                    >

                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/teacher/classes/${cls._id}?tab=history`)
                        }
                      >
                        <History />
                        View History
                      </DropdownMenuItem>

                      {cls.status !== "archived" && (
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(
                              `/teacher/classes/${cls._id}?action=add-student`,
                            )
                          }
                        >
                          <UserPlus />
                          Add Student
                        </DropdownMenuItem>

                      )}
                      <DropdownMenuSeparator />
                      {cls.status !== "archived" && (
                        <DropdownMenuItem onClick={() => setEditClass(cls)}>
                          <Pencil />
                          Edit Class
                        </DropdownMenuItem>

                      )}
                      <DropdownMenuItem onClick={() => {
                        if (cls.status === "archived") {
                          setUnarchiveClass(cls);
                        } else {
                          toggleArchive(cls);
                        }
                      }}>
                        {cls.status === "archived" ? (
                          <>
                            <ArchiveRestore />
                            Unarchive
                          </>
                        ) : (
                          <>
                            <Archive />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteClassState(cls)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
              footer={
                cls.status !== "archived" && (
                  <AttendanceActionGroup
                    cls={cls}
                    session={todaySessions[cls._id]}
                    className="w-full"
                  />
                )
              }
            />
          ))}
        </div>
      ) : (
        <Empty>

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
                <Plus />
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
      <Dialog
        open={bulkUnarchiveConfirm}
        onOpenChange={setBulkUnarchiveConfirm}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>

            <DialogTitle>
              Unarchive {filteredClasses.length} classes?
            </DialogTitle>
            <DialogDescription>
              These classes will be moved back to your Active tab. Since they
              were archived, you must set a new end date for all of them to
              resume attendance tracking.
            </DialogDescription>
            <div className="pt-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Calendar size={10} /> New End Date
              </span>
              <Input
                type="date"
                value={bulkEndDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </DialogHeader>
          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setBulkUnarchiveConfirm(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkUnarchive}
              disabled={processing}
            >
              {processing ? "Unarchiving..." : "Unarchive All"}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!unarchiveClass} onOpenChange={(open) => !open && setUnarchiveClass(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Unarchive Class</DialogTitle>
            <DialogDescription>
              To unarchive <b>{unarchiveClass?.name}</b>, please set a new end date to resume session tracking.
            </DialogDescription>
            <div className="pt-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Calendar size={10} /> New End Date
              </span>
              <Input
                type="date"
                value={bulkEndDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnarchiveClass(null)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!bulkEndDate) return toast.error("Please select an end date");
              setProcessing(true);
              await toggleArchive(unarchiveClass, bulkEndDate);
              setProcessing(false);
              setUnarchiveClass(null);
              setBulkEndDate("");
            }} disabled={processing}>
              {processing ? "Unarchiving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>

              Delete {filteredClasses.length} archived classes?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete these classes and their student
              rosters. This action cannot be undone (except via the temporary
              Undo button).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => setBulkDeleteConfirm(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDelete}
              disabled={processing}
              variant="destructive"
            >
              {processing ? "Deleting..." : "Delete Permanently"}
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

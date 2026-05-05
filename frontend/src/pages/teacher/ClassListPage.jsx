import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

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
  Radio,
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
import ClassDeleteDialog from "@/features/classes/components/ClassDeleteDialog";
import ClassFormDialog from "@/features/classes/components/ClassFormDialog";

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
  const debouncedSearch = useDebounce(search, 300);
  const [viewType, setViewType] = useState("grid"); // 'grid' | 'list'
  
  const [deleteClassState, setDeleteClassState] = useState(null);
  const [bulkUnarchiveConfirm, setBulkUnarchiveConfirm] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [unarchiveClass, setUnarchiveClass] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bulkEndDate, setBulkEndDate] = useState("");
  
  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  // Memoized Filtering & Sorting
  const filteredClasses = useMemo(() => {
    const filtered = (classes || []).filter((cls) => {
      const isCorrectTab =
        tab === "active" ? cls.status === "active" : cls.status === "archived";
      if (!isCorrectTab) return false;

      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        return cls.name.toLowerCase().includes(query);
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const { onTime: onTimeA } = isClassInSession(a);
      const { onTime: onTimeB } = isClassInSession(b);

      const getPriority = (c, onTime) => {
        if (onTime) return 3;

        const currentDay = new Date().getDay(); // 0-6 (Sun-Sat)
        const hasToday = c.daysOfWeek?.includes(currentDay);
        
        if (hasToday) return 2;
        return 1;
      };

      const prioA = getPriority(a, onTimeA);
      const prioB = getPriority(b, onTimeB);

      if (prioA !== prioB) return prioB - prioA;

      // Tie-break: Name
      return a.name.localeCompare(b.name);
    });
  }, [classes, tab, debouncedSearch]);

  // Featured Class: The one that is either "Live Now" or coming up next today
  const featuredClass = useMemo(() => {
    if (tab !== "active" || debouncedSearch || filteredClasses.length < 2) return null;
    
    // Find first one that is Live or Today
    return filteredClasses.find(c => {
      const { onTime } = isClassInSession(c);
      if (onTime) return true;
      
      const currentDay = new Date().getDay();
      return c.daysOfWeek?.includes(currentDay);
    });
  }, [filteredClasses, tab, debouncedSearch]);

  const remainingClasses = useMemo(() => {
    if (!featuredClass) return filteredClasses;
    return filteredClasses.filter(c => c._id !== featuredClass._id);
  }, [filteredClasses, featuredClass]);

  // Bulk Handlers
  const handleBulkUnarchive = async () => {
    if (!bulkEndDate) {
      toast.error("Please select an end date for these classes");
      return;
    }
    setProcessing(true);
    try {
      await bulkUnarchiveAll(filteredClasses.map((c) => c._id), bulkEndDate);
      setBulkUnarchiveConfirm(false);
      setBulkEndDate("");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    try {
      await bulkDeleteAll(filteredClasses.map((c) => c._id));
      setBulkDeleteConfirm(false);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ClassListHeader
        tab={tab}
        onTabChange={setTab}
        search={search}
        onSearchChange={setSearch}
        onCreateClick={() => {
          setEditingClass(null);
          setFormDialogOpen(true);
        }}
        onUnarchiveAll={() => setBulkUnarchiveConfirm(true)}
        onDeleteAll={() => setBulkDeleteConfirm(true)}
        canBulkAction={filteredClasses.length > 0}
        hasSearchQuery={!!search}
        viewType={viewType}
        onViewTypeChange={setViewType}
      />

      {filteredClasses.length > 0 ? (
        <div className="mt-12 space-y-12">
          {featuredClass && (
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground px-2">
                Featured Session
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <ClassCard
                    cls={featuredClass}
                    onClick={(id) => navigate(`/teacher/classes/${id}`)}
                    className="h-full border-primary/20 shadow-xl shadow-primary/5"
                    actions={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${featuredClass._id}?tab=history`)}>
                            <History className="mr-2 w-4 h-4" /> View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setEditingClass(featuredClass);
                            setFormDialogOpen(true);
                          }}>
                            <Pencil className="mr-2 w-4 h-4" /> Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleArchive(featuredClass)}>
                            <Archive className="mr-2 w-4 h-4" /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteClassState(featuredClass)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    }
                    footer={
                      <AttendanceActionGroup
                        cls={featuredClass}
                        session={todaySessions[featuredClass._id]}
                        className="w-full"
                      />
                    }
                  />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="flex-1 rounded-[2.5rem] bg-muted/30 border border-border/40 p-8 flex flex-col justify-center gap-4 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <Radio className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Today's Focus</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This class is either live or starting soon. Quick access to attendance and student rosters is prioritized here.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                {featuredClass ? "Other Classes" : tab === "active" ? "Active Classes" : "Archived Classes"}
              </h2>
            </div>

            <div className={cn(
              "grid gap-6",
              viewType === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {remainingClasses.map((cls) => (
                <ClassCard
                  key={cls._id}
                  cls={cls}
                  layout={viewType}
                  onClick={(id) => navigate(`/teacher/classes/${id}`)}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${cls._id}?tab=history`)}>
                          <History className="mr-2 w-4 h-4" /> View History
                        </DropdownMenuItem>
                        {cls.status !== "archived" && (
                          <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${cls._id}?action=add-student`)}>
                            <UserPlus className="mr-2 w-4 h-4" /> Add Student
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {cls.status !== "archived" && (
                          <DropdownMenuItem onClick={() => {
                            setEditingClass(cls);
                            setFormDialogOpen(true);
                          }}>
                            <Pencil className="mr-2 w-4 h-4" /> Edit Class
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
                            <><ArchiveRestore className="mr-2 w-4 h-4" /> Unarchive</>
                          ) : (
                            <><Archive className="mr-2 w-4 h-4" /> Archive</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDeleteClassState(cls)} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  footer={
                    cls.status !== "archived" && viewType === "grid" && (
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
          </div>
        </div>
      ) : (
        <Empty className="mt-20">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="w-12 h-12 text-muted-foreground" />
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
              <Button onClick={() => navigate("/teacher/classes/create")} className="rounded-full px-6">
                <Plus className="mr-2 w-4 h-4" /> Create Class
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}



      <ClassDeleteDialog
        open={!!deleteClassState}
        onOpenChange={(open) => !open && setDeleteClassState(null)}
        classData={deleteClassState}
        onDeleted={refresh}
      />

      <ClassFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        classData={editingClass}
        onSuccess={refresh}
      />

      {/* Bulk Action Dialogs */}
      <Dialog open={bulkUnarchiveConfirm} onOpenChange={setBulkUnarchiveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unarchive {filteredClasses.length} classes?</DialogTitle>
            <DialogDescription>
              These classes will be moved back to your Active tab. You must set a new end date to resume tracking.
            </DialogDescription>
            <div className="pt-4 space-y-2">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> NEW END DATE
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
            <Button variant="outline" onClick={() => setBulkUnarchiveConfirm(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleBulkUnarchive} disabled={processing}>
              {processing ? "Unarchiving..." : "Unarchive All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!unarchiveClass} onOpenChange={(open) => !open && setUnarchiveClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unarchive Class</DialogTitle>
            <DialogDescription>
              Set a new end date for <b>{unarchiveClass?.name}</b> to resume session tracking.
            </DialogDescription>
            <div className="pt-4 space-y-2">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> NEW END DATE
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
              try {
                await toggleArchive(unarchiveClass, bulkEndDate);
                setUnarchiveClass(null);
                setBulkEndDate("");
              } finally {
                setProcessing(false);
              }
            }} disabled={processing}>
              {processing ? "Unarchiving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {filteredClasses.length} archived classes?</DialogTitle>
            <DialogDescription>
              This will permanently delete these classes and their student rosters. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteConfirm(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleBulkDelete} disabled={processing} variant="destructive">
              {processing ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

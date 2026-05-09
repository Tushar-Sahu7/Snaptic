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
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

// Shared Components
import ClassCard from "@/components/shared/ClassCard";
import { AttendanceActionGroup } from "@/features/attendance/components/AttendanceActionGroup";
import { isClassInSession, getNowIST, getTodayISTStr, formatIST } from "@/lib/date-utils";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";

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

        const currentDay = getNowIST().getDay(); // 0-6 (Sun-Sat)
        const hasToday = c.schedule?.daysOfWeek?.includes(currentDay);

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
    if (tab !== "active" || debouncedSearch || filteredClasses.length < 2)
      return null;

    // Find first one that is Live or Today
    return filteredClasses.find((c) => {
      const { onTime } = isClassInSession(c);
      if (onTime) return true;

      const currentDay = getNowIST().getDay();
      return c.schedule?.daysOfWeek?.includes(currentDay);
    });
  }, [filteredClasses, tab, debouncedSearch]);

  const remainingClasses = useMemo(() => {
    if (!featuredClass) return filteredClasses;
    return filteredClasses.filter((c) => c._id !== featuredClass._id);
  }, [filteredClasses, featuredClass]);

  // Bulk Handlers
  const handleBulkUnarchive = async () => {
    if (!bulkEndDate) {
      toast.error("Please select an end date for these classes");
      return;
    }
    setProcessing(true);
    try {
      await bulkUnarchiveAll(
        filteredClasses.map((c) => c._id),
        bulkEndDate,
      );
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
        <div className="mt-14 space-y-16">
          {featuredClass && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-border/40" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                  Featured Session
                </h2>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 group">
                  <ClassCard
                    cls={featuredClass}
                    onClick={(id) => navigate(`/teacher/classes/${id}`)}
                    className="h-full border-primary/20 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-700"
                    actions={
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xl"
                            className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-52 p-1.5 rounded-2xl shadow-xl border-primary/5"
                        >
                          <DropdownMenuItem
                            className="rounded-xl py-2.5"
                            onClick={() =>
                              navigate(
                                `/teacher/classes/${featuredClass._id}?tab=history`,
                              )
                            }
                          >
                            <History className="mr-3 w-4 h-4 text-muted-foreground" />{" "}
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="opacity-50" />
                          <DropdownMenuItem
                            className="rounded-xl py-2.5"
                            onClick={() => {
                              setEditingClass(featuredClass);
                              setFormDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-3 w-4 h-4 text-muted-foreground" />{" "}
                            Edit Class
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="rounded-xl py-2.5 text-orange-600 focus:text-orange-600 focus:bg-orange-500/10"
                            onClick={() => toggleArchive(featuredClass)}
                          >
                            <Archive className="mr-3 w-4 h-4" /> Archive Class
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="opacity-50" />
                          <DropdownMenuItem
                            className="rounded-xl py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5"
                            onClick={() => setDeleteClassState(featuredClass)}
                          >
                            <Trash2 className="mr-3 w-4 h-4" /> Delete
                            Permanently
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
                  <div className="flex-1 rounded-[2.5rem] bg-linear-to-br from-primary/3 to-primary/1 border border-primary/5 p-8 flex flex-col justify-center gap-6 backdrop-blur-md relative overflow-hidden group">
                    {/* Decorative element */}
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />

                    <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <Radio className="w-6 h-6 animate-pulse" />
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        Today's Focus
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        This session is prioritized for today. You can quickly
                        track attendance or manage student lists directly.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center"
                          >
                            <Users
                              size={12}
                              className="text-muted-foreground/50"
                            />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Ready for tracking
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                {featuredClass
                  ? "Other Classes"
                  : tab === "active"
                    ? "Active Classes"
                    : "Archived Classes"}
              </h2>
              <div className="h-px flex-1 ml-6 bg-border/40" />
            </div>

            <div
              className={cn(
                "grid gap-6",
                viewType === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              {remainingClasses.map((cls) => (
                <ClassCard
                  key={cls._id}
                  cls={cls}
                  layout={viewType}
                  onClick={(id) => navigate(`/teacher/classes/${id}`)}
                  actions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xl"
                          className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-52 p-1.5 rounded-2xl shadow-xl border-primary/5"
                      >
                        <DropdownMenuItem
                          className="rounded-xl py-2.5"
                          onClick={() =>
                            navigate(`/teacher/classes/${cls._id}?tab=history`)
                          }
                        >
                          <History className="mr-3 w-4 h-4 text-muted-foreground" />{" "}
                          View History
                        </DropdownMenuItem>
                        {cls.status !== "archived" && (
                          <DropdownMenuItem
                            className="rounded-xl py-2.5"
                            onClick={() =>
                              navigate(
                                `/teacher/classes/${cls._id}?action=add-student`,
                              )
                            }
                          >
                            <UserPlus className="mr-3 w-4 h-4 text-muted-foreground" />{" "}
                            Add Student
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="opacity-50" />
                        {cls.status !== "archived" && (
                          <DropdownMenuItem
                            className="rounded-xl py-2.5"
                            onClick={() => {
                              setEditingClass(cls);
                              setFormDialogOpen(true);
                            }}
                          >
                            <Pencil className="mr-3 w-4 h-4 text-muted-foreground" />{" "}
                            Edit Class
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="rounded-xl py-2.5 text-orange-600 focus:text-orange-600 focus:bg-orange-500/10"
                          onClick={() => {
                            if (cls.status === "archived") {
                              setUnarchiveClass(cls);
                            } else {
                              toggleArchive(cls);
                            }
                          }}
                        >
                          {cls.status === "archived" ? (
                            <>
                              <ArchiveRestore className="mr-3 w-4 h-4" />{" "}
                              Unarchive Class
                            </>
                          ) : (
                            <>
                              <Archive className="mr-3 w-4 h-4" /> Archive Class
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem
                          className="rounded-xl py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5"
                          onClick={() => setDeleteClassState(cls)}
                        >
                          <Trash2 className="mr-3 w-4 h-4" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                  footer={
                    cls.status !== "archived" &&
                    viewType === "grid" && (
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
              <Button
                onClick={() => {
                  setEditingClass(null);
                  setFormDialogOpen(true);
                }}
                size="xl"
                className="group rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all duration-300"
              >
                <Plus 
                  className="mr-2 w-5 h-5 transition-transform duration-500 group-hover:rotate-90" 
                  strokeWidth={3} 
                /> Create Class
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

      {/* Bulk Unarchive Dialog */}
      <Dialog
        open={bulkUnarchiveConfirm}
        onOpenChange={setBulkUnarchiveConfirm}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <ArchiveRestore className="w-6 h-6 text-foreground" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Restore {filteredClasses.length} Classes
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                Move these sessions back to your active dashboard. A new end date is required to resume tracking.
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                  Resumption Date
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-bold rounded-xl border-border/60 bg-background hover:bg-muted/30 transition-all",
                        !bulkEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2.5 h-4 w-4 opacity-50" />
                      {bulkEndDate ? format(new Date(bulkEndDate), "PPP") : <span>Set end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-border/40" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={bulkEndDate ? new Date(bulkEndDate) : undefined}
                      onSelect={(date) => setBulkEndDate(date ? formatIST(date, "yyyy-MM-dd") : "")}
                      disabled={(date) => formatIST(date, "yyyy-MM-dd") < getTodayISTStr()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setBulkUnarchiveConfirm(false)}
                disabled={processing}
                className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkUnarchive} 
                disabled={processing || !bulkEndDate}
                className="h-12 flex-1 rounded-xl font-black tracking-tight bg-foreground text-background hover:bg-foreground/90 shadow-lg active:scale-95 transition-all"
              >
                {processing ? "Processing..." : "Restore All"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Single Unarchive Dialog */}
      <Dialog
        open={!!unarchiveClass}
        onOpenChange={(open) => !open && setUnarchiveClass(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <ArchiveRestore className="w-6 h-6 text-foreground" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Unarchive Class
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                Set a new end date for <span className="text-foreground font-bold">"{unarchiveClass?.name}"</span> to resume tracking.
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                  New End Date
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-bold rounded-xl border-border/60 bg-background hover:bg-muted/30 transition-all",
                        !bulkEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2.5 h-4 w-4 opacity-50" />
                      {bulkEndDate ? format(new Date(bulkEndDate), "PPP") : <span>Set end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-border/40" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={bulkEndDate ? new Date(bulkEndDate) : undefined}
                      onSelect={(date) => setBulkEndDate(date ? formatIST(date, "yyyy-MM-dd") : "")}
                      disabled={(date) => formatIST(date, "yyyy-MM-dd") < getTodayISTStr()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setUnarchiveClass(null)}
                disabled={processing}
                className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!bulkEndDate) return toast.error("Please select an end date");
                  setProcessing(true);
                  try {
                    await toggleArchive(unarchiveClass, bulkEndDate);
                    setUnarchiveClass(null);
                    setBulkEndDate("");
                  } finally {
                    setProcessing(false);
                  }
                }}
                disabled={processing || !bulkEndDate}
                className="h-12 flex-1 rounded-xl font-black tracking-tight bg-foreground text-background hover:bg-foreground/90 shadow-lg active:scale-95 transition-all"
              >
                {processing ? "Processing..." : "Unarchive"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-destructive">
                Delete {filteredClasses.length} Classes?
              </DialogTitle>
              <DialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                This will permanently delete these classes and all student enrollments. This action <span className="font-bold text-destructive italic">cannot</span> be undone.
              </DialogDescription>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
              <Button
                variant="ghost"
                onClick={() => setBulkDeleteConfirm(false)}
                disabled={processing}
                className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDelete}
                disabled={processing}
                variant="destructive"
                className="h-12 flex-1 rounded-xl font-black tracking-tight text-primary-foreground shadow-lg shadow-destructive/10 active:scale-95 transition-all"
              >
                {processing ? "Deleting..." : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

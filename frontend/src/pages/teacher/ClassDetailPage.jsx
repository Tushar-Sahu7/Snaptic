import { useState, useEffect, useCallback, useRef } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useOutletContext,
} from "react-router";
import {
  fetchClassById,
  addStudent,
  removeStudent,
  removeStudents,
  searchStudents,
  updateClass,
} from "@/features/classes/api/classes.api";
import { fetchTodaySession, startAttendanceSession } from "@/features/attendance/api/attendance.api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Pencil,
  Trash2,
  X,
  UserPlus,
  Archive,
  ArchiveRestore,
  MoreVertical,
  User,
  CalendarDays,
  UserCheck,
  Play,
  Eye,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ClassIcon } from "@/components/shared/ClassIcon";
import ClassFormModal from "@/features/classes/components/ClassFormModal";
import ClassDeleteDialog from "@/features/classes/components/ClassDeleteDialog";
import ClassScheduleDisplay from "@/features/classes/components/ClassScheduleDisplay";
import ClassStudentDataTable from "@/features/classes/components/ClassStudentDataTable";
import ClassImportStudentsModal from "@/features/classes/components/ClassImportStudentsModal";
import { useDebounce } from "@/hooks/useDebounce";
import { isWithinSchedule } from "@/lib/utils";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDynamicLabel } = useOutletContext();

  const searchInputRef = useRef(null);

  const [classData, setClassData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);

  // Edit / Delete modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Student search
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);



  // Bulk Remove state
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [removingBulk, setRemovingBulk] = useState(false);

  // Load class detail and today's session
  const loadClass = useCallback(async () => {
    try {
      const { data } = await fetchClassById(id);
      setClassData(data.class);

      // Check for today's session status (GET only, no side effects)
      if (data.class.status !== "archived") {
        try {
          const { data: sessionData } = await fetchTodaySession(id);
          setActiveSession(sessionData.session);
        } catch (err) {
          console.debug("No session found for today yet");
        }
      }
    } catch {
      toast.error("Failed to load class");
      navigate("/teacher/classes", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleStartAttendance = async (origin = "detail") => {
    try {
      setStartingSession(true);
      await startAttendanceSession(id);
      navigate(`/teacher/classes/${id}/attendance?origin=${origin}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start attendance session");
    } finally {
      setStartingSession(false);
    }
  };

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  useEffect(() => {
    if (classData?.name) {
      setDynamicLabel(classData.name);
    }
    return () => setDynamicLabel("");
  }, [classData?.name, setDynamicLabel]);

  useEffect(() => {
    if (location.search.includes("action=add-student")) {
      // Small timeout to ensure input is fully mounted if this is first load
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [location.search]);

  // Debounced student search with AbortController for cancellation
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const controller = new AbortController();

    async function doSearch() {
      setSearching(true);
      try {
        const { data } = await searchStudents(
          debouncedQuery.trim(),
          controller.signal,
        );
        setSearchResults(data.students);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setSearchResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }

    doSearch();

    return () => controller.abort();
  }, [debouncedQuery]);

  // Add student
  async function handleAddStudent(student) {
    try {
      await addStudent(id, student._id);
      toast.success(`${student.name} has been added`);
      loadClass();
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to add ${student.name}`,
      );
    }
  }

  // Restore student (Undo action)
  async function handleRestoreStudent(student) {
    try {
      await addStudent(id, student._id);
      loadClass();
    } catch (err) {
      toast.error(`Failed to restore ${student.name}`);
    }
  }

  // Remove student with Undo
  async function handleRemoveStudent(student) {
    try {
      await removeStudent(id, student._id);
      loadClass();

      toast(`Student removed from class`, {
        description: `${student.name} has been removed.`,
        action: {
          label: "Undo",
          onClick: () => handleRestoreStudent(student),
        },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to remove ${student.name}`,
      );
    }
  }

  // Bulk remove students with Undo
  async function handleBulkRemove() {
    if (!selectedStudents.length) return;
    const studentsToRestore = [...selectedStudents];
    setRemovingBulk(true);
    try {
      await removeStudents(
        id,
        selectedStudents.map((s) => s._id),
      );
      setSelectedStudents([]);
      loadClass();

      toast(`${studentsToRestore.length} students removed`, {
        action: {
          label: "Undo",
          onClick: async () => {
            try {
              for (const s of studentsToRestore) {
                await addStudent(id, s._id);
              }
              loadClass();
              toast.success("Students restored");
            } catch {
              toast.error("Failed to restore some students");
            }
          },
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove students");
    } finally {
      setRemovingBulk(false);
    }
  }

  // Toggle Archive
  async function handleToggleArchive() {
    const currentStatus = classData.status;
    const newStatus = currentStatus === "archived" ? "active" : "archived";
    try {
      await updateClass(id, { status: newStatus });
      loadClass();

      toast.success(
        `Class "${classData.name}" ${newStatus === "archived" ? "archived" : "unarchived"} successfully`,
        {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await updateClass(id, { status: currentStatus });
                loadClass();
                toast.success(`Action undone`);
              } catch {
                toast.error("Failed to undo action");
              }
            },
          },
        }
      );
    } catch (err) {
      toast.error("Failed to update class status");
    }
  }

  function isStudentInClass(studentId) {
    return classData?.students?.some(
      (s) => s._id.toString() === studentId.toString(),
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Skeleton className="size-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1 lg:flex-none">
              <Skeleton className="h-8 w-2/3 lg:w-48" />
              <Skeleton className="h-4 w-1/3 lg:w-32" />
            </div>
          </div>
          <div className="flex items-center w-full lg:w-auto">
            <Skeleton className="h-10 w-full lg:w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <ClassStudentDataTable data={[]} loading={true} />
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="w-full">
            <div className="flex items-center justify-between w-full lg:w-auto gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 bg-accent/30 rounded-xl text-muted-foreground border shadow-sm shrink-0">
                  <ClassIcon name={classData.icon} className="size-6" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight line-clamp-1">
                  {classData.name}
                </h1>
                {classData.status === "archived" && (
                  <Badge variant="secondary" className="shrink-0">Archived</Badge>
                )}
              </div>
              
              <div className="flex lg:hidden shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 -mr-3">
                      <MoreVertical className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {classData.status !== "archived" && (
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil className="size-4 mr-2" />
                        Edit Class
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleToggleArchive}>
                      {classData.status === "archived" ? (
                        <>
                          <ArchiveRestore className="size-4 mr-2" />
                          Unarchive Class
                        </>
                      ) : (
                        <>
                          <Archive className="size-4 mr-2" />
                          Archive Class
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            {(classData.schedule?.days?.length > 0 ||
              classData.schedule?.day) && (
              <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1.5">
                <ClassScheduleDisplay schedule={classData.schedule} />
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {classData.students?.length > 0 && classData.status !== "archived" && (() => {
            const { onTime, message } = isWithinSchedule(classData.schedule);
            
            // PRIORITY 1: Existing Session Today
            if (activeSession) {
              const isFinalized = activeSession.status === "finalized";
              const isSubmitted = activeSession.status === "submitted";
              
              // Case 1: Session is locked (Finalized or Submitted & Time Lapsed)
              if (isFinalized || (isSubmitted && !onTime)) {
                return (
                  <div className="flex flex-col items-center w-full lg:w-auto">
                    <Button
                      variant="secondary"
                      className="bg-accent/10 hover:bg-accent/20 border text-foreground w-full lg:w-auto"
                      size="sm"
                      onClick={() => navigate(`/teacher/attendance/${activeSession._id}/summary`)}
                    >
                      <Eye className="size-4 mr-1.5" />
                      View Summary
                    </Button>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                      Attendance {isFinalized ? "Finalized" : "Closed"}
                    </span>
                  </div>
                );
              }

              // Case 2: Session is Submitted but still On-Time (Allow Updates)
              if (isSubmitted && onTime) {
                return (
                  <div className="flex flex-col items-center w-full lg:w-auto">
                    <Button
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm w-full lg:w-auto"
                      size="sm"
                      onClick={() => navigate(`/teacher/classes/${id}/attendance?manual=true&origin=detail`)}
                    >
                      <Pencil className="size-4 mr-1.5" />
                      Update Attendance
                    </Button>
                    <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">
                      Live Submission
                    </span>
                  </div>
                );
              }

              // Case 3: In-Progress Session
              if (activeSession.status === "inProgress") {
                return (
                  <div className="flex flex-col items-center w-full lg:w-auto">
                    <Button
                      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm w-full lg:w-auto font-semibold"
                      size="sm"
                      onClick={() => navigate(`/teacher/classes/${id}/attendance?origin=detail`)}
                    >
                      <Play className="size-4 mr-1.5" />
                      Resume Session
                    </Button>
                    <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                      Session in Progress
                    </span>
                  </div>
                );
              }
            }

            // PRIORITY 2: On-Time (New Session)
            if (onTime) {
              return (
                <div className="flex flex-col items-center w-full lg:w-auto">
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm transition-all h-10 px-6 w-full lg:w-auto"
                    size="sm"
                    disabled={startingSession}
                    onClick={() => handleStartAttendance("detail")}
                  >
                    {startingSession ? (
                      <Loader2 className="size-4 mr-1.5 animate-spin" />
                    ) : (
                      <UserCheck className="size-4 mr-1.5" />
                    )}
                    {startingSession ? "Starting..." : "Take Attendance"}
                  </Button>
                  <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">
                    Live Now
                  </span>
                </div>
              );
            }

            // PRIORITY 3: Off-Schedule
            return (
              <div className="flex flex-col items-center w-full lg:w-auto">
                <Button
                  className="bg-muted text-muted-foreground cursor-not-allowed w-full lg:w-auto"
                  size="sm"
                  disabled
                >
                  <UserCheck className="size-4 mr-1.5" />
                  Take Attendance
                </Button>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter underline decoration-dotted underline-offset-2">
                  {message}
                </span>
              </div>
            );
          })()}
 
          <div className="hidden lg:flex items-center gap-3">
            {classData.status !== "archived" && (
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4 mr-1.5" />
                Edit
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleToggleArchive}>
              {classData.status === "archived" ? (
                <>
                  <ArchiveRestore data-icon="inline-start" /> Unarchive
                </>
              ) : (
                <>
                  <Archive data-icon="inline-start" /> Archive
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6">
          {/* Add Student Section */}
          {classData.status !== "archived" && (
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="size-5" />
                Add Student
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search by name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {query.length > 0 && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                  Import Students
                </Button>
              </div>

              {/* Search Results */}
              {debouncedQuery.trim().length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-1 mt-6">
                  {searchResults.length > 0 ? (
                    <ClassStudentDataTable
                      data={searchResults}
                      loading={searching}
                      hideToolbar={true}
                      syncUrl={false}
                      actionsRender={(student) => {
                        const alreadyAdded = isStudentInClass(student._id);
                        if (alreadyAdded) {
                          return (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-none"
                              onClick={() => handleRemoveStudent(student)}
                            >
                              Remove
                            </Button>
                          );
                        }
                        return (
                          <Button
                            size="sm"
                            onClick={() => handleAddStudent(student)}
                          >
                            Add
                          </Button>
                        );
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl bg-accent/30 border-dashed">
                      <p className="text-sm font-semibold text-foreground">
                        No students found
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-md">
                        No matching records for "{debouncedQuery}". Ensure the
                        student has registered for a Snaptic account to appear in
                        the directory.
                      </p>
                    </div>
                  )}
                </div>
            )}
            </div>
          )}

          {classData.status !== "archived" && <Separator />}

          {/* Enrolled Students */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">
                Enrolled Students ({classData.students?.length || 0})
              </h2>
            </div>

            {classData.students?.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No students in this class yet. Use the search above to add
                students.
              </p>
            ) : (
              <ClassStudentDataTable
                data={classData.students}
                loading={loading}
                selectable
                onSelectionChange={setSelectedStudents}
                toolbarActions={
                  selectedStudents.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkRemove}
                      disabled={removingBulk}
                    >
                      <Trash2 className="size-4 mr-1.5" />
                      Remove Selected ({selectedStudents.length})
                    </Button>
                  )
                }
                actionsRender={(student) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => toast.info("View Profile: Coming soon")}
                      >
                        <User className="size-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toast.info("View Attendance: Coming soon")
                        }
                      >
                        <CalendarDays className="size-4 mr-2" />
                        View Attendance
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                        onClick={() => handleRemoveStudent(student)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove from Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </div>
      </div>

      {/* Edit Modal */}
      <ClassFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        classData={classData}
        onSuccess={() => {
          setEditOpen(false);
          loadClass();
        }}
      />

      {/* Delete Dialog */}
      <ClassDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        classData={classData}
        onDeleted={() => navigate("/teacher/classes", { replace: true })}
      />

      {/* Import Students Modal */}
      <ClassImportStudentsModal
        open={importOpen}
        onOpenChange={setImportOpen}
        currentClassId={classData._id}
        existingStudents={classData.students}
        onSuccess={loadClass}
      />

      {/* Remove Student Confirmation - Removed in favor of Undo toast */}
    </div>
  );
}

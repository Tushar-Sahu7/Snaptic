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
import {
  fetchTodaySession,
  startAttendanceSession,
} from "@/features/attendance/api/attendance.api";
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
  DropdownMenuSeparator,
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
      toast.error(
        err.response?.data?.message || "Failed to start attendance session",
      );
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
        },
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
      <div>
        <div>
          <div>
            <Skeleton />
            <div>
              <Skeleton />
              <Skeleton />
            </div>
          </div>
          <div>
            <Skeleton />
          </div>
        </div>
        <Skeleton />
        <ClassStudentDataTable data={[]} loading={true} />
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div>

      {/* Header */}
      <div>
        <div>
          <div>
            <div>
              <div>
                <span>
                  <ClassIcon name={classData.icon} />
                </span>
                <h1>
                  {classData.name}
                </h1>
                {classData.status === "archived" && (
                  <Badge variant="secondary">
                    Archived
                  </Badge>
                )}
              </div>


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

                  <DropdownMenuContent align="end">
                    {classData.status !== "archived" && (
                      <DropdownMenuItem onClick={() => setEditOpen(true)}>
                        <Pencil />
                        Edit Class
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={handleToggleArchive}>
                      {classData.status === "archived" ? (
                        <>
                          <ArchiveRestore />
                          Unarchive Class
                        </>
                      ) : (
                        <>
                          <Archive />
                          Archive Class
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {(classData.schedule?.days?.length > 0 ||
              classData.schedule?.day) && (
              <p>
                <ClassScheduleDisplay schedule={classData.schedule} />
              </p>
            )}

          </div>
        </div>
        <div>

          {classData.students?.length > 0 &&
            classData.status !== "archived" &&
            (() => {
              const { onTime, message } = isWithinSchedule(classData.schedule);

              // PRIORITY 1: Existing Session Today
              if (activeSession) {
                const isFinalized = activeSession.status === "finalized";
                const isSubmitted = activeSession.status === "submitted";

                // Case 1: Session is locked (Finalized or Submitted & Time Lapsed)
                if (isFinalized || (isSubmitted && !onTime)) {
                  return (
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/teacher/attendance/${activeSession._id}/summary`,
                          )
                        }
                      >
                        <Eye />
                        View Summary
                      </Button>
                      <span>
                        Attendance {isFinalized ? "Finalized" : "Closed"}
                      </span>
                    </div>
                  );
                }


                // Case 2: Session is Submitted but still On-Time (Allow Updates)
                if (isSubmitted && onTime) {
                  return (
                    <div>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/teacher/classes/${id}/attendance?manual=true&origin=detail`,
                          )
                        }
                      >
                        <Pencil />
                        Update Attendance
                      </Button>
                      <span>
                        Live Submission
                      </span>
                    </div>
                  );
                }


                // Case 3: In-Progress Session
                if (activeSession.status === "inProgress") {
                  return (
                    <div>
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/teacher/classes/${id}/attendance?origin=detail`,
                          )
                        }
                      >
                        <Play />
                        Resume Session
                      </Button>
                      <span>
                        Session in Progress
                      </span>
                    </div>
                  );
                }

              }

              // PRIORITY 2: On-Time (New Session)
              if (onTime) {
                return (
                  <div>
                    <Button
                      size="sm"
                      disabled={startingSession}
                      onClick={() => handleStartAttendance("detail")}
                    >
                      {startingSession ? (
                        <Loader2 />
                      ) : (
                        <UserCheck />
                      )}
                      {startingSession ? "Starting..." : "Take Attendance"}
                    </Button>
                    <span>
                      Live Now
                    </span>
                  </div>
                );
              }


              // PRIORITY 3: Off-Schedule
              return (
                <div>
                  <Button
                    size="sm"
                    disabled
                  >
                    <UserCheck />
                    Take Attendance
                  </Button>
                  <span>
                    {message}
                  </span>
                </div>
              );
            })()}

          <div>
            {classData.status !== "archived" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil />
                Edit
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={handleToggleArchive}>
              {classData.status === "archived" ? (
                <>
                  <ArchiveRestore /> Unarchive
                </>
              ) : (
                <>
                  <Archive /> Archive
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div>
        {/* Add Student Section */}
        {classData.status !== "archived" && (
          <div>
            <h2>
              <UserPlus />
              Add Student
            </h2>

            <div>
              <div>
                <Search />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query.length > 0 && (
                  <button
                    onClick={() => setQuery("")}
                  >
                    <X />
                  </button>
                )}
              </div>
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                Import Students
              </Button>
            </div>

            {/* Search Results */}
            {debouncedQuery.trim().length > 0 && (
              <div>
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
                  <div>
                    <p>
                      No students found
                    </p>
                    <p>
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
        <div>
          <div>
            <h2>
              Enrolled Students ({classData.students?.length || 0})
            </h2>
          </div>

          {classData.students?.length === 0 ? (
            <p>
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
                    <Trash2 />
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
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => toast.info("View Profile: Coming soon")}
                    >
                      <User />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => toast.info("View Attendance: Coming soon")}
                    >
                      <CalendarDays />
                      View Attendance
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleRemoveStudent(student)}
                    >
                      <Trash2 />
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

import { useParams, useNavigate, useLocation, useOutletContext, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo, useEffect, useRef } from "react";
import { 
  useClassDetail, 
  useUpdateClass, 
  useAddStudent, 
  useRemoveStudent, 
  useSearchStudents 
} from "@/features/classes/hooks/useClasses";
import { 
  useClassRecord, 
  useClassSessions, 
  useStudentClassRecord 
} from "@/features/records/hooks/useRecords";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrimaryAttendanceAction } from "@/features/attendance/components/PrimaryAttendanceAction";
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
  AlertCircle,
  Users,
  Check,
  Plus,
  MapPin,
  Clock,
  ArrowLeft
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import ClassFormDialog from "@/features/classes/components/ClassFormDialog";
import ClassDeleteDialog from "@/features/classes/components/ClassDeleteDialog";
import ClassScheduleDisplay from "@/features/classes/components/ClassScheduleDisplay";
import ClassStudentDataTable from "@/features/classes/components/ClassStudentDataTable";
import ClassImportStudentsModal from "@/features/classes/components/ClassImportStudentsModal";
import SessionList from "@/features/records/components/SessionList";
import AttendanceLedger from "@/features/records/components/AttendanceLedger";
import { useDebounce } from "@/hooks/use-debounce";
import { isClassInSession, formatClassValidity, formatRoom, formatDays, formatClassTimeRange } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

/**
 * Shared Class Detail Page for both Teachers and Students.
 * Adapts UI based on the user's role.
 */
export default function ClassDetailPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { setDynamicLabel } = useOutletContext();
  const searchInputRef = useRef(null);

  // TanStack Queries & Mutations
  const { data: classData, isLoading, error } = useClassDetail(id);
  const updateClassMutation = useUpdateClass();
  const addStudentMutation = useAddStudent(id);
  const removeStudentMutation = useRemoveStudent(id);

  // Records data
  const selectedStudentId = searchParams.get("student");
  
  // Teacher-specific records data
  const { data: classRecord } = useClassRecord(!isStudent ? id : null);
  const { data: sessions, isLoading: sessionsLoading } = useClassSessions(!isStudent ? id : null);
  
  // Student-specific records data
  const { data: studentPersonalRecord, isLoading: studentRecordLoading } = useStudentClassRecord(isStudent ? id : null);

  // Determine which record to show in the "Ledger" view
  const activeLedgerRecord = useMemo(() => {
    if (isStudent && studentPersonalRecord) {
      return {
        name: user.name,
        history: studentPersonalRecord.history,
        attendancePercentage: studentPersonalRecord.summary?.attendancePercentage,
        presentCount: studentPersonalRecord.summary?.presentCount,
        totalSessions: studentPersonalRecord.summary?.totalSessions,
      };
    }
    
    if (!isStudent && selectedStudentId && classRecord?.studentRecords) {
      const record = classRecord.studentRecords.find(r => r.studentId === selectedStudentId);
      if (record) {
        return {
          name: record.name,
          history: record.history,
          attendancePercentage: record.attendancePercentage,
          presentCount: record.presentCount,
          totalSessions: record.totalSessions,
        };
      }
    }
    return null;
  }, [isStudent, studentPersonalRecord, classRecord, selectedStudentId, user?.name]);

  const { todaySessions } = useTodayAttendance();
  
  const activeSession = useMemo(() => todaySessions[id], [todaySessions, id]);
  const activeStudents = useMemo(() => {
    return classData?.students?.filter(s => s.status === "active") || [];
  }, [classData?.students]);

  // UI State
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: searchResults = [], isLoading: searching } = useSearchStudents(debouncedQuery);
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    if (classData?.name) setDynamicLabel(classData.name);
    return () => setDynamicLabel("");
  }, [classData?.name, setDynamicLabel]);

  useEffect(() => {
    if (location.search.includes("action=add-student")) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [location.search]);

  const activeTab = searchParams.get("tab") || "students";
  const handleTabChange = (val) => {
    setSearchParams((prev) => {
      prev.set("tab", val);
      return prev;
    });
  };

  const handleToggleArchive = async () => {
    const newStatus = classData.status === "archived" ? "active" : "archived";
    try {
      await updateClassMutation.mutateAsync({ classId: id, payload: { status: newStatus } });
      toast.success(`Class ${newStatus === "archived" ? "archived" : "unarchived"}`);
    } catch (err) {
      toast.error("Failed to update class status");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
        <h2 className="text-2xl font-bold">Class not found</h2>
        <Button onClick={() => navigate(isStudent ? "/student/classes" : "/teacher/classes")}>
          Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mt-1 rounded-xl h-10 w-10 shrink-0" 
            onClick={() => navigate(isStudent ? "/student/classes" : "/teacher/classes")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div 
            className="p-4 rounded-2xl border border-border/50 shadow-sm transition-transform duration-300 hover:scale-105 relative overflow-hidden"
            style={{
              backgroundColor: `color-mix(in oklch, ${classData.color || "oklch(0.4 0.02 160)"}, transparent 92%)`,
              color: classData.color || "oklch(0.4 0.02 160)"
            }}
          >
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px]" />
            <LucideIcon name={classData.icon} size={32} strokeWidth={1.5} className="relative z-10 drop-shadow-sm" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{classData.name}</h1>
              {classData.status === "archived" && (
                <Badge variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Archived
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-medium">
              {isStudent && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-primary/60" />
                  <span>By <span className="text-foreground font-bold">{classData.teacher?.name || "Teacher"}</span></span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary/60" />
                <span>{formatDays(classData.schedule)} • {formatClassTimeRange(classData)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-primary/60" />
                <span>{formatClassValidity(classData.schedule)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary/60" />
                <span>{formatRoom(classData.location)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:pl-16">
          {!isStudent && classData.status !== "archived" && (
            <PrimaryAttendanceAction 
              cls={classData} 
              session={activeSession} 
              className="rounded-xl font-bold"
            />
          )}

          {!isStudent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                {classData.status !== "archived" && (
                  <DropdownMenuItem onClick={() => setEditOpen(true)} className="rounded-lg">
                    <Pencil className="mr-2 w-4 h-4" /> Edit Class Details
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleToggleArchive} className="rounded-lg">
                  {classData.status === "archived" ? (
                    <><ArchiveRestore className="mr-2 w-4 h-4" /> Unarchive Class</>
                  ) : (
                    <><Archive className="mr-2 w-4 h-4" /> Archive Class</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive focus:text-destructive rounded-lg">
                  <Trash2 className="mr-2 w-4 h-4" /> Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6 h-12 rounded-xl w-full sm:w-auto overflow-x-auto flex justify-start p-1 bg-muted/50">
          <TabsTrigger value="students" className="rounded-lg h-10 px-6 font-bold flex gap-2">
            <Users className="w-4 h-4" /> Students
          </TabsTrigger>
          <TabsTrigger value="records" className="rounded-lg h-10 px-6 font-bold flex gap-2">
            <CalendarDays className="w-4 h-4" /> Records
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-0">
          <div className="grid grid-cols-1 gap-12">

      {/* Enrollment & Search Section (Teacher Only) */}
      {!isStudent && classData.status !== "archived" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-primary" />
                Enroll Students
              </h2>
              <p className="text-muted-foreground font-medium">Search the directory or import students from other classes.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative group w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search name or email..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl bg-card border-border/50 focus:ring-2 focus:ring-primary/10 focus:border-primary/30 font-medium transition-all shadow-sm"
                />
                {query && (
                  <button 
                    onClick={() => setQuery("")} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <Button variant="secondary" className="h-11 rounded-xl font-bold gap-2 px-6 shadow-sm w-full sm:w-auto" onClick={() => setImportOpen(true)}>
                <Users className="w-4 h-4" /> Import from Class
              </Button>
            </div>
          </div>

          {/* Search Results Area */}
          {debouncedQuery && (
            <Card className="rounded-3xl border border-primary/20 bg-muted/30 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
              <CardHeader className="p-6 pb-0 border-b border-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Search Results</CardTitle>
                      <CardDescription className="text-xs font-bold uppercase tracking-widest text-primary/60">
                        {searchResults.length} {searchResults.length === 1 ? "student" : "students"} found
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setQuery("")} className="rounded-lg h-8 w-8 p-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {searchResults.length > 0 ? (
                  <ClassStudentDataTable
                    data={searchResults}
                    loading={searching}
                    hideToolbar
                    syncUrl={false}
                    actionsRender={(student) => {
                      const alreadyIn = activeStudents.some(s => s._id === student._id);
                      return alreadyIn ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 px-3 py-1 rounded-lg font-bold">
                          <Check className="w-3.5 h-3.5" /> Already Enrolled
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="font-bold gap-2 rounded-xl shadow-sm" 
                          disabled={addStudentMutation.isPending}
                          onClick={() => addStudentMutation.mutate({ studentId: student._id })}
                        >
                          {addStudentMutation.isPending && addStudentMutation.variables?.studentId === student._id ? (
                            <Spinner data-icon="inline-start" className="w-3.5 h-3.5" />
                          ) : (
                            <Plus data-icon="inline-start" className="w-3.5 h-3.5" />
                          )}
                          Enroll Student
                        </Button>
                      );
                    }}
                  />
                ) : !searching && debouncedQuery.includes("@") ? (
                  <div className="p-10 flex flex-col items-center justify-center text-center gap-6">
                    <div className="p-4 rounded-full bg-primary/10">
                      <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold">No exact match for "{debouncedQuery}"</p>
                      <p className="text-sm text-muted-foreground font-medium max-w-sm">
                        Would you like to enroll this student as a new user using their email?
                      </p>
                    </div>
                    <Button 
                      className="font-bold gap-2 rounded-xl h-11 px-8 shadow-md" 
                      disabled={addStudentMutation.isPending}
                      onClick={() => {
                        addStudentMutation.mutate({ email: debouncedQuery });
                        setQuery("");
                      }}
                    >
                      {addStudentMutation.isPending && addStudentMutation.variables?.email === debouncedQuery ? (
                        <Spinner data-icon="inline-start" className="w-4 h-4" />
                      ) : (
                        <Check data-icon="inline-start" className="w-4 h-4" />
                      )}
                      Quick Enroll by Email
                    </Button>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    {searching ? (
                      <div className="flex flex-col items-center gap-4 text-muted-foreground font-medium">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span>Searching directory...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground font-medium italic">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                        <span>No matching students found in the directory.</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Class Roster Section */}
      <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black">Students</CardTitle>
              <CardDescription className="text-base font-medium">Currently enrolled students in this class.</CardDescription>
            </div>
            <Badge variant="secondary" className="h-7 px-3 rounded-full font-bold bg-primary/10 text-primary border-primary/20">
              {activeStudents.length} Total
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {activeStudents.length === 0 ? (
            <div className="py-24 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 rounded-full bg-muted/20 w-fit mx-auto border border-muted/30">
                <Users className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold tracking-tight">No students enrolled</p>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto text-base">
                  {isStudent 
                    ? "It looks like no students are enrolled in this class yet." 
                    : "Start by searching for students above or importing them from another class."}
                </p>
              </div>
              {!isStudent && (
                <Button variant="outline" className="rounded-xl font-bold gap-2 px-8 h-11" onClick={() => searchInputRef.current?.focus()}>
                  <Search className="w-4 h-4" /> Search Directory
                </Button>
              )}
            </div>
          ) : (
            <ClassStudentDataTable
              data={activeStudents}
              loading={isLoading}
              selectable={!isStudent && classData.status !== "archived"}
              onSelectionChange={setSelectedStudents}
              onRowClick={(student) => {
                if (isStudent) return; // Students can't click to view other students' records
                navigate(`/teacher/classes/${id}?student=${student._id}&tab=records`);
              }}
              toolbarActions={
                !isStudent && selectedStudents.length > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="rounded-xl font-bold gap-2 shadow-sm h-11 px-4 text-white hover:bg-destructive/90 transition-colors"
                    onClick={() => removeStudentMutation.mutate(selectedStudents.map(s => s._id))}
                  >
                    <Trash2 className="w-4 h-4" /> Remove ({selectedStudents.length})
                  </Button>
                )
              }
              actionsRender={(student) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 hover:bg-primary/5 hover:text-primary transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-48 p-1.5">
                    <DropdownMenuItem 
                      onClick={() => navigate(isStudent ? `/student/profile?id=${student._id}` : `/teacher/profile?id=${student._id}`)} 
                      className="rounded-lg font-medium"
                    >
                      <User className="mr-2 w-4 h-4 text-muted-foreground" /> View Profile
                    </DropdownMenuItem>
                    
                    {!isStudent && (
                      <DropdownMenuItem 
                        onClick={() => navigate(`/teacher/classes/${id}?student=${student._id}&tab=records`)} 
                        className="rounded-lg font-medium"
                      >
                        <CalendarDays className="mr-2 w-4 h-4 text-muted-foreground" /> View Records
                      </DropdownMenuItem>
                    )}

                    {!isStudent && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => removeStudentMutation.mutate([student._id])} 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg font-medium"
                        >
                          <Trash2 className="mr-2 w-4 h-4" /> Remove from Class
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          )}
        </CardContent>
      </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-0">
          {activeLedgerRecord ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-primary" />
                    {isStudent ? "My Attendance Ledger" : `${activeLedgerRecord.name}'s Ledger`}
                  </h2>
                  <p className="text-muted-foreground font-medium">
                    {isStudent ? "Your personal attendance record for this class." : "Detailed student attendance record."}
                  </p>
                </div>
                {!isStudent && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl font-bold gap-2"
                    onClick={() => setSearchParams(prev => { prev.delete("student"); return prev; })}
                  >
                    <X className="w-4 h-4" /> View All Sessions
                  </Button>
                )}
              </div>
              
              <AttendanceLedger 
                history={activeLedgerRecord.history} 
                stats={{
                  attendancePercentage: activeLedgerRecord.attendancePercentage,
                  presentCount: activeLedgerRecord.presentCount,
                  absentCount: activeLedgerRecord.totalSessions - activeLedgerRecord.presentCount,
                  totalSessions: activeLedgerRecord.totalSessions
                }}
                studentName={activeLedgerRecord.name}
                classId={id}
                isTeacher={!isStudent}
              />
            </div>
          ) : (
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black">Class Records</CardTitle>
                    <CardDescription className="text-base font-medium">View and manage past attendance sessions.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="h-7 px-3 rounded-full font-bold bg-primary/10 text-primary border-primary/20">
                    {sessions?.length || 0} Sessions
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {sessionsLoading || studentRecordLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                  </div>
                ) : (
                  <SessionList sessions={sessions || []} classId={id} isTeacher={!isStudent} />
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {!isStudent && (
        <>
          <ClassFormDialog open={editOpen} onOpenChange={setEditOpen} classData={classData} />
          <ClassDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} classData={classData} onDeleted={() => navigate("/teacher/classes")} />
          <ClassImportStudentsModal 
            open={importOpen} 
            onOpenChange={setImportOpen} 
            currentClassId={id} 
            existingStudents={activeStudents} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["classes"] });
              queryClient.invalidateQueries({ queryKey: ["class", id] });
            }}
          />
        </>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router";
import { 
  useClassDetail, 
  useUpdateClass, 
  useAddStudent, 
  useRemoveStudent, 
  useSearchStudents 
} from "@/features/classes/hooks/useClasses";
import { useTodayAttendance } from "@/features/attendance/hooks/useAttendance";
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
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import ClassFormSheet from "@/features/classes/components/ClassFormSheet";
import ClassDeleteDialog from "@/features/classes/components/ClassDeleteDialog";
import ClassScheduleDisplay from "@/features/classes/components/ClassScheduleDisplay";
import ClassStudentDataTable from "@/features/classes/components/ClassStudentDataTable";
import ClassImportStudentsModal from "@/features/classes/components/ClassImportStudentsModal";
import { useDebounce } from "@/hooks/use-debounce";
import { isClassInSession } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDynamicLabel } = useOutletContext();
  const searchInputRef = useRef(null);

  // TanStack Queries & Mutations
  const { data: classData, isLoading, error } = useClassDetail(id);
  const updateClassMutation = useUpdateClass();
  const addStudentMutation = useAddStudent(id);
  const removeStudentMutation = useRemoveStudent(id);
  const { todaySessions } = useTodayAttendance();
  
  const activeSession = useMemo(() => todaySessions[id], [todaySessions, id]);

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
        <Button onClick={() => navigate("/teacher/classes")}>Back to Classes</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
      {/* Hero Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="p-4 rounded-2xl bg-muted/50 border shadow-sm">
            <LucideIcon name={classData.icon} size={32} className="text-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">{classData.name}</h1>
              {classData.status === "archived" && (
                <Badge variant="secondary" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-700">
                  Archived
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground font-medium">
              <ClassScheduleDisplay 
                daysOfWeek={classData.daysOfWeek} 
                startTime={classData.startTime} 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {classData.status !== "archived" && (
            <PrimaryAttendanceAction 
              cls={classData} 
              session={activeSession} 
              className="rounded-xl font-bold"
            />
          )}

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
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Student Management Section */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
          <CardHeader className="p-8 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black">Enrolled Students</CardTitle>
              <CardDescription className="text-base font-medium">Manage your roster and import student records.</CardDescription>
            </div>
            
            {classData.status !== "archived" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group w-full sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search directory..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-background border-muted-foreground/10 focus:ring-primary/20 font-medium"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <Button variant="secondary" className="h-11 rounded-xl font-bold gap-2 px-6" onClick={() => setImportOpen(true)}>
                  <UserPlus className="w-4 h-4" /> Import
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-8">
            {/* Search Overlay */}
            {debouncedQuery && (
              <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Search className="w-3 h-3" /> Search Results
                  </h3>
                  <Badge variant="outline" className="text-[10px]">{searchResults.length} found</Badge>
                </div>
                <ClassStudentDataTable
                  data={searchResults}
                  loading={searching}
                  hideToolbar
                  syncUrl={false}
                  actionsRender={(student) => {
                    const alreadyIn = classData.students?.some(s => s._id === student._id);
                    return alreadyIn ? (
                      <Button size="sm" variant="ghost" className="text-muted-foreground pointer-events-none gap-2 font-bold">
                        <Check className="w-3 h-3" /> Added
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" className="font-bold gap-2 rounded-lg" onClick={() => addStudentMutation.mutate(student._id)}>
                        <Plus className="w-3 h-3" /> Add to Class
                      </Button>
                    );
                  }}
                />
                <Separator className="my-8" />
              </div>
            )}

            {classData.students?.length === 0 ? (
              <div className="py-20 text-center space-y-6">
                <div className="p-6 rounded-full bg-muted/30 w-fit mx-auto">
                  <Users className="w-12 h-12 text-muted-foreground opacity-30" />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black">No students enrolled</p>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                    Start by searching for students in the global directory or import an existing roster.
                  </p>
                </div>
              </div>
            ) : (
              <ClassStudentDataTable
                data={classData.students}
                loading={isLoading}
                selectable={classData.status !== "archived"}
                onSelectionChange={setSelectedStudents}
                toolbarActions={
                  selectedStudents.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-xl font-bold gap-2"
                      onClick={() => removeStudentMutation.mutate(selectedStudents.map(s => s._id))}
                    >
                      <Trash2 className="w-4 h-4" /> Remove Selected ({selectedStudents.length})
                    </Button>
                  )
                }
                actionsRender={(student) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => navigate(`/teacher/profile?id=${student._id}`)}>
                        <User className="mr-2 w-4 h-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/teacher/classes/${id}?student=${student._id}&tab=history`)}>
                        <CalendarDays className="mr-2 w-4 h-4" /> View History
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => removeStudentMutation.mutate([student._id])} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 w-4 h-4" /> Remove from Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <ClassFormSheet open={editOpen} onOpenChange={setEditOpen} classData={classData} />
      <ClassDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} classData={classData} onDeleted={() => navigate("/teacher/classes")} />
      <ClassImportStudentsModal open={importOpen} onOpenChange={setImportOpen} currentClassId={id} existingStudents={classData.students} />
    </div>
  );
}

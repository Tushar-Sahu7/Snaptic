import { useEffect, useMemo } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { useTodayAttendance, useStartAttendance } from "@/features/attendance/hooks/useAttendance";
import { useNavigate, useSearchParams, useOutletContext } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";

export default function AttendanceSelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setDynamicLabel } = useOutletContext();

  const classId = searchParams.get("classId");
  const autoStart = searchParams.get("autoStart") === "true";
  const manual = searchParams.get("manual") === "true";

  const { classes, loading: classesLoading } = useClasses();
  const { todaySessions, loading: sessionsLoading, refresh: refreshSessions } = useTodayAttendance();
  
  const startAttendanceMutation = useStartAttendance();
  const { data: sessionData, isPending: sessionStarting, error: sessionError, mutate: startSession } = startAttendanceMutation;

  // 1. Initial Load & Logic
  const loading = classesLoading || sessionsLoading;
  const activeClasses = classes.filter((c) => c.status === "active");

  // 2. Handle specific class selection from URL
  useEffect(() => {
    if (classId) {
      if (!sessionData && !sessionStarting && !sessionError) {
        startSession(classId);
      }
    } else {
      // If classId is cleared, reset the mutation state to avoid stale session data
      if (sessionData || sessionError) {
        startAttendanceMutation.reset();
      }
    }
  }, [classId, sessionData, sessionStarting, sessionError, startSession, startAttendanceMutation]);

  // 3. Update Dynamic Label (Page Title)
  useEffect(() => {
    const className = sessionData?.session?.classId?.name;
    if (className) {
      setDynamicLabel(className);
    } else {
      setDynamicLabel("Attendance");
    }
  }, [sessionData?.session?.classId?.name, setDynamicLabel]);

  // 4. Render States
  if (loading) {
    return (
      <div className="container mx-auto px-8 py-12 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64 rounded-2xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-[32px]" />
          ))}
        </div>
      </div>
    );
  }

  // Handle Session Initialization Loading
  if (classId && sessionStarting) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 text-center animate-in fade-in duration-500">
        <div className="space-y-4">
           <div className="relative w-16 h-16 mx-auto mb-8">
             <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
             </div>
           </div>
           <h2 className="text-3xl font-black tracking-tight italic uppercase">Initializing <span className="text-primary">Session</span></h2>
           <p className="text-muted-foreground font-medium text-lg">Synchronizing student profiles and biometric data...</p>
        </div>
      </div>
    );
  }

  // Handle Session Initialization Error
  if (classId && sessionError) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 bg-destructive/10 rounded-[32px] rotate-6 blur-xl" />
          <div className="relative p-6 bg-destructive/10 rounded-[32px] border border-destructive/20 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Session <span className="text-destructive">Failure</span></h2>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            {sessionError?.response?.data?.message || "We encountered a technical hitch while initializing the biometric engine."}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            className="rounded-2xl h-14 font-black uppercase tracking-widest text-[11px]"
            onClick={() => startSession(classId)}
          >
            Retry Initialization
          </Button>
          <Button 
            variant="outline" 
            className="rounded-2xl h-14 font-black uppercase tracking-widest text-[11px]"
            onClick={() => navigate("/teacher/take-attendance")}
          >
            Back to Selection
          </Button>
        </div>
      </div>
    );
  }

  // 5. Success State
  const students = sessionData?.profiles?.map(p => ({ ...p, _id: p.userId })) || [];
  const records = sessionData?.records || [];

  return (
    <div className="animate-in fade-in duration-700">
      <AttendanceWizard
        key={classId || "root"}
        classes={activeClasses}
        todaySessions={todaySessions}
        session={classId ? sessionData?.session : null}
        students={classId ? students : []}
        profiles={classId ? sessionData?.profiles : []}
        records={classId ? records : []}
        autoStart={autoStart}
        manual={manual}
        onSelectClass={(c, mode) => {
          const flag = mode === "manual" ? "manual=true" : "autoStart=true";
          navigate(`/teacher/take-attendance?classId=${c._id}&${flag}`);
        }}
      />
    </div>
  );
}

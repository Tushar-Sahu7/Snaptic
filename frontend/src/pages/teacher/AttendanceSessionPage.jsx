import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartAttendance } from "@/features/attendance/hooks/useAttendance";
import { useClasses } from "@/features/classes/hooks/useClasses";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";

export default function AttendanceSessionPage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDynamicLabel } = useOutletContext();
  
  const searchParams = new URLSearchParams(location.search);
  const origin = searchParams.get("origin");

  const startAttendanceMutation = useStartAttendance();
  const { data: classesData, isLoading: classesLoading } = useClasses();
  const { data, isPending, error, mutate: startSession } = startAttendanceMutation;

  useEffect(() => {
    // Only start if not already pending and no data exists yet
    if (!isPending && !data && !error && classId) {
      startSession(classId);
    }
  }, [classId, startSession, isPending, data, error]);

  useEffect(() => {
    const className = data?.session?.classId?.name;
    if (className) {
      setDynamicLabel(className);
    }
  }, [data?.session?.classId?.name, setDynamicLabel]);

  // Handle Loading States
  if (isPending || classesLoading || (!data && !error)) {
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-[32px] opacity-40" />
          ))}
        </div>
      </div>
    );
  }

  // Handle Error States
  if (error || (data && data.error)) {
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
            {error?.response?.data?.message || data?.error || "We encountered a technical hitch while initializing the biometric engine."}
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
            className="rounded-2xl h-14 font-black uppercase tracking-widest text-[11px] border-zinc-200"
            onClick={() => navigate(`/teacher/classes/${classId}`)}
          >
            Return to Class Details
          </Button>
        </div>
      </div>
    );
  }

  // Handle Success State (data is present)
  const students = data?.profiles?.map(p => ({ ...p, _id: p.userId })) || [];
  const records = data?.records || [];

  // Derive todaySessions for the wizard's list view
  const todaySessions = useMemo(() => {
    if (!data?.session) return {};
    const s = data.session;
    const cId = typeof s.classId === "object" ? s.classId._id : s.classId;
    return { [cId]: s };
  }, [data?.session]);

  // Filter classes to only show active ones
  const activeClasses = useMemo(() => {
    return (classesData?.classes || []).filter((c) => c.status === "active");
  }, [classesData?.classes]);

  return (
    <div className="min-h-full animate-in fade-in duration-700">
      <AttendanceWizard 
        session={data?.session}
        students={students}
        profiles={data?.profiles}
        records={records}
        classes={activeClasses}
        todaySessions={todaySessions}
        isDirect={origin === "detail"}
        autoStart={searchParams.get("autoStart") === "true"}
        manual={searchParams.get("manual") === "true"}
        onSelectClass={(c, mode) => {
          const flag = mode === "manual" ? "?manual=true" : "?autoStart=true";
          navigate(`/teacher/classes/${c._id}/attendance${flag}`);
        }}
      />
    </div>
  );
}

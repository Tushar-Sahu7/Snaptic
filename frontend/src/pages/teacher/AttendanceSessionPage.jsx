import { useEffect, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, useLocation } from "react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStartAttendance } from "@/features/attendance/hooks/useAttendance";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";

export default function AttendanceSessionPage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setDynamicLabel } = useOutletContext();
  
  const searchParams = new URLSearchParams(location.search);
  const origin = searchParams.get("origin");

  const startAttendanceMutation = useStartAttendance();
  const { data, isPending, error, mutate: startSession } = startAttendanceMutation;

  useEffect(() => {
    startSession(classId);
  }, [classId, startSession]);

  useEffect(() => {
    const className = data?.session?.classId?.name;
    if (className) {
      setDynamicLabel(className);
    }
  }, [data?.session?.classId?.name, setDynamicLabel]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 text-center">
        <div className="space-y-4">
           <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-50" />
           <h2 className="text-2xl font-black tracking-tight">Initializing Session</h2>
           <p className="text-muted-foreground font-medium">Preparing the mass scanner and student roster...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || (data && data.error)) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Session Error</h2>
          <p className="text-muted-foreground font-medium">{error?.response?.data?.message || data?.error || "Failed to initialize session"}</p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl px-8"
          onClick={() => navigate(`/teacher/classes/${classId}`)}
        >
          Return to Class Details
        </Button>
      </div>
    );
  }

  const students = useMemo(() => 
    data?.profiles?.map(p => ({ ...p, _id: p.userId })) || [],
    [data?.profiles]
  );

  const records = useMemo(() => 
    data?.records || [],
    [data?.records]
  );

  if (!data) return null;

  return (
    <div className="min-h-full">
      <AttendanceWizard 
        session={data.session}
        students={students}
        profiles={data.profiles}
        records={records}
        isDirect={origin === "detail"}
      />
    </div>
  );
}

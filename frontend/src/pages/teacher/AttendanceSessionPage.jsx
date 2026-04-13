import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { startAttendanceSession } from "@/features/attendance/api/attendance.api";
import AttendanceWizard from "@/features/attendance/components/AttendanceWizard";

export default function AttendanceSessionPage() {
  const { id: classId } = useParams();
  const navigate = useNavigate();
  const { setDynamicLabel } = useOutletContext();
  const searchParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  const origin = searchParams.origin;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const { data: sessionData } = await startAttendanceSession(classId);
        setData(sessionData);
        if (sessionData.session?.classId?.name) {
          setDynamicLabel(sessionData.session.classId.name);
        }
      } catch (err) {
        console.error(err);
        setData({ error: err.response?.data?.message || "Failed to initialize session" });
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [classId, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (data.error) {
    return (
      <div className="flex flex-col h-[calc(100svh-4rem)] items-center justify-center p-6 text-center">
        <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Session Error</h2>
        <p className="text-muted-foreground mt-2 max-w-md">{data.error}</p>
        <Button 
          variant="outline" 
          className="mt-6 rounded-xl"
          onClick={() => navigate(`/teacher/classes/${classId}`)}
        >
          Return to Class Details
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full sm:rounded-2xl md:rounded-3xl overflow-hidden bg-background relative sm:border sm:shadow-sm">
      <AttendanceWizard 
        session={data.session}
        students={data.students}
        profiles={data.profiles}
        records={data.records}
        isDirect={origin === "detail"}
      />
    </div>
  );
}

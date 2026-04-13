import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col h-[calc(100svh-4rem)] items-center justify-center p-6 text-center">
        <Loader2 className="size-10 mb-4 animate-spin text-primary" />
        <h2 className="text-lg font-bold">Initializing Session...</h2>
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

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
      <div>

        <div>
          <Skeleton />
          <Skeleton />
        </div>

        <div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>

    );
  }

  if (!data) return null;

  if (data.error) {
    return (
      <div>
        <div>
          <AlertCircle />
        </div>
        <h2>Session Error</h2>
        <p>{data.error}</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/teacher/classes/${classId}`)}
        >
          Return to Class Details
        </Button>
      </div>
    );
  }

  return (
    <div>

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

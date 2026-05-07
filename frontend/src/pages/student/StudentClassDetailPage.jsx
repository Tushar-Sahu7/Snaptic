import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/date-utils";
import axios from "@/lib/axios";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";

function useStudentClassDetail(classId) {
  return useQuery({
    queryKey: ["student-class", classId],
    queryFn: async () => {
      // Fetch specific class details
      const classRes = await axios.get(`/api/classes/${classId}`);
      const classData = classRes.data.class;

      // Fetch history and filter for this class
      const historyRes = await axios.get("/api/reports/student/history");
      const history = (historyRes.data.history || []).filter(h => h.class.id === classId);

      const presentCount = history.filter(h => h.status === "present").length;
      const total = history.length;
      const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

      return {
        class: classData,
        history,
        stats: { presentCount, total, percentage }
      };
    },
    enabled: !!classId
  });
}

export default function StudentClassDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useStudentClassDetail(id);
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.class) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Class not found or you are not enrolled.</p>
        <Button variant="outline" asChild>
          <Link to="/student/classes">Back to Classes</Link>
        </Button>
      </div>
    );
  }

  const { class: classData, history, stats } = data;

  return (
    <div className="container max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/student/classes"><ArrowLeft className="size-5" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: classData.color }}><LucideIcon name={classData.icon || "BookOpen"} className="size-8" /></span>
            <h1 className="text-2xl font-bold tracking-tight">{classData.name}</h1>
          </div>
          <p className="text-muted-foreground">Teacher: {classData.teacherInfo?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-bold ${stats.percentage < 75 ? "text-red-500" : "text-primary"}`}>{stats.percentage}%</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Attendance Rate</span>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-green-600 dark:text-green-500">{stats.presentCount}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Present</span>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-red-600 dark:text-red-500">{stats.total - stats.presentCount}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Absent</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Chronological record of finalized sessions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <EmptyState 
              icon={CalendarIcon}
              title="No records yet"
              description="No attendance records have been finalized for this class yet."
              className="py-12"
            />
          ) : (
            <ul className="divide-y">
              {history.map(record => {
                const isPresent = record.status === "present";
                return (
                  <li key={record.recordId} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`size-10 rounded-full flex items-center justify-center ${isPresent ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500"}`}>
                        {isPresent ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{formatDate(record.session.startTime)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">Status: {record.session.status}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${isPresent ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500"}`}>
                      {isPresent ? "Present" : "Absent"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

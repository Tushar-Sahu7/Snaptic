import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useSessionRecords, useMarkAttendance, useSubmitAttendance } from "@/features/attendance/api/attendance.queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check, X, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function ReviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const { data: fetchResult, isLoading } = useSessionRecords(sessionId);
  const markMutation = useMarkAttendance();
  const submitMutation = useSubmitAttendance();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // fetchResult contains { records, session } as per our new backend route logic
  const records = fetchResult?.records || [];
  const session = fetchResult?.session;

  if (!session) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground mb-4">Session not found.</p>
        <Button onClick={() => navigate("/teacher/attendance/select")}>Go Back</Button>
      </div>
    );
  }

  const handleToggle = (studentId, currentStatus) => {
    const newStatus = currentStatus === "present" ? "absent" : "present";
    markMutation.mutate({
      sessionId,
      studentId,
      status: newStatus,
      method: "manual"
    }, {
      onSuccess: () => {
        toast.success(`Marked as ${newStatus}`);
      }
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    submitMutation.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Attendance finalized successfully!");
        navigate(`/teacher/attendance/${sessionId}/summary`);
      },
      onError: (err) => {
        toast.error("Failed to submit attendance");
        setIsSubmitting(false);
      }
    });
  };

  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.length - presentCount;

  return (
    <div className="container max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/teacher/attendance/scan/${sessionId}`)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Attendance</h1>
          <p className="text-muted-foreground">Verify and finalize the student list.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-green-600 dark:text-green-500">{presentCount}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Present</span>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-red-600 dark:text-red-500">{absentCount}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Absent</span>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center sm:col-span-1 col-span-2">
          <span className="text-3xl font-bold">{records.length}</span>
          <span className="text-sm font-medium text-muted-foreground mt-1">Total Enrolled</span>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <ul className="divide-y">
          {records.map(record => {
            const isPresent = record.status === "present";
            return (
              <li key={record.studentId._id || record.studentId} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={record.avatar} />
                    <AvatarFallback>{record.studentName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium leading-none">{record.studentName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {record.studentId.email || "No email"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${isPresent ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}>
                    {isPresent ? "Present" : "Absent"}
                  </span>
                  <Switch 
                    checked={isPresent} 
                    onCheckedChange={() => handleToggle(record.studentId._id || record.studentId, record.status)} 
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
          {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Submit Final Attendance
        </Button>
      </div>
    </div>
  );
}

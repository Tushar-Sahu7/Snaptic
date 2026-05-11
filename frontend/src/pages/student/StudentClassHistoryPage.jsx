import { useMemo, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router";
import { useStudentHistory } from "@/features/records/hooks/useRecords";
import { useClassDetail } from "@/features/classes/hooks/useClasses";
import { 
  CalendarDays, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock,
  User,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function StudentClassHistoryPage() {
  const { id: classId, studentId } = useParams();
  const navigate = useNavigate();
  const { setDynamicLabels } = useOutletContext();
  
  const { data: classData, isLoading: classLoading } = useClassDetail(classId);
  const { data: records, isLoading: recordsLoading, error } = useClassStudentHistory(classId, studentId);

  useEffect(() => {
    if (classData?.name) {
      setDynamicLabels((prev) => ({ 
        ...prev, 
        2: classData.name 
      }));
    }
    return () => setDynamicLabels((prev) => ({ 
      ...prev, 
      2: undefined 
    }));
  }, [classData?.name, setDynamicLabels]);

  const stats = useMemo(() => {
    if (!records) return { present: 0, absent: 0, total: 0, rate: 0 };
    const present = records.filter(r => r.status === "present").length;
    const total = records.length;
    return {
      present,
      absent: total - present,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [records]);

  if (classLoading || recordsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">Student <span className="text-primary">Attendance</span></h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <History className="w-4 h-4" />
              Detailed history for {classData?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1 rounded-full font-bold bg-primary/5 text-primary border-primary/20">
            {stats.rate}% Attendance Rate
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-emerald-500/5">
          <CardContent className="pt-6 text-center space-y-1">
            <p className="text-3xl font-black text-emerald-600">{stats.present}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/60">Present</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-rose-500/5">
          <CardContent className="pt-6 text-center space-y-1">
            <p className="text-3xl font-black text-rose-500">{stats.absent}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500/60">Absent</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-none shadow-sm bg-muted/30">
          <CardContent className="pt-6 text-center space-y-1">
            <p className="text-3xl font-black text-muted-foreground">{stats.total}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Session History
          </CardTitle>
          <CardDescription className="font-medium">Chronological record of every session attended or missed.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-muted/50">
                <TableHead className="pl-8 font-bold text-[10px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest">Method</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest pr-8 text-right">Time Marked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium">
                    No records found for this student.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.recordId} className="hover:bg-muted/20 transition-colors border-b border-muted/30 last:border-none">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background border border-border/50">
                          <CalendarDays className="w-4 h-4 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {format(new Date(record.session.date), "EEE, MMM do, yyyy")}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(record.session.startTime), "hh:mm a")}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-tighter",
                          record.status === "present" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                            : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}
                      >
                        {record.status === "present" ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Present</span>
                        ) : (
                          <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Absent</span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                         {record.method || "N/A"}
                       </span>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                       <span className="text-xs font-medium text-muted-foreground">
                         {record.markedAt ? format(new Date(record.markedAt), "hh:mm:ss a") : "—"}
                       </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { useSessionRecord } from "@/features/records/hooks/useRecords";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  MapPin,
  Fingerprint,
  QrCode,
  Layout
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatClassTimeRange, formatRoom } from "@/lib/date-utils";

const MethodIcon = ({ method }) => {
  switch (method?.toLowerCase()) {
    case "face":
      return <Fingerprint className="w-3 h-3" />;
    case "qr":
      return <QrCode className="w-3 h-3" />;
    case "manual":
      return <User className="w-3 h-3" />;
    default:
      return <Layout className="w-3 h-3" />;
  }
};

export default function SessionRecordPage() {
  const { classId, sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  
  const { data, isLoading, error } = useSessionRecord(sessionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="w-8 h-8 text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
          Loading Session Record...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <XCircle className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Failed to load record</h2>
          <p className="text-muted-foreground max-w-xs">
            We couldn't find the requested session record. It might have been deleted or moved.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const { session, records, record, teacher } = data;
  const isPresent = !isTeacher ? record?.status === "present" : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)} 
          className="w-fit -ml-2 rounded-lg font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div 
                  className="w-2 h-8 rounded-full" 
                  style={{ backgroundColor: session.classId?.color || "var(--primary)" }} 
                />
                <h1 className="text-4xl font-black tracking-tight">Session Record</h1>
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                {session.classId?.name}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary/60" />
                <span>{format(new Date(session.date), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary/60" />
                <span>{formatClassTimeRange(session)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary/60" />
                <span>{formatRoom(session.location)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <Badge 
              variant="outline" 
              className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-sm"
            >
              Finalized
            </Badge>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Taken at {format(new Date(session.updatedAt), "h:mm a")}
            </p>
          </div>
        </div>
      </div>

      {isTeacher ? (
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">Student Attendance</CardTitle>
                <CardDescription className="text-base font-medium">
                  Detailed breakdown of all enrolled students for this session.
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Present</p>
                  <p className="text-2xl font-black text-emerald-600">
                    {records.filter(r => r.status === "present").length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Absent</p>
                  <p className="text-2xl font-black text-destructive">
                    {records.filter(r => r.status === "absent").length}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/10">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="pl-8 py-4 font-black uppercase text-[10px] tracking-widest">Student</TableHead>
                  <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="py-4 font-black uppercase text-[10px] tracking-widest">Method</TableHead>
                  <TableHead className="pr-8 py-4 text-right font-black uppercase text-[10px] tracking-widest">Marked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.recordId} className="group hover:bg-muted/30 transition-colors border-border/5">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                          <AvatarImage src={r.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {r.studentName?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{r.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest",
                          r.status === "present" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" 
                            : "bg-destructive/10 text-destructive border-destructive/10"
                        )}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      {r.markingMethod ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/80 capitalize">
                          <div className="p-1.5 rounded-md bg-muted group-hover:bg-background transition-colors">
                            <MethodIcon method={r.markingMethod} />
                          </div>
                          {r.markingMethod}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic font-medium">—</span>
                      )}
                    </TableCell>
                    <TableCell className="pr-8 py-4 text-right">
                      {r.markedAt ? (
                        <p className="text-sm font-bold text-foreground/80">
                          {format(new Date(r.markedAt), "h:mm a")}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic font-medium">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="text-2xl font-black">Your Attendance</CardTitle>
              <CardDescription className="text-base font-medium">
                Your personal mark for this session.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-12 flex flex-col items-center justify-center text-center gap-8">
              <div className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center border-8 shadow-inner animate-in zoom-in duration-500",
                isPresent 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600" 
                  : "bg-destructive/5 border-destructive/20 text-destructive"
              )}>
                {isPresent ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
              </div>
              
              <div className="space-y-2">
                <h3 className={cn(
                  "text-4xl font-black tracking-tight",
                  isPresent ? "text-emerald-600" : "text-destructive"
                )}>
                  {isPresent ? "Present" : "Absent"}
                </h3>
                <p className="text-muted-foreground font-medium max-w-xs">
                  {isPresent 
                    ? `Successfully marked via ${record.markingMethod} at ${format(new Date(record.markedAt), "h:mm a")}.`
                    : "No attendance was recorded for you in this session."
                  }
                </p>
              </div>

              {isPresent && (
                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Method</p>
                    <div className="flex items-center justify-center gap-2 font-bold text-foreground">
                      <MethodIcon method={record.markingMethod} />
                      <span className="capitalize">{record.markingMethod}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Time</p>
                    <p className="font-bold text-foreground">
                      {format(new Date(record.markedAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-card/50">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xl font-black">Instructor</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-background shadow-md">
                  <AvatarImage src={teacher?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-black">
                    {teacher?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xl font-black text-foreground truncate">{teacher?.name}</p>
                  <p className="text-sm font-bold text-primary">Class Teacher</p>
                </div>
              </div>
              <Separator className="bg-border/40" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Class Status</span>
                  <Badge variant="secondary" className="rounded-lg bg-emerald-500/10 text-emerald-600 font-bold">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Location</span>
                  <span className="text-sm font-bold text-foreground">{formatRoom(session.location)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

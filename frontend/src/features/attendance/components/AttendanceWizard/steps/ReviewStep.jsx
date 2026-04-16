import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassIcon } from "@/components/shared/ClassIcon";
import { useState, useEffect } from "react";
import { format12Hour, formatRoom, cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * ReviewStep Component
 * A high-craft verification dashboard for attendance sessions.
 * Features inline editing, glassmorphism, and a gated submission flow.
 */
export const ReviewStep = ({
  session,
  students = [],
  profiles = {},
  attendanceState = {},
  isFinalized,
  isSubmitted,
  loading,
  onSubmit,
  onToggleStatus,
  onEdit,
}) => {
  const navigate = useNavigate();

  /**
   * Auto-scroll to top when submission is successful to ensure the success
   * message is fully visible to the user.
   */
  useEffect(() => {
    if (isSubmitted || isFinalized) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSubmitted, isFinalized]);

  // Alphanumeric sorting logic for a predictable review experience
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = profiles[a._id]?.name || a.email || "";
    const nameB = profiles[b._id]?.name || b.email || "";
    return nameA.localeCompare(nameB);
  });

  const absentees = sortedStudents.filter(
    (s) => attendanceState[s._id]?.status !== "present",
  );
  const presentStudents = sortedStudents.filter(
    (s) => attendanceState[s._id]?.status === "present",
  );

  const presentCount = presentStudents.length;
  const absentCount = absentees.length;

  /**
   * handleToggle
   * Allows teachers to correct status markers directly in the review list.
   */
  const handleToggle = (studentId) => {
    if (isFinalized || isSubmitted || loading) return;

    const currentState = attendanceState[studentId];
    const isPresent = currentState?.status === "present";

    if (isPresent) {
      onToggleStatus(studentId, "absent", "manual");
    } else {
      onToggleStatus(studentId, "present", "manual");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mb-12">
      {!isSubmitted ? (
        <div className="space-y-8">
          {/* Header & Stats - Simple Card */}
          <div className="bg-card border rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                  <ShieldCheck className="size-3" />
                  Gated Verification
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground uppercase tracking-tight leading-none">
                  Review Records
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground/60 max-w-sm">
                  Verify and correct student attendance markers before final
                  submission to the database.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <div className="bg-muted/30 border p-5 rounded-3xl flex flex-col items-center min-w-[120px]">
                  <span className="text-3xl font-black text-primary leading-none mb-1">
                    {presentCount}
                  </span>
                  <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">
                    Present
                  </span>
                </div>
                <div className="bg-destructive/5 border border-destructive/10 p-5 rounded-3xl flex flex-col items-center min-w-[120px]">
                  <span className="text-3xl font-black text-destructive/80 leading-none mb-1">
                    {absentCount}
                  </span>
                  <span className="text-[10px] font-black uppercase text-destructive/60 tracking-widest">
                    Absent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Student Lists Breakdown */}
          <div className="space-y-12 pt-4">
            {/* Absentees Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-destructive/80 flex items-center gap-2">
                  <UserX className="size-3.5" />
                  Absentees ({absentCount})
                </h2>
                {absentCount === 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 font-black text-[9px] uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50"
                  >
                    Full Attendance
                  </Badge>
                )}
              </div>

              <div
                className={cn(
                  "grid gap-3",
                  absentCount > 0
                    ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                    : "grid-cols-1",
                )}
              >
                {absentees.map((s) => {
                  const profile = profiles[s._id] || {};
                  const name =
                    profile.name ||
                    s.name ||
                    s.email?.split("@")[0] ||
                    "Unknown";
                  return (
                    <button
                      key={s._id}
                      onClick={() => handleToggle(s._id)}
                      className="group relative flex flex-col items-center gap-3 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border-2 border-dashed border-destructive/20 bg-destructive/5 hover:border-primary/40 hover:bg-accent/20 transition-all active:scale-95 text-center min-h-[120px] sm:min-h-[140px]"
                    >
                      <Avatar className="size-12 sm:size-14 border-2 border-background shadow-lg">
                        <AvatarImage src={profile.avatar} alt={name} />
                        <AvatarFallback className="bg-destructive/10 text-destructive text-sm font-black uppercase">
                          {name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 w-full">
                        <p className="text-[9px] sm:text-[10px] font-black text-foreground/90 uppercase truncate px-1">
                          {name}
                        </p>
                        <p className="text-[8px] font-bold text-muted-foreground/60 uppercase truncate">
                          {s.email?.split("@")[0]}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw className="size-3 text-primary" />
                      </div>
                    </button>
                  );
                })}
                {absentCount === 0 && (
                  <div className="py-12 border-2 border-dashed border-muted rounded-3xl flex flex-col items-center justify-center text-center bg-muted/5">
                    <div className="size-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                      <UserCheck className="size-8" />
                    </div>
                    <p className="font-black uppercase tracking-widest text-[11px] text-muted-foreground">
                      Perfect session recorded
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Present Students Section */}
            <div className="space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2 px-2">
                <UserCheck className="size-3.5" />
                Present ({presentCount})
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {presentStudents.map((s) => {
                  const profile = profiles[s._id] || {};
                  const name =
                    profile.name ||
                    s.name ||
                    s.email?.split("@")[0] ||
                    "Unknown";
                  return (
                    <button
                      key={s._id}
                      onClick={() => handleToggle(s._id)}
                      className="group relative flex flex-col items-center gap-3 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border border-border bg-card hover:border-primary/40 hover:bg-accent/20 transition-all active:scale-95 text-center min-h-[120px] sm:min-h-[140px]"
                    >
                      <Avatar className="size-12 sm:size-14 border-2 border-background shadow-sm">
                        <AvatarImage src={profile.avatar} alt={name} />
                        <AvatarFallback className="bg-muted text-muted-foreground/60 text-sm font-black uppercase">
                          {name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 w-full">
                        <p className="text-[9px] sm:text-[10px] font-black text-foreground/90 uppercase truncate px-1">
                          {name}
                        </p>
                        <p className="text-[8px] font-bold text-muted-foreground/40 uppercase truncate">
                          {s.email?.split("@")[0]}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw className="size-3 text-primary" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-dashed">
            <Button
              variant="ghost"
              onClick={onEdit}
              disabled={loading}
              className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] hover:bg-accent"
            >
              <ArrowLeft className="size-4 mr-2" />
              Recapture Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  disabled={loading}
                  className="rounded-3xl h-16 px-12 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 bg-primary hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="size-5 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="size-5 mr-3" />
                  )}
                  Finish & Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[92%] sm:max-w-lg rounded-[2.5rem] border-2 p-6 sm:p-8">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <AlertTriangle className="size-6 text-primary" />
                    Submit Attendance?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-bold text-muted-foreground">
                    This will finalize the records for{" "}
                    <b>{session.classId?.name}</b>. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] h-12 px-6">
                    Not Yet
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onSubmit}
                    className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-primary shadow-lg shadow-primary/20"
                  >
                    Yes, Finalize
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ) : (
        /* Success / Submitted View */
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center text-center gap-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 size-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 size-32 bg-emerald-500/5 rounded-full blur-3xl -ml-16 -mb-16" />

            <div className="size-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 relative z-10">
              <CheckCircle2 className="size-10 stroke-3" />
            </div>

            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">
                Processed Successfully
              </h3>
              <p className="text-emerald-700/70 text-sm font-semibold max-w-xs">
                {isFinalized
                  ? "This record has been archived and finalized."
                  : "Attendance has been submitted successfully."}
              </p>
            </div>

            {session?.classId && (
              <div className="flex flex-col items-center gap-4 py-2 w-full max-w-sm relative z-10">
                <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-emerald-100 flex flex-col items-center gap-3 w-full shadow-xs">
                  <div className="flex flex-col items-center text-center">
                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 mb-3">
                      <ClassIcon
                        name={session.classId.icon}
                        className="size-5"
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 block mb-1">
                      Session Recorded For
                    </span>
                    <span className="font-black text-xl text-emerald-900 block tracking-tight">
                      {session.classId.name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 w-full pt-2 border-t border-emerald-100 border-dashed">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700/60">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3" />
                        <span>Schedule</span>
                      </div>
                      <span className="text-emerald-900">
                        {session.classId.schedule?.startTime
                          ? format12Hour(session.classId.schedule.startTime)
                          : "--"}{" "}
                        -{" "}
                        {session.classId.schedule?.endTime
                          ? format12Hour(session.classId.schedule.endTime)
                          : "--"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700/60">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3" />
                        <span>Location</span>
                      </div>
                      <span className="text-emerald-900">
                        {session.classId.schedule?.room
                          ? formatRoom(session.classId.schedule.room)
                          : "No Room Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-4 relative z-10">
              <div className="bg-white/60 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-black text-emerald-600">
                  {presentCount}
                </span>
                <span className="text-[9px] font-black uppercase text-emerald-600/60 tracking-widest">
                  Present
                </span>
              </div>
              <div className="bg-destructive/5 border border-destructive/10 p-4 rounded-2xl flex flex-col items-center">
                <span className="text-2xl font-black text-destructive/80">
                  {absentCount}
                </span>
                <span className="text-[9px] font-black uppercase text-destructive/60 tracking-widest">
                  Absent
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate(`/teacher/dashboard`)}
              className="rounded-2xl h-14 px-10 font-black border-2 shadow-xl hover:shadow-primary/10 transition-all active:scale-95"
            >
              Return to Dashboard
            </Button>
            {isSubmitted && !isFinalized && (
              <Button
                variant="link"
                onClick={onEdit}
                className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest hover:text-primary transition-colors"
              >
                Mistake? Correct Records
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

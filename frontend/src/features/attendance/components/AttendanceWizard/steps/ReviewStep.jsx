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
  FileCheck2,
  Trophy,
} from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";
import { useState, useEffect } from "react";
import { format12Hour, formatRoom } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

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

export const ReviewStep = ({
  session,
  students = [],
  profiles = {},
  attendanceState = {},
  isFinalized,
  isSubmitted: initialIsSubmitted,
  isSuccessView,
  setIsSuccessView,
  loading,
  onSubmit,
  onToggleStatus,
  onEdit,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccessView || isFinalized) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSuccessView, isFinalized]);

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
  const totalCount = students.length;
  const attendanceRate =
    totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleToggle = (studentId) => {
    if (isFinalized || isSuccessView || loading) return;

    const currentState = attendanceState[studentId];
    const isPresent = currentState?.status === "present";

    if (isPresent) {
      onToggleStatus(studentId, "absent", "manual");
    } else {
      onToggleStatus(studentId, "present", "manual");
    }
  };

  const handleSync = async () => {
    try {
      await onSubmit();
      setIsSuccessView(true);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  return (
    <div className="pb-24">
      <AnimatePresence mode="wait">
        {!isSuccessView ? (
          <motion.div
            key="review-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            {/* Simplified Header & Stats row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-0.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                  Review Attendance
                </h1>
                <p className="text-sm text-muted-foreground font-medium tracking-tight">
                  Check the list before saving.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{presentCount} Present</span>
                </div>
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-600">
                  <UserX className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{absentCount} Absent</span>
                </div>
                <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-muted border border-border text-muted-foreground">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{attendanceRate}% Rate</span>
                </div>
              </div>
            </div>

            {/* Student Lists Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Absentees Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-1">
                  <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Absent
                  </h2>
                  <div className="h-5 px-2 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold">
                    {absentCount}
                  </div>
                </div>

                <div className="space-y-4">
                  {absentees.map((s, idx) => {
                    const profile = profiles[s._id] || {};
                    const name =
                      profile.name ||
                      s.name ||
                      s.email?.split("@")[0] ||
                      "Unknown";
                    return (
                      <motion.button
                        key={s._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          type: "spring",
                          damping: 20,
                          stiffness: 150,
                        }}
                        onClick={() => handleToggle(s._id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group relative overflow-hidden"
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12 transition-transform group-hover:scale-105 duration-500 ">
                            <AvatarImage
                              src={profile.avatar}
                              alt={name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm font-bold">
                              {name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                            {s.email?.split("@")[0]}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-inner">
                          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                      </motion.button>
                    );
                  })}
                  {absentCount === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-[48px] border-2 border-dashed border-emerald-500/20 bg-emerald-500/2 backdrop-blur-sm"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-[28px] bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                          <CheckCircle2 className="w-10 h-10" strokeWidth={3} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 italic uppercase tracking-tight">
                          All Present
                        </p>
                        <p className="text-base font-medium text-emerald-600/60 dark:text-emerald-400/40 max-w-[200px]">
                          No students are absent.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Present Students Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-2 px-1">
                  <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Present
                  </h2>
                  <div className="h-5 px-2 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                    {presentCount}
                  </div>
                </div>

                <div className="space-y-4">
                  {presentStudents.map((s, idx) => {
                    const profile = profiles[s._id] || {};
                    const name =
                      profile.name ||
                      s.name ||
                      s.email?.split("@")[0] ||
                      "Unknown";
                    return (
                      <motion.button
                        key={s._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: idx * 0.05,
                          type: "spring",
                          damping: 20,
                          stiffness: 150,
                        }}
                        onClick={() => handleToggle(s._id)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group relative overflow-hidden"
                      >
                        <div className="relative">
                          <Avatar className="w-12 h-12 transition-transform group-hover:scale-105 duration-500">
                            <AvatarImage
                              src={profile.avatar}
                              alt={name}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-sm font-bold">
                              {name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {name}
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-[0.2em]">
                            {s.email?.split("@")[0]}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-inner">
                          <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-12 border-t border-zinc-100 dark:border-zinc-900">
              <Button
                variant="ghost"
                onClick={onEdit}
                disabled={loading}
                className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-8 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                Mark Again
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={loading}
                    className="h-12 rounded-2xl font-bold uppercase tracking-widest text-xs px-10 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10 dark:shadow-white/5 hover:scale-105 transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <FileCheck2 className="w-4 h-4 mr-3" />)}
                    Finish and Save
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px] rounded-[1.5rem] p-0 overflow-hidden border-border/40 shadow-2xl bg-background">
                  <div className="p-8 space-y-8">
                    <div className="space-y-3 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2 mx-auto sm:mx-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      </div>
                      <AlertDialogHeader className="p-0 text-left">
                        <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">
                          Save Attendance?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium leading-relaxed text-muted-foreground">
                          You are about to finalize and sync the attendance records for this session.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>

                    <div className="p-5 rounded-2xl bg-muted/40 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
                          <LucideIcon name={session.classId?.icon || "Users"} size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Current Class
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {session.classId?.name || "Current Class"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                      <AlertDialogCancel asChild>
                        <Button
                          variant="ghost"
                          disabled={loading}
                          className="h-12 flex-1 rounded-xl font-bold hover:bg-muted/50 transition-all"
                        >
                        Cancel
                        </Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          onClick={handleSync}
                          disabled={loading}
                          className="h-12 flex-1 rounded-xl font-black tracking-tight bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg active:scale-95 transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 animate-spin w-4 h-4" />
                              Saving...
                            </>
                          ) : (
                            "Confirm & Save"
                          )}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ) : (
          /* Success / Submitted View */
          <motion.div
            key="success-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-xl mx-auto py-12"
          >
            <Empty>
              <EmptyMedia variant="icon">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={2.5} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className="text-3xl">Attendance Saved</EmptyTitle>
                <EmptyDescription>
                  {isFinalized
                    ? "The attendance record has been safely archived."
                    : "Student profiles have been updated with the new attendance data."}
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent className="w-full max-w-md">
                <div className="w-full p-6 rounded-3xl border border-border bg-card/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <LucideIcon name={session.classId?.icon || "Users"} size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Class
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {session.classId?.name || "Class"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Rate
                      </p>
                      <p className="text-sm font-bold text-emerald-500">
                        {attendanceRate}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {presentCount}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest">
                        Present
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-center">
                      <p className="text-2xl font-bold text-rose-600">
                        {absentCount}
                      </p>
                      <p className="text-[9px] font-bold text-rose-600/70 uppercase tracking-widest">
                        Absent
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full pt-4 space-y-4">
                  <Button
                    size="lg"
                    onClick={() => {
                      const classId = session.classId?._id || session.classId;
                      navigate(`/teacher/classes/${classId}/records/${session._id}`);
                    }}
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px]"
                  >
                    View Record
                  </Button>
                  {!isFinalized && (
                    <Button
                      variant="ghost"
                      onClick={() => setIsSuccessView(false)}
                      className="w-full font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Mistake? Re-open Records
                    </Button>
                  )}
                </div>
              </EmptyContent>
            </Empty>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

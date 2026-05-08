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
  isSubmitted,
  loading,
  onSubmit,
  onToggleStatus,
  onEdit,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isSubmitted || isFinalized) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSubmitted, isFinalized]);

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
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

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
    <div className="pb-24">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="review-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-10"
          >
            {/* Header & Stats Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <div className="p-2.5 rounded-2xl bg-primary/10 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-70">Step 04 — Final Audit</span>
                </div>
                <h1 className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 italic uppercase leading-none">
                  Verification <br /> Dashboard
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-xl leading-relaxed text-xl">
                  Analyze the session metadata and ensure every record is accurate. Once submitted, these records will be permanently synced to the central database.
                </p>
              </div>

              <div className="lg:col-span-5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[48px] p-10 border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-colors duration-1000" />
                
                <div className="relative z-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Attendance Rate</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tighter">{attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <Trophy className="w-10 h-10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-6 rounded-[32px] bg-emerald-500/5 border border-emerald-500/10 space-y-1 group/stat transition-all hover:bg-emerald-500/10">
                      <p className="text-4xl font-black text-emerald-500 tabular-nums tracking-tighter">{presentCount}</p>
                      <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest">Present</p>
                    </div>
                    <div className="p-6 rounded-[32px] bg-rose-500/5 border border-rose-500/10 space-y-1 group/stat transition-all hover:bg-rose-500/10">
                      <p className="text-4xl font-black text-rose-500 tabular-nums tracking-tighter">{absentCount}</p>
                      <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-widest">Absent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Lists Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Absentees Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-2xl shadow-rose-500/20">
                      <UserX className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter italic uppercase">
                      Absentees <span className="text-rose-500 ml-1">({absentCount})</span>
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  {absentees.map((s, idx) => {
                    const profile = profiles[s._id] || {};
                    const name = profile.name || s.name || s.email?.split("@")[0] || "Unknown";
                    return (
                      <motion.button
                        key={s._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: idx * 0.05,
                          type: "spring",
                          damping: 20,
                          stiffness: 150
                        }}
                        onClick={() => handleToggle(s._id)}
                        className="w-full flex items-center gap-5 p-5 rounded-[32px] border border-zinc-100 dark:border-zinc-900 bg-white/40 dark:bg-zinc-900/20 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-zinc-200/40 dark:hover:shadow-none transition-all group relative overflow-hidden"
                      >
                        <div className="relative">
                          <Avatar className="w-14 h-14 rounded-2xl border-2 border-white dark:border-zinc-800 shadow-md transition-transform group-hover:scale-110 duration-500">
                            <AvatarImage src={profile.avatar} alt={name} className="object-cover" />
                            <AvatarFallback className="text-sm font-black bg-zinc-100 dark:bg-zinc-800">{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-base font-black text-zinc-900 dark:text-zinc-50 truncate group-hover:text-primary transition-colors">{name}</p>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{s.email?.split("@")[0]}</p>
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
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 italic uppercase tracking-tight">Perfect Session</p>
                        <p className="text-base font-medium text-emerald-600/60 dark:text-emerald-400/40 max-w-[200px]">All students successfully recognized.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Present Students Section */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                  <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter italic uppercase">
                    Present <span className="text-emerald-500 ml-1">({presentCount})</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {presentStudents.map((s, idx) => {
                    const profile = profiles[s._id] || {};
                    const name = profile.name || s.name || s.email?.split("@")[0] || "Unknown";
                    return (
                      <motion.button
                        key={s._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: idx * 0.05,
                          type: "spring",
                          damping: 20,
                          stiffness: 150
                        }}
                        onClick={() => handleToggle(s._id)}
                        className="w-full flex items-center gap-5 p-5 rounded-[32px] border border-emerald-500/10 bg-emerald-500/3 dark:bg-emerald-500/2 hover:bg-emerald-500/8 dark:hover:bg-emerald-500/5 transition-all group relative overflow-hidden"
                      >
                        <div className="relative">
                          <Avatar className="w-14 h-14 rounded-2xl border-2 border-white dark:border-zinc-900 shadow-md transition-transform group-hover:scale-110 duration-500">
                            <AvatarImage src={profile.avatar} alt={name} className="object-cover" />
                            <AvatarFallback className="text-sm font-black bg-zinc-100 dark:bg-zinc-800">{name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-base font-black text-zinc-900 dark:text-zinc-50 truncate">{name}</p>
                          <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-[0.2em]">{s.email?.split("@")[0]}</p>
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
                className="h-16 rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-10 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 mr-3 group-hover:-translate-x-1 transition-transform" />
                Recapture Data
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="lg"
                    disabled={loading}
                    className="h-20 rounded-[32px] font-black uppercase tracking-[0.3em] text-[12px] px-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-3xl shadow-zinc-900/30 dark:shadow-white/10 hover:scale-105 transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <FileCheck2 className="w-6 h-6 mr-4" />
                    )}
                    Finalize & Sync
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[48px] border-none shadow-3xl p-0 overflow-hidden bg-white dark:bg-zinc-950 max-w-lg">
                  <div className="p-12 space-y-10">
                    <div className="space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-[28px] bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
                          <AlertTriangle className="w-10 h-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black tracking-tighter italic uppercase text-zinc-900 dark:text-zinc-50 leading-none">Confirm Sync?</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed text-lg">
                          This will finalize the records for <b className="text-zinc-900 dark:text-zinc-50 underline decoration-primary/30 underline-offset-4">{session.classId?.name}</b>. Profiles will be updated immediately.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <AlertDialogCancel className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                        Review Again
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onSubmit}
                        className="flex-1 h-16 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/20 dark:shadow-white/5 hover:scale-105 transition-all"
                      >
                        Sync Now
                      </AlertDialogAction>
                    </div>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ) : (
          /* Success / Submitted View */
          <motion.div
            key="success-view"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="max-w-3xl mx-auto space-y-12 py-16"
          >
            <div className="relative flex flex-col items-center text-center space-y-10">
              <div className="absolute inset-0 -top-40 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[140%] bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-[120px] animate-pulse" />
              </div>

              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                className="w-32 h-32 rounded-[40px] bg-emerald-500 text-white flex items-center justify-center shadow-3xl shadow-emerald-500/40 relative z-10"
              >
                <CheckCircle2 className="w-16 h-16" strokeWidth={3} />
              </motion.div>

              <div className="space-y-4 relative z-10">
                <h3 className="text-7xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 italic uppercase leading-none">
                  Sync <br /> Complete
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xl max-w-sm mx-auto leading-relaxed">
                  {isFinalized
                    ? "This record has been safely archived and synced."
                    : "Attendance records are now live and student profiles updated."}
                </p>
              </div>
            </div>

            {session?.classId && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-3xl rounded-[60px] border border-white/20 dark:border-zinc-800/50 p-12 shadow-2xl shadow-zinc-200/50 dark:shadow-none space-y-12 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000">
                  <Trophy className="w-80 h-80" />
                </div>

                <div className="flex flex-col items-center gap-8 text-center relative z-10">
                  <div className="w-24 h-24 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                    <LucideIcon name={session.classId.icon} size={48} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 opacity-70">Official Record For</p>
                    <p className="text-5xl font-black text-zinc-900 dark:text-zinc-50 italic uppercase tracking-tighter">{session.classId.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                  <div className="p-8 rounded-[32px] bg-white/50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-900/50 space-y-3 group/info transition-all hover:bg-white dark:hover:bg-zinc-950">
                    <div className="flex items-center gap-3 text-zinc-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Session Time</span>
                    </div>
                    <p className="font-black text-2xl text-zinc-900 dark:text-zinc-50 tracking-tighter">
                      {session.classId.schedule?.startTime ? format12Hour(session.classId.schedule.startTime) : "--"} - {session.classId.schedule?.endTime ? format12Hour(session.classId.schedule.endTime) : "--"}
                    </p>
                  </div>
                  <div className="p-8 rounded-[32px] bg-white/50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-900/50 space-y-3 group/info transition-all hover:bg-white dark:hover:bg-zinc-950">
                    <div className="flex items-center gap-3 text-zinc-400 mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Location</span>
                    </div>
                    <p className="font-black text-2xl text-zinc-900 dark:text-zinc-50 tracking-tighter">
                      {session.classId.schedule?.room ? formatRoom(session.classId.schedule.room) : "No Room Set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between px-10 pt-8 border-t border-zinc-100 dark:border-zinc-900/50 relative z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-6xl font-black text-emerald-500 tabular-nums tracking-tighter">{presentCount}</span>
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Present</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-6xl font-black text-rose-500 tabular-nums tracking-tighter">{absentCount}</span>
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Absent</span>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-6 relative z-10"
            >
              <Button
                size="lg"
                onClick={() => navigate(`/teacher/dashboard`)}
                className="h-20 rounded-[32px] font-black uppercase tracking-[0.3em] text-[12px] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-3xl shadow-zinc-900/30 dark:shadow-white/10 hover:scale-[1.02] transition-all"
              >
                Return to Dashboard
              </Button>
              {isSubmitted && !isFinalized && (
                <Button
                  variant="link"
                  onClick={onEdit}
                  className="font-black uppercase tracking-[0.3em] text-[10px] text-zinc-400 hover:text-primary transition-colors underline underline-offset-8 decoration-primary/20"
                >
                  Mistake? Re-open Records
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

  );
};


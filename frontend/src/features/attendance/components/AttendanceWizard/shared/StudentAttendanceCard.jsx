import { CheckCircle2, Scan, ClipboardCheck, User, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export const StudentAttendanceCard = ({
  student,
  state,
  profile,
  isFinalized,
  loading,
  onClick,
}) => {
  const isPresent = state?.status === "present";
  const name = profile?.name || student.name || student.email?.split("@")[0] || "Student";
  const avatar = profile?.avatar;
  const rollNumber = student.email?.split("@")[0] || "N/A";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isFinalized && !loading ? { y: -4, scale: 1.02, transition: { duration: 0.2 } } : {}}
      whileTap={!isFinalized && !loading ? { scale: 0.98 } : {}}
      onClick={() => !isFinalized && !loading && onClick()}
      className={cn(
        "group relative p-5 rounded-[32px] border transition-all duration-500 overflow-hidden cursor-pointer backdrop-blur-md",
        isPresent
          ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20 shadow-xl shadow-emerald-500/10"
          : "bg-white/80 dark:bg-zinc-950/80 border-zinc-100 dark:border-zinc-900 hover:border-primary/30 shadow-sm",
        (isFinalized || loading) && "opacity-80 cursor-not-allowed pointer-events-none"
      )}
    >
      {/* Dynamic Glow Effect */}
      <AnimatePresence>
        {isPresent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.08] via-transparent to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <div className="relative p-0.5 rounded-[1.25rem] bg-gradient-to-br from-zinc-200 to-transparent dark:from-zinc-800 dark:to-transparent">
              <Avatar className="w-20 h-20 rounded-2xl border-2 border-white dark:border-zinc-900 shadow-md transition-transform duration-500 group-hover:scale-105">
                <AvatarImage src={avatar} alt={name} className="object-cover" />
                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-xl font-bold">
                  {name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <AnimatePresence>
              {isPresent && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -45 }}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-lg z-20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className={cn(
              "font-bold text-sm tracking-tight truncate transition-colors duration-300",
              isPresent ? "text-emerald-900 dark:text-emerald-100" : "text-zinc-900 dark:text-zinc-100"
            )}>
              {name}
            </h4>
            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5 opacity-70">
              {rollNumber}
            </p>
            
            <div className="flex items-center gap-2 mt-2.5">
              <Badge
                variant={isPresent ? "default" : "outline"}
                className={cn(
                  "h-5 px-2.5 text-[9px] font-black uppercase tracking-wider rounded-full transition-all duration-500",
                  isPresent 
                    ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20" 
                    : "bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800"
                )}
              >
                {isPresent ? "Present" : "Absent"}
              </Badge>
              
              {isPresent && (
                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-widest">
                  {state.method === "face" ? (
                    <Scan className="w-3 h-3" />
                  ) : (
                    <ClipboardCheck className="w-3 h-3" />
                  )}
                  <span>{state.method === "face" ? "Auto" : "Manual"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cn(
          "shrink-0 p-2.5 rounded-2xl transition-all duration-500",
          isPresent 
            ? "bg-emerald-500/10 text-emerald-600" 
            : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-300 group-hover:text-zinc-500 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900"
        )}>
          {isPresent ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
      </div>
    </motion.div>
  );
};


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
      whileHover={!isFinalized && !loading ? { y: -2, transition: { duration: 0.2 } } : {}}
      whileTap={!isFinalized && !loading ? { scale: 0.98 } : {}}
      onClick={() => !isFinalized && !loading && onClick()}
      className={cn(
        "group relative p-6 rounded-[32px] border transition-all duration-300 overflow-hidden cursor-pointer",
        isPresent
          ? "bg-emerald-500/5 border-emerald-500/20"
          : "bg-card border-border hover:border-primary/30",
        (isFinalized || loading) && "opacity-80 cursor-not-allowed pointer-events-none"
      )}
    >
      <div className="relative z-10 flex items-start gap-5">
        <div className="relative shrink-0">
          <Avatar className="w-24 h-24 rounded-2xl border-none bg-muted shadow-none transition-transform duration-500 group-hover:scale-105">
            <AvatarImage src={avatar} alt={name} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-2xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <AnimatePresence>
            {isPresent && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: -45 }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500 border-4 border-background flex items-center justify-center shadow-lg z-20"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className={cn(
                "font-bold text-base tracking-tight truncate transition-colors duration-300",
                isPresent ? "text-emerald-900 dark:text-emerald-100" : "text-foreground"
              )}>
                {name}
              </h4>
              {rollNumber && rollNumber !== "N/A" && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                  {rollNumber}
                </p>
              )}
            </div>

            <div className={cn(
              "shrink-0 p-2 rounded-xl transition-all duration-500",
              isPresent 
                ? "bg-emerald-500/10 text-emerald-600" 
                : "bg-muted text-muted-foreground/40 group-hover:text-muted-foreground"
            )}>
              {isPresent ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <Badge
              variant={isPresent ? "default" : "outline"}
              className={cn(
                "h-6 px-3 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300",
                isPresent 
                  ? "bg-emerald-500 hover:bg-emerald-600 border-none" 
                  : "bg-transparent text-muted-foreground border-border"
              )}
            >
              {isPresent ? "Present" : "Absent"}
            </Badge>
            
            {isPresent && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-widest">
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
    </motion.div>
  );
};


import { CheckCircle2, Scan, ClipboardCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const name = profile?.name || student.email?.split("@")[0] || "Student";
  const avatar = profile?.avatar;

  return (
    <div
      onClick={() => !isFinalized && !loading && onClick()}
      aria-label={`Mark ${name} as ${isPresent ? "absent" : "present"}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          !isFinalized && !loading && onClick();
        }
      }}
      className={cn(
        "group relative flex flex-col items-center gap-3.5 p-5 rounded-3xl border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isPresent
          ? "bg-accent/40 border-accent shadow-sm"
          : "bg-background border-border hover:border-accent hover:shadow-xs",
        isFinalized || loading
          ? "cursor-default"
          : "cursor-pointer active:scale-95",
        loading && "opacity-50 pointer-events-none",
      )}
    >
      {isPresent && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary transition-colors">
          {state.method === "face" ? (
            <Scan className="size-2.5" />
          ) : (
            <ClipboardCheck className="size-2.5" />
          )}
          {state.method === "face" ? "Auto" : "Manual"}
        </div>
      )}

      <div className="relative mt-1">
        <Avatar
          className={cn(
            "size-16 border-2 shadow-sm transition-all duration-300",
            isPresent ? "border-primary/20" : "border-background",
          )}
        >
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-base font-black bg-muted text-muted-foreground/60 uppercase">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {isPresent && (
          <div className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-background flex items-center justify-center shadow-lg animate-in zoom-in duration-300 ring-2 ring-background">
            <CheckCircle2 className="size-3 stroke-[3]" />
          </div>
        )}
      </div>

      <div className="text-center space-y-2 w-full">
        <p
          className={cn(
            "text-[10px] font-black truncate px-1 transition-colors leading-none uppercase tracking-tight",
            isPresent ? "text-primary" : "text-foreground",
          )}
        >
          {name}
        </p>

        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "h-4 px-2 text-[8px] rounded-full uppercase font-black tracking-[0.1em] transition-all border-none shadow-none",
              isPresent
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {isPresent ? "Present" : "Absent"}
          </Badge>
        </div>
      </div>
    </div>
  );
};

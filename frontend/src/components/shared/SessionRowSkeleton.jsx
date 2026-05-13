import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SessionRowSkeleton = ({ className }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl border border-border/50",
        "bg-card/40",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Icon Skeleton - rounded-[18px] to match UI */}
        <Skeleton className="w-12 h-12 rounded-[18px] shrink-0" />
        
        <div className="min-w-0 space-y-2 flex-1">
          {/* Class Name */}
          <Skeleton className="h-5 w-2/5 rounded-md" />
          <div className="flex items-center gap-3">
            {/* Time */}
            <Skeleton className="h-3 w-24 rounded-sm" />
            <span className="opacity-20 select-none">•</span>
            {/* Location */}
            <Skeleton className="h-3 w-20 rounded-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        {/* Status Badge Skeleton */}
        <Skeleton className="h-6 w-16 rounded-lg" />
        {/* Arrow Skeleton */}
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
};

export default SessionRowSkeleton;

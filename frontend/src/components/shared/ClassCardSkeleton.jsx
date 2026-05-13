import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ClassCardSkeleton = ({ layout = "grid", className }) => {
  const isList = layout === "list";

  return (
    <Card
      className={cn(
        "group relative flex overflow-hidden",
        isList ? "flex-col sm:flex-row sm:flex-wrap items-center p-4 gap-4" : "flex-col p-7",
        "bg-card border border-border/50 shadow-sm",
        className
      )}
    >
      <div className={cn("flex flex-1 gap-8", isList ? "flex-col sm:flex-row sm:flex-wrap items-center p-0 gap-4 sm:gap-8 w-full" : "flex-col")}>
        {/* Top Section: Icon & Identity */}
        <div className={cn("flex items-start justify-between gap-4", isList ? "w-full sm:w-[200px] sm:shrink-0" : "")}>
          <div className="flex gap-5 items-center min-w-0">
            {/* Icon Skeleton */}
            <Skeleton className={cn("rounded-[22px] shrink-0", isList ? "w-12 h-12 rounded-xl" : "w-16 h-16")} />
            
            <div className="min-w-0 space-y-2 overflow-hidden">
              <Skeleton className={cn("h-6", isList ? "w-24" : "w-32")} />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Info Grid Skeleton */}
        <div className={cn("grid", isList ? "hidden lg:grid grid-cols-4 flex-1 px-8 border-x border-border/40 gap-6 items-center" : "grid-cols-2 gap-x-10 gap-y-6")}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className={cn("flex items-center gap-3", isList ? "flex flex-wrap" : "mt-auto pt-6 border-t border-border/40 justify-between")}>
          <div className="flex items-center gap-4">
            {!isList && (
              <div className="flex -space-x-2 overflow-hidden py-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="w-12 h-12 rounded-full border-2 border-background" />
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2 w-10" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          {!isList && <Skeleton className="w-10 h-10 rounded-full" />}
        </div>

        {isList && (
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default ClassCardSkeleton;

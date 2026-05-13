import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const AttendanceSessionSkeleton = () => {
  return (
    <div className="min-h-[80vh] flex flex-col animate-in fade-in duration-700">
      {/* Ghost Stepper */}
      <div className="w-full bg-background border-b border-border/40">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-12 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 flex-1 last:flex-none">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-2 hidden md:block">
                  <Skeleton className="h-2 w-8" />
                  <Skeleton className="h-3 w-20" />
                </div>
                {i < 4 && <Skeleton className="hidden md:block flex-1 h-[2px] w-12" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-12">
        {/* Main Loading State */}
        <div className="space-y-6 max-w-md">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Loader2 className="w-20 h-20 animate-spin text-primary opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-3">
             <Skeleton className="h-10 w-64 mx-auto rounded-xl" />
             <Skeleton className="h-5 w-80 mx-auto rounded-lg" />
          </div>
        </div>

        {/* Ghost Grid of Students */}
        <div className="w-full max-w-4xl grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 opacity-40 grayscale">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceSessionSkeleton;

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ClassCardSkeleton from "./ClassCardSkeleton";
import SessionRowSkeleton from "./SessionRowSkeleton";

const DashboardSkeleton = () => {
  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-8 space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 px-1">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60 shadow-sm overflow-hidden">
            <CardContent className="p-6 flex flex-col justify-between h-[160px]">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-2 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured Session Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Skeleton className="h-2 w-32" />
          <div className="h-px flex-1 bg-border/40" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <ClassCardSkeleton />
          </div>
          <div className="lg:col-span-4">
            <Card className="h-full border-primary/5 bg-primary/2 p-8 flex flex-col justify-center gap-6">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="pt-2 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-8 h-8 rounded-full border-2 border-background" />
                  ))}
                </div>
                <Skeleton className="h-2 w-24" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-border/60 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <SessionRowSkeleton key={i} />
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 h-fit border-border/60 shadow-sm">
          <CardHeader className="pb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

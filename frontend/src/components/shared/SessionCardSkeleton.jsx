import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionCardSkeleton({ isTeacher = true }) {
  return (
    <Card className="border-border/40 bg-card/50 shadow-sm overflow-hidden h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center gap-2 ml-1">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-md shrink-0" />
        </div>

        <div className="space-y-4">
          {isTeacher && (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/30 border border-border/20">
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

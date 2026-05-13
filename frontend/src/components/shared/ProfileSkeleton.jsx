import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Hero Card Skeleton */}
      <Card className="rounded-3xl overflow-hidden border-none shadow-xl bg-muted/10">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <Skeleton className="w-32 h-32 rounded-full border-4 border-background" />
            
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <Skeleton className="h-10 w-64 rounded-xl" />
                  <Skeleton className="h-6 w-32 rounded-full" />
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-1">
                  <Skeleton className="h-4 w-40 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </div>
              </div>

              <div className="flex gap-4 pt-2 justify-center md:justify-start">
                <Skeleton className="h-16 w-32 rounded-2xl" />
                <Skeleton className="h-16 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Card Skeleton */}
        <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 space-y-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl mt-4" />
          </CardContent>
        </Card>

        {/* Account Security Card Skeleton */}
        <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8 space-y-4">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-2xl mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSkeleton;

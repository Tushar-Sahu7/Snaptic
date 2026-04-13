import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, GraduationCap, Calendar, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  // Calculate stats
  // Historical stats removed per cleanup requirements
  const attendanceRate = 0; 
  const totalRecords = 0;

  return (
    <div className="flex flex-col gap-8 max-w-6xl pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">
            Welcome back, {user?.name || "Student"}!
          </h1>
          <p className="text-muted-foreground font-medium">
            Here's what's happening with your classes today.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-2xl border pr-4">
          <div className="relative inline-block shrink-0">
            <Avatar className={`size-10 border-2 border-background ${user?.faceEnrolled ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-secondary" : ""}`}>
              {user?.avatar && <AvatarImage src={user.avatar} className="object-cover" />}
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {user?.faceEnrolled && (
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-2 border-background text-white shadow-sm">
                <Check className="size-2.5" />
              </div>
            )}
          </div>
          <div className="text-sm">
            <p className="font-bold leading-none">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
              <BookOpen className="size-5" />
            </div>
            <CardTitle className="text-lg">Enrolled Classes</CardTitle>
            <CardDescription>Total classes you are attending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-blue-600">{user?.classCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm transition-all hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
              <GraduationCap className="size-5" />
            </div>
            <CardTitle className="text-lg">Attendance Rate</CardTitle>
            <CardDescription>Your overall presence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              Based on {totalRecords} recorded sessions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border shadow-sm transition-all hover:shadow-md text-white overflow-hidden bg-primary">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Clock className="size-32" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center mb-2">
              <Calendar className="size-5" />
            </div>
            <CardTitle className="text-lg">Next Class</CardTitle>
            <CardDescription className="text-primary-foreground/70">Upcoming session</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-xl font-bold">Advanced Mathematics</div>
            <p className="text-sm text-primary-foreground/80 font-medium">Today at 2:30 PM (Room 402)</p>
            <Badge variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-transparent">
              Starts in 45 mins
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Next Class Focus (Replaces History) */}
      <Card className="rounded-3xl border shadow-sm flex flex-col overflow-hidden">
        <CardHeader className="bg-secondary/10 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>Your upcoming and active classes for today.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-3xl bg-accent flex items-center justify-center mb-4 rotate-3 shadow-sm border">
               <Calendar className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Focus on Today</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm font-medium">
              We've streamlined your dashboard to focus on active sessions. Current attendance history has been moved to professional records.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

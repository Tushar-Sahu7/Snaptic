import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    CheckCircle2, 
    TrendingUp, 
    Clock, 
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 pb-10 px-4 sm:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight">Overview</h1>
        <p className="text-muted-foreground font-medium">
          Welcome back! Here's what's happening in your classes today.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Classes", value: "8", icon: LayoutDashboard, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Students", value: "248", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Attendance Rate", value: "94%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Sessions Today", value: "3", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-3xl border-2 shadow-xs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black">{stat.value}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-2 shadow-xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black">Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to do</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid gap-3">
             <Button 
                variant="outline" 
                className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all font-bold group"
                onClick={() => navigate("/teacher/take-attendance")}
             >
                <div className="size-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 group-hover:bg-emerald-200">
                    <CheckCircle2 className="size-4" />
                </div>
                Take Attendance Now
             </Button>
             <Button 
                variant="outline" 
                className="w-full justify-start h-14 rounded-2xl border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all font-bold group"
                onClick={() => navigate("/teacher/classes")}
             >
                <div className="size-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-200">
                    <Plus className="size-4" />
                </div>
                Manage Your Classes
             </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-2 shadow-xs overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg font-black italic">Dashboard Under Construction</CardTitle>
            <CardDescription>More insights and analytics coming soon</CardDescription>
          </CardHeader>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
             <div className="size-16 rounded-full bg-accent/30 flex items-center justify-center mb-4">
                <Clock className="size-8 text-muted-foreground animate-pulse" />
             </div>
             <p className="text-sm font-medium text-muted-foreground max-w-[200px]">
                We're building advanced analytics for your classes. Stay tuned!
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

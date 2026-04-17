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
    <div>
      <div>
        <h1>Overview</h1>
        <p>
          Welcome back! Here's what's happening in your classes today.
        </p>
      </div>


      {/* Stats Overview */}
      <div>
        {[
          { label: "Active Classes", value: "8", icon: LayoutDashboard },
          { label: "Total Students", value: "248", icon: Users },
          { label: "Attendance Rate", value: "94%", icon: TrendingUp },
          { label: "Sessions Today", value: "3", icon: CheckCircle2 },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent>
              <div>
                <div>
                  <stat.icon />
                </div>
              </div>
              <div>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>


      <div>
        <Card>
          <CardHeader>
            <div>
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks you might want to do</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>

             <Button 
                variant="outline" 
                onClick={() => navigate("/teacher/take-attendance")}
             >
                <div>
                    <CheckCircle2 />
                </div>
                Take Attendance Now
             </Button>

             <Button 
                variant="outline" 
                onClick={() => navigate("/teacher/classes")}
             >
                <div>
                    <Plus />
                </div>
                Manage Your Classes
             </Button>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Under Construction</CardTitle>
            <CardDescription>More insights and analytics coming soon</CardDescription>
          </CardHeader>
          <CardContent>
             <div>
                <Clock />
             </div>
             <p>
                We're building advanced analytics for your classes. Stay tuned!
             </p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

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
    <div>

      {/* Welcome Section */}
      <div>
        <div>
          <h1>
            Welcome back, {user?.name || "Student"}!
          </h1>
          <p>
            Here's what's happening with your classes today.
          </p>
        </div>

        <div>
          <div>
            <Avatar>
              {user?.avatar && <AvatarImage src={user.avatar} />}
              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>

            {user?.faceEnrolled && (
              <div>
                <Check />
              </div>
            )}
          </div>
          <div>
            <p>{user?.name || "User"}</p>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>


      {/* Quick Stats */}
      <div>
        <Card>
          <CardHeader>
            <div>
              <BookOpen />
            </div>
            <CardTitle>Enrolled Classes</CardTitle>
            <CardDescription>Total classes you are attending</CardDescription>
          </CardHeader>
          <CardContent>
            <div>{user?.classCount || 0}</div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <div>
              <GraduationCap />
            </div>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Your overall presence</CardDescription>
          </CardHeader>
          <CardContent>
            <div>{attendanceRate}%</div>
            <p>
              Based on {totalRecords} recorded sessions
            </p>
          </CardContent>
        </Card>


        <Card>
          <div>
            <Clock />
          </div>
          <CardHeader>
            <div>
              <Calendar />
            </div>
            <CardTitle>Next Class</CardTitle>
            <CardDescription>Upcoming session</CardDescription>
          </CardHeader>
          <CardContent>
            <div>Advanced Mathematics</div>
            <p>Today at 2:30 PM (Room 402)</p>
            <Badge variant="secondary">
              Starts in 45 mins
            </Badge>
          </CardContent>
        </Card>
      </div>


      {/* Next Class Focus (Replaces History) */}
      <Card>
        <CardHeader>
          <div>
            <div>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>Your upcoming and active classes for today.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div>
               <Calendar />
            </div>
            <h3>Focus on Today</h3>
            <p>
              We've streamlined your dashboard to focus on active sessions. Current attendance history has been moved to professional records.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}

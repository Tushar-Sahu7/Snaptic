import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { fetchSessionRecords } from "@/features/attendance/api/attendance.api";
import { toast } from "sonner";
import { 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  LayoutDashboard,
  Calendar,
  Users,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceSummaryPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        const { data } = await fetchSessionRecords(sessionId);
        setSession(data.session);
        
        // Calculate stats
        const records = data.records;
        setStats({
          present: records.filter(r => r.status === "present").length,
          absent: records.filter(r => r.status === "absent").length,
          late: records.filter(r => r.status === "late").length,
          total: records.length
        });
      } catch (err) {
        toast.error("Failed to load session summary");
        navigate("/teacher/classes");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div>
        <div>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
        <div>
          <Skeleton />
          <Skeleton />
        </div>
        <Skeleton />
      </div>
    );
  }

  const date = new Date(session.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const presentRate = Math.round((stats.present / stats.total) * 100);

  const isFinalized = session.status === "finalized";

  return (
    <div>

      <div>
        <div>
          {isFinalized ? <Clock /> : <CheckCircle2 />}
        </div>
        <div>

          <h1>
            {isFinalized ? "Session Finalized" : "Attendance Submitted!"}
          </h1>
          <p>

            {isFinalized 
              ? "The official class schedule has ended. This session is now read-only and securely logged."
              : "The session for today has been finalized and recorded in the class history."
            }
          </p>
        </div>
        {isFinalized && (
          <Badge variant="outline">
            Read-Only Asset
          </Badge>
        )}
      </div>


      <div>
        {/* Main Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Clock />
              Session Info
            </CardTitle>
          </CardHeader>

          <CardContent>
             <div>
                <div>
                   <Calendar />
                </div>
                <div>
                   <p>Date</p>
                   <p>{date}</p>
                </div>
             </div>
             
             <div>
                <div>
                   <Users />
                </div>
                <div>
                   <p>Roster Size</p>
                   <p>{stats.total} Registered Students</p>
                </div>
             </div>
          </CardContent>
        </Card>


        {/* Attendance Breakdown */}
        <Card>
           <CardHeader>
            <CardTitle>
              <Users />
              Breakdown
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div>
               <div>
                  <span>Present</span>
                  <span>{presentRate}%</span>
               </div>
               
               <div>
                  <div>
                    <span>{stats.present}</span>
                    <span>Present</span>
                  </div>
                   <div>
                    <span>{stats.absent}</span>
                    <span>Absent</span>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>


      <div>
         <Button 
           size="lg" 
           onClick={() => navigate("/teacher/dashboard")}
         >
           <LayoutDashboard />
           Back to Dashboard
         </Button>
      </div>

    </div>
  );
}

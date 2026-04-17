import {
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  Users,
  Clock,
  MapPin,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassIcon } from "@/components/shared/ClassIcon";
import { useState, useEffect } from "react";
import { format12Hour, formatRoom } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * ReviewStep Component
 * A high-craft verification dashboard for attendance sessions.
 * Features inline editing, glassmorphism, and a gated submission flow.
 */
export const ReviewStep = ({
  session,
  students = [],
  profiles = {},
  attendanceState = {},
  isFinalized,
  isSubmitted,
  loading,
  onSubmit,
  onToggleStatus,
  onEdit,
}) => {
  const navigate = useNavigate();

  /**
   * Auto-scroll to top when submission is successful to ensure the success
   * message is fully visible to the user.
   */
  useEffect(() => {
    if (isSubmitted || isFinalized) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSubmitted, isFinalized]);

  // Alphanumeric sorting logic for a predictable review experience
  const sortedStudents = [...students].sort((a, b) => {
    const nameA = profiles[a._id]?.name || a.email || "";
    const nameB = profiles[b._id]?.name || b.email || "";
    return nameA.localeCompare(nameB);
  });

  const absentees = sortedStudents.filter(
    (s) => attendanceState[s._id]?.status !== "present",
  );
  const presentStudents = sortedStudents.filter(
    (s) => attendanceState[s._id]?.status === "present",
  );

  const presentCount = presentStudents.length;
  const absentCount = absentees.length;

  /**
   * handleToggle
   * Allows teachers to correct status markers directly in the review list.
   */
  const handleToggle = (studentId) => {
    if (isFinalized || isSubmitted || loading) return;

    const currentState = attendanceState[studentId];
    const isPresent = currentState?.status === "present";

    if (isPresent) {
      onToggleStatus(studentId, "absent", "manual");
    } else {
      onToggleStatus(studentId, "present", "manual");
    }
  };

  return (
    <div>

      {!isSubmitted ? (
        <div>
          {/* Header & Stats - Simple Card */}
          <div>
            <div>
              <div>
                <div>
                  <ShieldCheck />
                  Gated Verification
                </div>
                <h1>
                  Review Records
                </h1>
                <p>
                  Verify and correct student attendance markers before final
                  submission to the database.
                </p>
              </div>


              <div>
                <div>
                  <span>
                    {presentCount}
                  </span>
                  <span>
                    Present
                  </span>
                </div>
                <div>
                  <span>
                    {absentCount}
                  </span>
                  <span>
                    Absent
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* Student Lists Breakdown */}
          <div>
            {/* Absentees Section */}
            <div>
              <div>
                <h2>
                  <UserX />
                  Absentees ({absentCount})
                </h2>
                {absentCount === 0 && (
                  <Badge
                    variant="outline"
                  >
                    Full Attendance
                  </Badge>
                )}
              </div>


              <div>

                {absentees.map((s) => {
                  const profile = profiles[s._id] || {};
                  const name =
                    profile.name ||
                    s.name ||
                    s.email?.split("@")[0] ||
                    "Unknown";
                  return (
                    <button
                      key={s._id}
                      onClick={() => handleToggle(s._id)}
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar} alt={name} />
                        <AvatarFallback>
                          {name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p>
                          {name}
                        </p>
                        <p>
                          {s.email?.split("@")[0]}
                        </p>
                      </div>
                      <div>
                        <RotateCcw />
                      </div>
                    </button>

                  );
                })}
                {absentCount === 0 && (
                  <div>
                    <div>
                      <UserCheck />
                    </div>
                    <p>
                      Perfect session recorded
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Present Students Section */}
            <div>
              <h2>
                <UserCheck />
                Present ({presentCount})
              </h2>


              <div>
                {presentStudents.map((s) => {
                  const profile = profiles[s._id] || {};
                  const name =
                    profile.name ||
                    s.name ||
                    s.email?.split("@")[0] ||
                    "Unknown";
                  return (
                    <button
                      key={s._id}
                      onClick={() => handleToggle(s._id)}
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar} alt={name} />
                        <AvatarFallback>
                          {name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p>
                          {name}
                        </p>
                        <p>
                          {s.email?.split("@")[0]}
                        </p>
                      </div>
                      <div>
                        <RotateCcw />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div>
            <Button
              variant="ghost"
              onClick={onEdit}
              disabled={loading}
            >
              <ArrowLeft />
              Recapture Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 />
                  ) : (
                    <ShieldCheck />
                  )}
                  Finish & Submit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    <AlertTriangle />
                    Submit Attendance?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will finalize the records for{" "}
                    <b>{session.classId?.name}</b>. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Not Yet
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onSubmit}
                  >
                    Yes, Finalize
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

      ) : (
        /* Success / Submitted View */
        <div>
          <div>
            <div />
            <div />

            <div>
              <CheckCircle2 />
            </div>

            <div>
              <h3>
                Processed Successfully
              </h3>
              <p>
                {isFinalized
                  ? "This record has been archived and finalized."
                  : "Attendance has been submitted successfully."}
              </p>
            </div>

            {session?.classId && (
              <div>
                <div>
                  <div>
                    <div>
                      <ClassIcon
                        name={session.classId.icon}
                      />
                    </div>
                    <span>
                      Session Recorded For
                    </span>
                    <span>
                      {session.classId.name}
                    </span>
                  </div>
                  <div>
                    <div>
                      <div>
                        <Clock />
                        <span>Schedule</span>
                      </div>
                      <span>
                        {session.classId.schedule?.startTime
                          ? format12Hour(session.classId.schedule.startTime)
                          : "--"}{" "}
                        -{" "}
                        {session.classId.schedule?.endTime
                          ? format12Hour(session.classId.schedule.endTime)
                          : "--"}
                      </span>
                    </div>
                    <div>
                      <div>
                        <MapPin />
                        <span>Location</span>
                      </div>
                      <span>
                        {session.classId.schedule?.room
                          ? formatRoom(session.classId.schedule.room)
                          : "No Room Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <div>
                <span>
                  {presentCount}
                </span>
                <span>
                  Present
                </span>
              </div>
              <div>
                <span>
                  {absentCount}
                </span>
                <span>
                  Absent
                </span>
              </div>
            </div>
          </div>

          <div>
            <Button
              size="lg"
              onClick={() => navigate(`/teacher/dashboard`)}
            >
              Return to Dashboard
            </Button>
            {isSubmitted && !isFinalized && (
              <Button
                variant="link"
                onClick={onEdit}
              >
                Mistake? Correct Records
              </Button>
            )}
          </div>
        </div>

      )}
    </div>
  );
};

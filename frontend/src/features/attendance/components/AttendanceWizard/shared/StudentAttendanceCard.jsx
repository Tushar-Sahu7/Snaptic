import { CheckCircle2, Scan, ClipboardCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";


export const StudentAttendanceCard = ({
  student,
  state,
  profile,
  isFinalized,
  loading,
  onClick,
}) => {
  const isPresent = state?.status === "present";
  const name = profile?.name || student.email?.split("@")[0] || "Student";
  const avatar = profile?.avatar;

  return (
    <div
      onClick={() => !isFinalized && !loading && onClick()}
      aria-label={`Mark ${name} as ${isPresent ? "absent" : "present"}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          !isFinalized && !loading && onClick();
        }
      }}
    >

      {isPresent && (
        <div>
          {state.method === "face" ? (
            <Scan />
          ) : (
            <ClipboardCheck />
          )}
          {state.method === "face" ? "Auto" : "Manual"}
        </div>
      )}


      <div>
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>


        {isPresent && (
          <div>
            <CheckCircle2 />
          </div>
        )}
      </div>


      <div>
        <p>
          {name}
        </p>


        <div>
          <Badge
            variant="outline"
          >
            {isPresent ? "Present" : "Absent"}
          </Badge>
        </div>
      </div>

    </div>
  );
};

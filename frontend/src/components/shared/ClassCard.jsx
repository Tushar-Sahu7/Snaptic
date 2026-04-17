import { memo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CalendarDays, MapPin, Clock } from "lucide-react";
import { ClassIcon } from "./ClassIcon";
import { formatDays, format12Hour, formatRoom } from "@/lib/utils";


const calculateDuration = (start, end) => {
  if (!start || !end) return "";
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const totalMinutes = eh * 60 + em - (sh * 60 + sm);
    if (totalMinutes <= 0) return "";
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m` : ""}`.trim();
  } catch (e) {
    return "";
  }
};

/**
 * Shared ClassCard component using a slot-based composition pattern.
 * Supports Teacher, Student, and Attendance Selection views.
 *
 * Slots:
 * - badge: React node for status badges (top-right)
 * - actions: React node for management tools (top-right)
 * - footer: React node for bottom content/buttons
 */
const ClassCard = memo(
  ({
    cls,
    onClick,
    badge,
    actions,
    footer,
    variant = "default",
    className,
  }) => {
    const duration = calculateDuration(
      cls.schedule?.startTime,
      cls.schedule?.endTime,
    );
    const isArchived = cls.status === "archived";

    return (
      <Card
        className={className}
        onClick={() => onClick?.(cls._id)}
      >

        <CardContent>

          {/* Header Section */}
          <div>
            <div>
              <div>

                <ClassIcon name={cls.icon} />
              </div>

              <div>
                <div>
                  <h3>

                    {cls.name}
                  </h3>
                  {isArchived && (
                    <Badge variant="outline">
                      Archived
                    </Badge>

                  )}
                </div>
                <div>
                  <MapPin />

                  <span className="truncate">
                    {cls.schedule?.room
                      ? formatRoom(cls.schedule.room)
                      : "No Room Set"}
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={(e) => e.stopPropagation()}
            >

              {badge}
              {actions}
            </div>
          </div>

          {/* Schedule & Stats Section */}
          <div>
            <div>
              <Clock />
              <div>
                <span>

                  {cls.schedule?.startTime
                    ? format12Hour(cls.schedule.startTime)
                    : "--"}{" "}
                  -{" "}
                  {cls.schedule?.endTime
                    ? format12Hour(cls.schedule.endTime)
                    : "--"}
                </span>
                {duration && (
                  <span>
                    ({duration})
                  </span>
                )}
              </div>
            </div>

            <div>
              <CalendarDays />
              <span>

                {cls.schedule?.days?.length > 0
                  ? formatDays(cls.schedule.days)
                  : "No days set"}
              </span>
            </div>

            <div>
              <Users />
              <span>
                {cls.studentCount || cls.studentIds?.length || 0} Students
                Enrolled
              </span>
            </div>
          </div>

          {footer && (
            <div
              onClick={(e) => e.stopPropagation()}
            >
              {footer}
            </div>
          )}

        </CardContent>
      </Card>
    );
  },
);

ClassCard.displayName = "ClassCard";

export default ClassCard;

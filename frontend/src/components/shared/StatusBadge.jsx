import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  scheduled: {
    label: "Scheduled",
    className: "bg-[--color-status-scheduled] text-white hover:bg-[--color-status-scheduled]/90",
  },
  inprogress: {
    label: "In Progress",
    className: "bg-[--color-status-inprogress] text-white hover:bg-[--color-status-inprogress]/90 animate-pulse",
  },
  submitted: {
    label: "Submitted",
    className: "bg-[--color-status-submitted] text-white hover:bg-[--color-status-submitted]/90",
  },
  finalized: {
    label: "Finalized",
    className: "bg-[--color-status-finalized] text-white hover:bg-[--color-status-finalized]/90",
  },
  missed: {
    label: "Missed",
    className: "bg-[--color-status-missed] text-white hover:bg-[--color-status-missed]/90",
  },
};

export function StatusBadge({ status, className }) {
  if (!status || !statusConfig[status]) return null;
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("border-none", config.className, className)}>
      {config.label}
    </Badge>
  );
}

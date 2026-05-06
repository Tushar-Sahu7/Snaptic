import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Eye } from "lucide-react";

/**
 * ViewRecordButton
 *
 * A simple, self-routing button that navigates to the session summary/records page.
 * Always renders as `variant="outline"`.
 *
 * @param {object}   session   - The session object (must include _id).
 * @param {boolean}  showText  - Whether to show the "View" label. Defaults to true.
 * @param {string}   size      - Button size override. Auto-detected from screen width if omitted.
 * @param {string}   className - Additional className for layout purposes.
 */
export const ViewRecordButton = ({
  session,
  showText = true,
  size,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!session?._id) return null;

  const resolvedSize = size || (isMobile ? "default" : "xl");

  const buttonSize = showText
    ? resolvedSize
    : resolvedSize === "xl" ? "icon-xl" : resolvedSize === "lg" ? "icon-lg" : resolvedSize === "sm" ? "icon-sm" : "icon";

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/teacher/attendance/${session._id}/summary`);
  };

  const button = (
    <Button
      size={buttonSize}
      className={className}
      onClick={handleClick}
      {...props}
    >
      <Eye data-icon={showText ? "inline-start" : undefined} />
      {showText && "View"}
    </Button>
  );

  if (!showText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>View Records</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

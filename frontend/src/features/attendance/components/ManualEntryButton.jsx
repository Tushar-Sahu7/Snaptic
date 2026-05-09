import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { SquarePen } from "lucide-react";

/**
 * ManualEntryButton
 *
 * A simple, self-routing button that navigates directly to the manual mark step
 * (Step 3) of the attendance wizard. Always renders as `variant="outline"`.
 *
 * @param {object}   cls       - The class object (must include _id).
 * @param {boolean}  showText  - Whether to show the "Manual" label. Defaults to true.
 * @param {string}   size      - Button size override. Auto-detected from screen width if omitted.
 * @param {function} onClick   - Optional click override. Receives (cls). Return false to prevent navigation.
 * @param {string}   className - Additional className for layout purposes.
 */
export const ManualEntryButton = ({
  cls,
  showText = true,
  size,
  onClick,
  className,
  ...props
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!cls) return null;

  const resolvedSize = size || (isMobile ? "default" : "xl");

  const buttonSize = showText
    ? resolvedSize
    : resolvedSize === "xl" ? "icon-xl" : resolvedSize === "lg" ? "icon-lg" : resolvedSize === "sm" ? "icon-sm" : "icon";

  const handleClick = (e) => {
    e.stopPropagation();

    // Allow parent to intercept
    if (onClick) {
      const result = onClick(cls);
      if (result === false) return;
    }

    navigate(`/teacher/take-attendance?classId=${cls._id}&manual=true`);
  };

  const button = (
    <Button
      size={buttonSize}
      className={className}
      onClick={handleClick}
      {...props}
    >
      <SquarePen data-icon={showText ? "inline-start" : undefined} />
      {showText && "Manual"}
    </Button>
  );

  // Wrap in tooltip when icon-only for accessibility
  if (!showText) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>Manual Entry</TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

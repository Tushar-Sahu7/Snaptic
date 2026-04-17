import { useState } from "react";
import { useAttendanceAction } from "@/features/attendance/hooks/useAttendanceAction";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { AttendanceResetButton } from "@/features/attendance/components/AttendanceResetButton";

export const AttendanceButton = ({ cls, session, onSelect }) => {
  const { isSplit, primary, secondary } = useAttendanceAction(cls, session);

  const isMobile = useIsMobile();

  if (!primary) return null;

  // Responsive sizing via props, not className overrides
  const btnSize = isMobile ? "sm" : "default";

  const handleSelect = (mode) => {
    if (primary.disabled && mode === primary.mode) return;



    onSelect?.(cls, mode);
  };

  const resolveVariant = (v) => (v === "secondary" ? "outline" : v);

  // --- Split: two related buttons ---
  if (isSplit || secondary) {
    const isReset = secondary.mode === "reset";

    // Nested ButtonGroup: [Primary] gap [Trash]
    if (isReset) {
      return (
        <>
          <ButtonGroup className="w-full">
            <ButtonGroup className="flex-1">
              <Button
                size={btnSize}
                className="w-full"
                disabled={primary.disabled}
                variant={resolveVariant(primary.variant)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(primary.mode);
                }}
              >
                {primary.icon && <primary.icon data-icon="inline-start" />}
                {primary.label}
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <AttendanceResetButton
                sessionId={session?._id}
                disabled={secondary.disabled}
                aria-label="Reset session"
              />
            </ButtonGroup>
          </ButtonGroup>
        </>
      );
    }

    return (
      <ButtonGroup className="w-full">
        <ButtonGroup className="flex-1">
          <Button
            size={btnSize}
            className="w-full"
            disabled={primary.disabled}
            variant={resolveVariant(primary.variant)}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(primary.mode);
            }}
          >
            {primary.icon && <primary.icon data-icon="inline-start" />}
            {primary.label}
          </Button>
        </ButtonGroup>
        <ButtonGroup className="flex-1">
          <Button
            size={btnSize}
            className="w-full"
            disabled={secondary.disabled}
            variant={secondary.variant || "outline"}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(secondary.mode);
            }}
          >
            {secondary.icon && <secondary.icon data-icon="inline-start" />}
            {secondary.label}
          </Button>
        </ButtonGroup>
      </ButtonGroup>
    );
  }

  // --- Single button (off-schedule, no students, view records) ---
  return (
    <Button
      size={btnSize}
      className="w-full"
      disabled={primary.disabled}
      variant={resolveVariant(primary.variant)}
      onClick={(e) => {
        e.stopPropagation();
        handleSelect(primary.mode);
      }}
    >
      {primary.icon && <primary.icon data-icon="inline-start" />}
      {primary.label}
    </Button>
  );
};

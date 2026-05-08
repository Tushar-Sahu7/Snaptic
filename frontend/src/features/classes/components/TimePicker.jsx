import React, { useState, useEffect, useCallback } from "react";
import { format, parse, isValid } from "date-fns";
import { Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

/**
 * A hybrid Time Picker that allows both typing and selecting from a dropdown.
 * Uses 12-hour format for display/input and 24-hour HH:mm for value/onChange.
 */
export function TimePicker({
  value,
  onChange,
  onInput,
  disabledHours = [],
  placeholder = "Select time",
  className,
  id,
  "aria-invalid": ariaInvalid,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Sync internal input state with external value
  useEffect(() => {
    if (value) {
      try {
        const [h, m] = value.split(":").map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        setInputValue(format(date, "hh:mm a"));
      } catch (e) {
        setInputValue(value);
      }
    } else {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onInput?.(); // Clear error on typing
  };

  const validateAndSubmit = useCallback(
    (val) => {
      if (!val) {
        onChange?.("");
        return;
      }

      const formats = [
        "hh:mm a",
        "h:mm a",
        "HH:mm",
        "H:mm",
        "hh a",
        "h a",
        "HH",
        "h:mma",
        "hh:mma",
      ];

      let parsedDate = null;
      for (const fmt of formats) {
        const d = parse(val.toUpperCase(), fmt, new Date());
        if (isValid(d)) {
          parsedDate = d;
          break;
        }
      }

      if (parsedDate) {
        const hhmm = format(parsedDate, "HH:mm");
        onChange?.(hhmm);
      } else {
        if (value) {
          const [h, m] = value.split(":").map(Number);
          const date = new Date();
          date.setHours(h, m, 0, 0);
          setInputValue(format(date, "hh:mm a"));
        } else {
          setInputValue("");
        }
      }
    },
    [onChange, value],
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      validateAndSubmit(inputValue);
      setIsOpen(false);
    }
  };

  const handleSelect = (hhmm) => {
    onChange?.(hhmm);
    setIsOpen(false);
  };

  const timeOptions = Array.from({ length: 24 }).map((_, i) => {
    const date = new Date();
    date.setHours(i, 0, 0, 0);
    return {
      label: format(date, "hh:mm a"),
      value: format(date, "HH:mm"),
      hour: i,
    };
  });

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group cursor-pointer">
            <Input
              id={id}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={() => validateAndSubmit(inputValue)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-invalid={ariaInvalid}
              className={cn(
                "h-12 w-full pl-10 pr-10 rounded-xl bg-muted/50 border-border font-bold text-sm transition-all focus-visible:ring-primary/20",
                ariaInvalid && "border-destructive ring-destructive/20"
              )}
              autoComplete="off"
            />
            <Clock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none transition-colors group-focus-within:text-primary"
            />
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none transition-colors group-focus-within:text-primary"
            />
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-1 rounded-xl shadow-xl border-border bg-popover"
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onWheel={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            className="max-h-64 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-0.5">
              {timeOptions.map((opt) => {
                const isDisabled = disabledHours.includes(opt.hour);
                const isSelected = value === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start font-bold text-xs tabular-nums h-10 rounded-lg px-3 shrink-0",
                      isSelected &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      isDisabled &&
                        "opacity-25 cursor-not-allowed pointer-events-none",
                    )}
                    onClick={() => handleSelect(opt.value)}
                    disabled={isDisabled}
                  >
                    {opt.label}
                    {isSelected && (
                      <div className="ml-auto size-1.5 rounded-full bg-current" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

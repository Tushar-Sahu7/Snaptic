import React, { useState, useMemo, useEffect } from "react";
import {
  useCreateClass,
  useUpdateClass,
} from "@/features/classes/hooks/useClasses";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { ColorPicker } from "@/components/ui/color-picker";
import { format } from "date-fns";
import {
  Clock,
  Navigation,
  Calendar as CalendarIcon,
  Sparkles,
  Type,
} from "lucide-react";
import { cn, WEEKDAYS, format12Hour } from "@/lib/utils";
import { IconPicker, Icon as LucideIcon } from "@/components/ui/icon-picker";
import { motion } from "motion/react";

import {
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/color-picker";

// RGB (0-255) → OKLCH string conversion
function rgbToOklch(r, g, b) {
  // sRGB to linear
  const linearize = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const lr = linearize(r),
    lg = linearize(g),
    lb = linearize(b);

  // Linear RGB to XYZ (D65)
  const x = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const y = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const z = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  // XYZ to LMS
  const l = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const m = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const s = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);

  // LMS to Oklab
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bk = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  // Oklab to OKLCH
  const C = Math.sqrt(a * a + bk * bk);
  let H = (Math.atan2(bk, a) * 180) / Math.PI;
  if (H < 0) H += 360;

  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H.toFixed(3)})`;
}

const PRESET_COLORS = [
  "oklch(0.585 0.233 277.117)", // Indigo
  "oklch(0.637 0.237 25.331)", // Red
  "oklch(0.795 0.184 86.047)", // Amber
  "oklch(0.765 0.177 163.223)", // Emerald
  "oklch(0.623 0.214 259.815)", // Blue
  "oklch(0.606 0.25 292.717)", // Violet
  "oklch(0.656 0.241 354.308)", // Pink
  "oklch(0.724 0.192 47.604)", // Orange
  "oklch(0.715 0.143 215.221)", // Cyan
  "oklch(0.745 0.142 181.028)", // Teal
  "oklch(0.552 0.016 286.067)", // Zinc
  "oklch(0 0 0)", // Black
];

const DURATION_PRESETS = [
  { label: "30 Minutes", value: "30" },
  { label: "45 Minutes", value: "45" },
  { label: "1 Hour", value: "60" },
  { label: "1.5 Hours", value: "90" },
  { label: "2 Hours", value: "120" },
  { label: "3 Hours", value: "180" },
  { label: "Custom...", value: "custom" },
];

export default function ClassFormDialog({
  open,
  onOpenChange,
  onSuccess,
  classData,
}) {
  const isEdit = !!classData;
  const createMutation = useCreateClass();
  const updateMutation = useUpdateClass();

  // State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("book-open");
  const [color, setColor] = useState("oklch(0.585 0.233 277.117)");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState(1);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [location, setLocation] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Time intervals for select
  const timeIntervals = useMemo(() => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      times.push(`${i.toString().padStart(2, "0")}:00`);
    }
    return times;
  }, []);

  useEffect(() => {
    if (open) {
      if (isEdit && classData) {
        setName(classData.name || "");
        setDescription(classData.description || "");
        setIcon(classData.icon || "book-open");
        setColor(classData.color || "oklch(0.585 0.233 277.117)");

        setStartDate(classData.startDate || "");
        setEndDate(classData.endDate || "");
        setStartTime(classData.startTime || "09:00");

        const d = classData.duration || 60;
        setDuration(d);
        const isCustom = !DURATION_PRESETS.find(
          (p) => p.value === d.toString(),
        );
        setIsCustomDuration(isCustom);
        if (isCustom) {
          setCustomHours(Math.floor(d / 60));
          setCustomMinutes(d % 60);
        }

        setDaysOfWeek(classData.daysOfWeek || []);
        setLocation(classData.location || "");
      } else {
        setName("");
        setDescription("");
        setIcon("book-open");
        setColor("oklch(0.585 0.233 277.117)");

        const today = new Date();
        const sixMonthsLater = new Date();
        sixMonthsLater.setMonth(today.getMonth() + 6);

        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(sixMonthsLater.toISOString().split("T")[0]);

        // Calculate next closest hour
        const nextHour = new Date(today);
        nextHour.setHours(today.getHours() + 1, 0, 0, 0);
        const nextHourStr = `${nextHour.getHours().toString().padStart(2, "0")}:${nextHour.getMinutes().toString().padStart(2, "0")}`;

        setStartTime(nextHourStr);
        setDuration(60);
        setIsCustomDuration(false);
        setCustomHours(1);
        setCustomMinutes(0);
        setDaysOfWeek([]);
        setLocation("");
      }
    }
    setFieldErrors({});
  }, [open, isEdit, classData]);

  const toggleDay = (dayInt) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayInt)
        ? prev.filter((d) => d !== dayInt)
        : [...prev, dayInt].sort(),
    );
  };

  const handleDurationChange = (val) => {
    if (val === "custom") {
      setIsCustomDuration(true);
    } else {
      setIsCustomDuration(false);
      setDuration(parseInt(val));
    }
  };

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    const errors = {};

    if (!name.trim()) errors.name = "Class name is required.";
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (daysOfWeek.length === 0) errors.daysOfWeek = "Select at least one day.";
    const finalDuration = isCustomDuration
      ? customHours * 60 + customMinutes
      : parseInt(duration);
    if (finalDuration <= 0) errors.duration = "Enter a valid duration.";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        startDate,
        endDate,
        startTime,
        duration: finalDuration,
        daysOfWeek,
        location: location.trim(),
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ classId: classData._id, payload });
        toast.success("Class updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Class created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An unexpected error occurred",
      );
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border bg-background shadow-2xl rounded-3xl max-h-[90vh] flex flex-col">
        <div className="relative h-32 bg-muted/30 flex items-center px-8 border-b border-border shrink-0">
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                style={{ backgroundColor: color }}
              />
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
                style={{ backgroundColor: color }}
              >
                <LucideIcon name={icon} size={42} strokeWidth={1.5} />
              </div>
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                {name || (isEdit ? "Edit Class" : "New Class")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">
                Set up your class details and schedule.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* Identity Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles size={12} /> Class Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field data-invalid={!!fieldErrors.name}>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                  Name
                </FieldLabel>
                <div className="relative">
                  <Input
                    placeholder="e.g. Advanced Mathematics"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    aria-invalid={!!fieldErrors.name}
                    className="h-12 px-10 rounded-xl bg-muted/50 border-border text-base font-bold tracking-tight focus-visible:ring-primary/20"
                  />
                  <Type
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                  />
                </div>
                {fieldErrors.name && (
                  <FieldError>{fieldErrors.name}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                  Location
                </FieldLabel>
                <div className="relative">
                  <Input
                    placeholder="e.g. Room 402 / Online"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-muted/50 border-border text-sm font-bold"
                  />
                  <Navigation
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                  Icon & Color
                </FieldLabel>
                <div className="flex items-center gap-3">
                  <IconPicker
                    value={icon}
                    onValueChange={setIcon}
                    modal={true}
                    align="start"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      className="size-12 rounded-xl border-border flex items-center justify-center transition-all shrink-0 shadow-sm"
                    >
                      <LucideIcon name={icon} size={20} strokeWidth={2.5} />
                    </Button>
                  </IconPicker>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-border justify-start font-bold bg-muted/50 overflow-hidden"
                      >
                        <div
                          className="size-5 rounded-md mr-3 shadow-sm shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-muted-foreground truncate">
                          {color}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3" align="start">
                      <ColorPicker
                        value={color}
                        onChange={([r, g, b, a]) => {
                          const rr = Math.round(r),
                            gg = Math.round(g),
                            bb = Math.round(b);
                          const oklch = rgbToOklch(rr, gg, bb);
                          setColor(
                            a < 1 ? oklch.replace(")", ` / ${a})`) : oklch,
                          );
                        }}
                        className="h-auto w-full gap-2"
                      >
                        <ColorPickerSelection className="h-36 rounded-lg" />
                        <ColorPickerHue />
                        <ColorPickerAlpha />
                        <div className="flex items-center gap-2 mt-2">
                          <ColorPickerEyeDropper />
                          <ColorPickerOutput />
                          <ColorPickerFormat />
                        </div>
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                  Description (Optional)
                </FieldLabel>
                <Input
                  placeholder="e.g. Fundamental physics principles"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 px-4 rounded-xl bg-muted/50 border-border text-sm font-medium"
                />
              </Field>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Schedule Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Clock size={12} /> Time & Schedule
            </h3>

            <div className="flex flex-col gap-6">
              <Field
                data-invalid={!!(fieldErrors.startDate || fieldErrors.endDate)}
              >
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                  Validity Period
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "h-12 flex-1 justify-start text-left font-bold text-xs rounded-xl bg-muted/50 border-border",
                          !startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(new Date(startDate), "dd/MM/yyyy")
                        ) : (
                          <span>Start</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      collisionPadding={12}
                    >
                      <Calendar
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const tzOffsetDate = new Date(
                              date.getTime() - date.getTimezoneOffset() * 60000,
                            );
                            setStartDate(
                              tzOffsetDate.toISOString().split("T")[0],
                            );
                          } else {
                            setStartDate("");
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                        captionLayout="dropdown"
                        startMonth={new Date(new Date().getFullYear(), 0)}
                        endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="h-px w-3 bg-muted-foreground/30 shrink-0" />

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        type="button"
                        className={cn(
                          "h-12 flex-1 justify-start text-left font-bold text-xs rounded-xl bg-muted/50 border-border",
                          !endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(new Date(endDate), "dd/MM/yyyy")
                        ) : (
                          <span>End</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      collisionPadding={12}
                    >
                      <Calendar
                        mode="single"
                        selected={endDate ? new Date(endDate) : undefined}
                        defaultMonth={endDate ? new Date(endDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const tzOffsetDate = new Date(
                              date.getTime() - date.getTimezoneOffset() * 60000,
                            );
                            setEndDate(
                              tzOffsetDate.toISOString().split("T")[0],
                            );
                          } else {
                            setEndDate("");
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date(
                            new Date().setHours(0, 0, 0, 0),
                          );
                          if (startDate) {
                            const start = new Date(startDate + "T00:00:00");
                            return date < start;
                          }
                          return date < today;
                        }}
                        initialFocus
                        captionLayout="dropdown"
                        startMonth={new Date(new Date().getFullYear(), 0)}
                        endMonth={new Date(new Date().getFullYear() + 10, 11)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {(fieldErrors.startDate || fieldErrors.endDate) && (
                  <FieldError>
                    {fieldErrors.startDate || fieldErrors.endDate}
                  </FieldError>
                )}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                    Start Time
                  </FieldLabel>
                  <div className="relative">
                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="data-[size=default]:h-12 w-full pl-10 rounded-xl bg-muted/50 border-border font-bold text-sm">
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48 rounded-xl">
                        {timeIntervals.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-xs font-bold"
                          >
                            {format12Hour(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Clock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                    />
                  </div>
                </Field>

                <Field data-invalid={!!fieldErrors.duration}>
                  <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">
                    Duration
                  </FieldLabel>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Select
                        value={
                          isCustomDuration ? "custom" : duration.toString()
                        }
                        onValueChange={handleDurationChange}
                      >
                        <SelectTrigger className="data-[size=default]:h-12 w-full pl-10 rounded-xl bg-muted/50 border-border font-bold text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="max-h-48 rounded-xl">
                          {DURATION_PRESETS.map((p) => (
                            <SelectItem
                              key={p.value}
                              value={p.value}
                              className="text-xs font-bold"
                            >
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Clock
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none"
                      />
                    </div>

                    {isCustomDuration && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-1 flex gap-3"
                      >
                        <div className="relative" style={{ minWidth: "90px" }}>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={customHours}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomHours(Math.max(0, Math.min(23, val)));
                            }}
                            className="h-12 pr-10 rounded-xl bg-muted/30 border-border text-sm font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/60 uppercase">
                            Hr
                          </span>
                        </div>
                        <div className="relative" style={{ minWidth: "90px" }}>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={customMinutes}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomMinutes(Math.max(0, Math.min(59, val)));
                            }}
                            className="h-12 pr-12 rounded-xl bg-muted/30 border-border text-sm font-bold text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/60 uppercase">
                            Min
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {fieldErrors.duration && (
                    <FieldError>{fieldErrors.duration}</FieldError>
                  )}
                </Field>
              </div>
            </div>

            <Field data-invalid={!!fieldErrors.daysOfWeek}>
              <div className="flex justify-between items-center mb-4">
                <FieldLabel className="text-xs font-bold text-muted-foreground block">
                  Days of the Week
                </FieldLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const monToSat = [1, 2, 3, 4, 5, 6];
                    const hasAllMonSat =
                      monToSat.every((d) => daysOfWeek.includes(d)) &&
                      !daysOfWeek.includes(0);
                    if (hasAllMonSat) {
                      setDaysOfWeek([]);
                    } else {
                      setDaysOfWeek(monToSat);
                    }
                  }}
                  className="h-6 text-[10px] uppercase font-bold text-primary hover:bg-primary/5"
                >
                  Mon–Sat
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day, i) => {
                  const dayInt = i;
                  const isSelected = daysOfWeek.includes(dayInt);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(dayInt)}
                      className={cn(
                        "h-12 flex-1 min-w-[60px] rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                        isSelected
                          ? "bg-primary border-transparent text-white shadow-lg shadow-primary/20 -translate-y-1"
                          : "bg-background border-border text-muted-foreground hover:border-foreground/20",
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.daysOfWeek && (
                <FieldError>{fieldErrors.daysOfWeek}</FieldError>
              )}
            </Field>
          </div>
        </form>

        <DialogFooter className="p-8 bg-muted/20 border-t border-border flex-row gap-3">
          <Button
            variant="ghost"
            type="button"
            className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-[2] h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {submitting
              ? "Processing..."
              : isEdit
                ? "Update Class"
                : "Create Class"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

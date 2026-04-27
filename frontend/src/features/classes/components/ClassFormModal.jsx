import React, { useState, useMemo, useEffect } from "react";
import {
  createClass,
  updateClass,
  fetchLabels,
} from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Clock,
  Navigation,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Globe,
} from "lucide-react";
import { cn, WEEKDAYS, format12Hour } from "@/lib/utils";
import { TimezonePicker } from "@/components/shared/TimezonePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPicker, Icon as LucideIcon } from "@/components/ui/icon-picker";

function ScheduleItem({
  schedule,
  index,
  labels,
  onChange,
  onRemove,
  timeIntervals,
}) {
  const toggleDay = (dayInt) => {
    const currentDays = schedule.days || [];
    const newDays = currentDays.includes(dayInt)
      ? currentDays.filter((d) => d !== dayInt)
      : [...currentDays, dayInt].sort();
    onChange(index, { days: newDays });
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4 relative group">
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <Trash2 size={14} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Session Label</FieldLabel>
          <Select
            value={schedule.labelId}
            onValueChange={(val) => onChange(index, { labelId: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Label (e.g. Lecture)" />
            </SelectTrigger>
            <SelectContent>
              {labels.map((l) => (
                <SelectItem key={l._id} value={l._id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Location / Room</FieldLabel>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="e.g. Room 101, Lab B"
              value={schedule.location || ""}
              onChange={(e) => onChange(index, { location: e.target.value })}
            />
          </div>
        </Field>
      </div>

      <Field>
        <FieldLabel>Days of Week</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day, i) => {
            const dayInt = i + 1; // 1 = Monday
            const isSelected = schedule.days?.includes(dayInt);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(dayInt)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Start Time</FieldLabel>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
              value={schedule.startTime}
              onChange={(e) => onChange(index, { startTime: e.target.value })}
            >
              {timeIntervals.map((t) => (
                <option key={t} value={t}>
                  {format12Hour(t)}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field>
          <FieldLabel>Duration (min)</FieldLabel>
          <Input
            type="number"
            min="15"
            step="15"
            value={schedule.duration}
            onChange={(e) =>
              onChange(index, { duration: parseInt(e.target.value) || 0 })
            }
          />
        </Field>
      </div>
    </div>
  );
}

export default function ClassFormModal({
  open,
  onOpenChange,
  onSuccess,
  classData,
}) {
  const isEdit = !!classData;

  // Global State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("oklch(0.6 0.2 250)");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [labels, setLabels] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Time intervals for select
  const timeIntervals = useMemo(() => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        times.push(
          `${i.toString().padStart(2, "0")}:${j.toString().padStart(2, "0")}`,
        );
      }
    }
    return times;
  }, []);

  useEffect(() => {
    if (open) {
      loadLabels();
      if (isEdit && classData) {
        setName(classData.name || "");
        setDescription(classData.description || "");
        setIcon(classData.icon || "BookOpen");
        setColor(classData.color || "oklch(0.6 0.2 250)");
        setTimezone(classData.timezone || "Asia/Kolkata");
        setStartDate(new Date(classData.startDate).toISOString().split("T")[0]);
        setEndDate(new Date(classData.endDate).toISOString().split("T")[0]);
        setSchedules(classData.schedules || []);
      } else {
        // Defaults for new class
        setName("");
        setDescription("");
        setIcon("BookOpen");
        setStartDate(new Date().toISOString().split("T")[0]);
        // Set end date to 3 months from now
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        setEndDate(d.toISOString().split("T")[0]);
        setSchedules([
          {
            labelId: "",
            days: [],
            startTime: "09:00",
            duration: 60,
            location: "",
          },
        ]);
      }
    }
  }, [open, isEdit, classData]);

  const loadLabels = async () => {
    try {
      const { data } = await fetchLabels();
      setLabels(data.labels);
    } catch (err) {
      console.error("Failed to load labels");
    }
  };

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      { labelId: "", days: [], startTime: "09:00", duration: 60, location: "" },
    ]);
  };

  const removeSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index, updates) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], ...updates };
    setSchedules(newSchedules);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) return setFormError("Class name is required.");
    if (!endDate) return setFormError("End date is required.");
    if (schedules.length === 0)
      return setFormError("At least one schedule is required.");

    const invalidSchedule = schedules.find(
      (s) => !s.labelId || s.days.length === 0,
    );
    if (invalidSchedule)
      return setFormError(
        "Each schedule must have a label and at least one day selected.",
      );

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description,
        icon,
        color,
        timezone,
        startDate,
        endDate,
        schedules,
      };

      if (isEdit) {
        await updateClass(classData._id, payload);
        toast.success("Class updated successfully");
      } else {
        await createClass(payload);
        toast.success("Class created successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Class" : "Create New Class"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Modify class details and schedules."
              : "Set up your class, schedule, and timezone."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Field>
                <FieldLabel>Class Identity</FieldLabel>
                <div className="flex gap-3">
                  <IconPicker value={icon} onValueChange={setIcon}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors border border-border"
                    >
                      <LucideIcon name={icon} size={24} />
                    </Button>
                  </IconPicker>
                  <Input
                    placeholder="e.g. CS101 - Web Development"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel>Description (Optional)</FieldLabel>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Course overview, syllabus links, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
            </div>

            <div className="space-y-6">
              <Field>
                <FieldLabel>Timezone & Schedule Range</FieldLabel>
                <div className="space-y-4 p-4 rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <TimezonePicker
                      value={timezone}
                      onChange={setTimezone}
                      disabled={isEdit}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <CalendarIcon size={10} /> Start Date
                      </span>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isEdit && new Date(startDate) < new Date()}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <CalendarIcon size={10} /> End Date
                      </span>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Field>
            </div>
          </div>

          {/* Schedules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Schedules
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSchedule}
                className="gap-2"
              >
                <Plus size={14} /> Add Pattern
              </Button>
            </div>

            <div className="space-y-6">
              {schedules.map((s, i) => (
                <ScheduleItem
                  key={i}
                  index={i}
                  schedule={s}
                  labels={labels}
                  onChange={updateSchedule}
                  onRemove={removeSchedule}
                  timeIntervals={timeIntervals}
                />
              ))}
            </div>
          </div>

          {formError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3">
              <AlertCircle size={18} />
              {formError}
            </div>
          )}

          <DialogFooter className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-4 border-t border-border">
            <Button
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[140px]"
            >
              {submitting
                ? "Processing..."
                : isEdit
                  ? "Save Changes"
                  : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

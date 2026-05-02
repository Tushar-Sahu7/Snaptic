import React, { useState, useMemo, useEffect } from "react";
import { useCreateClass, useUpdateClass } from "@/features/classes/hooks/useClasses";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Clock,
  Navigation,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
  Sparkles,
  Palette,
  Type,
} from "lucide-react";
import { cn, WEEKDAYS, format12Hour } from "@/lib/utils";
import { IconPicker, Icon as LucideIcon } from "@/components/ui/icon-picker";
import { motion, AnimatePresence } from "motion/react";

export default function ClassFormSheet({
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
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("oklch(0.65 0.2 160)");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [location, setLocation] = useState("");
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
      if (isEdit && classData) {
        setName(classData.name || "");
        setDescription(classData.description || "");
        setIcon(classData.icon || "BookOpen");
        setColor(classData.color || "oklch(0.65 0.2 160)");
        
        // Dates are YYYY-MM-DD
        setStartDate(classData.startDate || "");
        setEndDate(classData.endDate || "");
        setStartTime(classData.startTime || "09:00");
        setDuration(classData.duration || 60);
        setDaysOfWeek(classData.daysOfWeek || []);
        setLocation(classData.location || "");
      } else {
        setName("");
        setDescription("");
        setIcon("BookOpen");
        setColor("oklch(0.65 0.2 160)");
        
        const today = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);
        
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(threeMonthsLater.toISOString().split('T')[0]);
        setStartTime("09:00");
        setDuration(60);
        setDaysOfWeek([]);
        setLocation("");
      }
    }
    setFormError(null);
  }, [open, isEdit, classData]);

  const toggleDay = (dayInt) => {
    setDaysOfWeek(prev => 
      prev.includes(dayInt) 
        ? prev.filter(d => d !== dayInt) 
        : [...prev, dayInt].sort()
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) return setFormError("Class name is required.");
    if (!startDate) return setFormError("Start date is required.");
    if (!endDate) return setFormError("End date is required.");
    if (daysOfWeek.length === 0) return setFormError("Please select at least one day of the week.");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        startDate,
        endDate,
        startTime,
        duration,
        daysOfWeek,
        location: location.trim(),
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ classId: classData._id, payload });
        toast.success("Class synchronized successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Class initialized successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setFormError(err.response?.data?.message || "An unexpected error occurred");
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 gap-0 border-l border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950 shadow-2xl">
        <SheetHeader className="p-8 pb-4 space-y-4">
          <div className="flex items-center gap-5">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 hover:rotate-6"
              style={{ backgroundColor: color }}
            >
              <LucideIcon name={icon} size={36} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <SheetTitle className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                {isEdit ? "Edit Class" : "New Class"}
              </SheetTitle>
              <SheetDescription className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                Set up your session schedule and identity.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Identity Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles size={12} /> Class Identity
            </h3>
            
            <Field>
              <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Name & Visuals</FieldLabel>
              <div className="flex gap-4">
                <IconPicker value={icon} onValueChange={setIcon}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-14 h-14 rounded-xl border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shrink-0"
                  >
                    <LucideIcon name={icon} size={24} className="text-zinc-600 dark:text-zinc-400" />
                  </Button>
                </IconPicker>
                <Input
                  placeholder="e.g. Mathematics II"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 px-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-lg font-bold tracking-tight focus-visible:ring-primary/20"
                />
              </div>
            </Field>

            <Field>
              <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Description (Optional)</FieldLabel>
              <textarea
                className="w-full min-h-[100px] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm font-medium tracking-tight placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Brief summary of the class objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
               <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Brand Color</FieldLabel>
                <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <input 
                    type="color" 
                    value="#6366f1" // Temporary placeholder as we convert to oklch
                    onChange={(e) => setColor(`oklch(0.65 0.2 ${Math.floor(Math.random() * 360)})`)} // Simple randomized oklch for now
                    className="w-8 h-8 rounded-lg overflow-hidden border-none bg-transparent cursor-pointer"
                  />
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{color}</span>
                </div>
              </Field>
              <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Location</FieldLabel>
                <div className="relative">
                  <Input
                    placeholder="e.g. Room 402"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-sm font-bold"
                  />
                  <Navigation size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </Field>
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-900" />

          {/* Schedule Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Clock size={12} /> Time & Schedule
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Starts On</FieldLabel>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold text-xs px-4"
                />
              </Field>
              <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Ends On</FieldLabel>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold text-xs px-4"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Session Start</FieldLabel>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {timeIntervals.map((t) => (
                    <option key={t} value={t}>
                      {format12Hour(t)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel className="text-xs font-bold text-zinc-500 mb-2 block">Duration (Min)</FieldLabel>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel className="text-xs font-bold text-zinc-500 mb-4 block">Days of the Week</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day, i) => {
                  const dayInt = i; // 0 (Sun) - 6 (Sat)
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
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          <AnimatePresence>
            {formError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 flex items-center gap-3 text-destructive"
              >
                <AlertCircle size={18} />
                <span className="text-sm font-bold">{formError}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <SheetFooter className="p-8 pt-4 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-xl border-t border-zinc-100 dark:border-zinc-900 flex-row gap-3">
          <Button
            variant="ghost"
            type="button"
            className="flex-1 h-14 rounded-xl font-bold text-zinc-400"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-[2] h-14 rounded-xl font-black text-sm uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {submitting ? "Processing..." : (isEdit ? "Update Class" : "Initialize Class")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
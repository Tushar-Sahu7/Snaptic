import React, { useState, useMemo, useEffect } from "react";
import { useCreateClass, useUpdateClass } from "@/features/classes/hooks/useClasses";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Navigation,
  X,
  AlertCircle,
  Calendar as CalendarIcon,
  Sparkles,
  Palette,
  Type,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn, WEEKDAYS, format12Hour } from "@/lib/utils";
import { IconPicker, Icon as LucideIcon } from "@/components/ui/icon-picker";
import { motion, AnimatePresence } from "motion/react";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ef4444", // Red
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#71717a", // Zinc
  "#000000", // Black
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
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("#6366f1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
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
        setColor((classData.color || "#6366f1").toLowerCase());
        
        setStartDate(classData.startDate || "");
        setEndDate(classData.endDate || "");
        setStartTime(classData.startTime || "09:00");
        
        const d = classData.duration || 60;
        setDuration(d);
        // Check if duration matches any preset
        setIsCustomDuration(!DURATION_PRESETS.find(p => p.value === d.toString()));
        
        setDaysOfWeek(classData.daysOfWeek || []);
        setLocation(classData.location || "");
      } else {
        setName("");
        setDescription("");
        setIcon("BookOpen");
        setColor("#6366f1");
        
        const today = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(today.getMonth() + 3);
        
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(threeMonthsLater.toISOString().split('T')[0]);
        setStartTime("09:00");
        setDuration(60);
        setIsCustomDuration(false);
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
    setFormError(null);

    if (!name.trim()) return setFormError("Class name is required.");
    if (!startDate) return setFormError("Start date is required.");
    if (!endDate) return setFormError("End date is required.");
    if (daysOfWeek.length === 0) return setFormError("Please select at least one day of the week.");
    if (duration <= 0) return setFormError("Please enter a valid duration.");

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
        startDate,
        endDate,
        startTime,
        duration: parseInt(duration),
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
      setFormError(err.response?.data?.message || "An unexpected error occurred");
    }
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden border-border bg-background shadow-2xl rounded-3xl">
        <div className="relative h-32 bg-muted/30 flex items-center px-8 border-b border-border">
          <div className="absolute top-0 right-0 p-4">
             <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-background/80"
              onClick={() => onOpenChange(false)}
             >
               <X size={20} />
             </Button>
          </div>
          
          <div className="flex items-center gap-6">
            <div 
              className="relative group shrink-0"
            >
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
              <DialogTitle className="text-3xl font-black tracking-tight text-foreground">
                {isEdit ? "Edit Class" : "New Class"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground font-medium">
                Set up your session schedule and brand identity.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Identity Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles size={12} /> Class Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Name</FieldLabel>
                <div className="relative">
                   <Input
                    placeholder="e.g. Advanced Mathematics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 px-10 rounded-xl bg-muted/50 border-border text-base font-bold tracking-tight focus-visible:ring-primary/20"
                  />
                  <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Location</FieldLabel>
                <div className="relative">
                  <Input
                    placeholder="e.g. Room 402 / Online"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 pl-10 rounded-xl bg-muted/50 border-border text-sm font-bold"
                  />
                  <Navigation size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Icon & Color</FieldLabel>
                <div className="flex items-center gap-3">
                  <IconPicker value={icon} onValueChange={setIcon}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-12 h-12 rounded-xl border-border flex items-center justify-center transition-all shrink-0 shadow-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <LucideIcon name={icon} size={20} strokeWidth={2.5} />
                    </Button>
                  </IconPicker>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 flex-1 justify-start gap-3 px-3 rounded-xl border-border bg-muted/50"
                      >
                        <div 
                          className="w-5 h-5 rounded-full shadow-sm border border-white/20" 
                          style={{ backgroundColor: color }} 
                        />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">{color}</span>
                        <ChevronDown size={14} className="ml-auto text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4 rounded-[2rem] shadow-2xl border-border bg-background/95 backdrop-blur-xl" align="start">
                      <div className="space-y-5">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-widest text-primary">Preset Palettes</p>
                           <div className="grid grid-cols-4 gap-3">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c.toLowerCase())}
                                className={cn(
                                  "w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center",
                                  color === c.toLowerCase() ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent hover:scale-105 hover:bg-muted"
                                )}
                                style={{ backgroundColor: c }}
                              >
                                {color === c.toLowerCase() && <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <Separator className="bg-border/50" />
                        
                        <div className="space-y-3">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Color</p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input 
                                type="text" 
                                value={color}
                                onChange={(e) => setColor(e.target.value.toLowerCase())}
                                className="h-10 text-xs font-mono pl-8 rounded-xl bg-muted/30 border-border uppercase"
                              />
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 font-mono text-xs">#</div>
                            </div>
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-border shadow-inner">
                              <input 
                                type="color" 
                                value={color.startsWith("#") ? color : "#6366f1"}
                                onChange={(e) => setColor(e.target.value.toLowerCase())}
                                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer border-none p-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </Field>

              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Description (Optional)</FieldLabel>
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
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Clock size={12} /> Time & Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Validity Period</FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 rounded-xl bg-muted/50 border-border font-bold text-xs px-3"
                  />
                  <div className="h-px w-3 bg-muted-foreground/30 shrink-0" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 rounded-xl bg-muted/50 border-border font-bold text-xs px-3"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Start Time</FieldLabel>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-border font-bold text-sm">
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 rounded-xl">
                      {timeIntervals.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs font-bold">
                          {format12Hour(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel className="text-xs font-bold text-muted-foreground mb-2 block">Duration</FieldLabel>
                  <div className="space-y-2">
                    <Select 
                      value={isCustomDuration ? "custom" : duration.toString()} 
                      onValueChange={handleDurationChange}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-border font-bold text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {DURATION_PRESETS.map((p) => (
                          <SelectItem key={p.value} value={p.value} className="text-xs font-bold">
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {isCustomDuration && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-1"
                      >
                        <div className="relative">
                          <Input
                            type="number"
                            min="1"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="h-9 pr-12 rounded-lg bg-muted/30 border-border text-xs font-bold"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/60 uppercase">Min</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Field>
              </div>
            </div>

            <Field>
              <FieldLabel className="text-xs font-bold text-muted-foreground mb-4 block">Days of the Week</FieldLabel>
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
                          : "bg-background border-border text-muted-foreground hover:border-foreground/20"
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
            {submitting ? "Processing..." : (isEdit ? "Update Class" : "Create Class")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
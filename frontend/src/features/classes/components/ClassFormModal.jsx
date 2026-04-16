import React, { useState, useMemo, useEffect } from "react";
import { createClass, updateClass } from "@/features/classes/api/classes.api";
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
  InputGroup,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { Clock, Navigation, X, AlertCircle } from "lucide-react";
import { cn, WEEKDAYS, format12Hour, formatRoom } from "@/lib/utils";
import { ClassIcon, AVAILABLE_ICONS } from "@/components/shared/ClassIcon";

// Helper to get nearest 15-min interval for current time
function getRoundedTimeOffset(addHours = 0) {
  const d = new Date();
  let hrs = d.getHours();
  let mins = d.getMinutes();

  if (mins > 45) {
    mins = 0;
    hrs = (hrs + 1) % 24;
  } else if (mins > 30) {
    mins = 45;
  } else if (mins > 15) {
    mins = 30;
  } else {
    mins = 15;
  }

  hrs = hrs + addHours;
  // Cap at 23:45 to prevent wrapping into the next day and failing validation
  if (hrs >= 24) {
    return "23:45";
  }

  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}`;
}

// Custom Time Combobox to replace native browser time pickers
function TimeInput({ value, onChange, placeholder, intervals, id, formatTimeOption }) {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to active or closest element on open
  useEffect(() => {
    if (open && containerRef.current) {
      // Find the exact match, or if none, find the closest one
      let targetValue = value;
      if (!intervals.includes(value) && value) {
        targetValue = intervals.find(t => t >= value) || intervals[intervals.length - 1];
      }
      
      if (targetValue) {
        const activeEl = containerRef.current.querySelector(
          `[data-value="${targetValue}"]`
        );
        if (activeEl) {
          activeEl.scrollIntoView({ block: "center" });
        }
      }
    }
  }, [open, value, intervals]);

  return (
    <div
      className="relative flex flex-1 h-full items-center z-10"
      ref={containerRef}
    >
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full h-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground selection:bg-accent selection:text-accent-foreground [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0"
        autoComplete="off"
      />
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 max-h-[180px] w-[190px] overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 scrollbar-thin">
          {intervals.map((t) => (
            <div
              key={t}
              data-value={t}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(t);
                setOpen(false);
              }}
              className={cn(
                "flex items-center justify-between cursor-pointer select-none px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                value === t ? "bg-accent text-accent-foreground font-semibold" : "font-medium"
              )}
            >
              {formatTimeOption ? formatTimeOption(t) : <span>{format12Hour(t)}</span>}
            </div>
          ))}
          {intervals.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground italic">
              No times available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClassFormModal({ open, onOpenChange, onSuccess, classData }) {
  const isEdit = !!classData;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [days, setDays] = useState([]);
  const [startTime, setStartTime] = useState(getRoundedTimeOffset(0));
  const [endTime, setEndTime] = useState(getRoundedTimeOffset(1));
  const [room, setRoom] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const iconPickerRef = React.useRef(null);
  const initialDataRef = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (iconPickerRef.current && !iconPickerRef.current.contains(event.target)) {
        setShowIconPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate 15-minute intervals
  const timeIntervals = useMemo(() => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        times.push(
          `${i.toString().padStart(2, "0")}:${j.toString().padStart(2, "0")}`
        );
      }
    }
    return times;
  }, []);

  function resetForm() {
    setName("");
    setIcon("BookOpen");
    setDays([]);
    setStartTime(getRoundedTimeOffset(0));
    setEndTime(getRoundedTimeOffset(1));
    setRoom("");
    setFormError(null);
  }

  useEffect(() => {
    if (open) {
      if (isEdit && classData) {
        setName(classData.name || "");
        setIcon(classData.icon || "BookOpen");
        
        const initialDays = classData.schedule?.days || [];
        if (classData.schedule?.day && initialDays.length === 0) {
          initialDays.push(classData.schedule.day);
        }
        setDays(initialDays);
        
        setStartTime(classData.schedule?.startTime || getRoundedTimeOffset(0));
        setEndTime(classData.schedule?.endTime || getRoundedTimeOffset(1));
        setRoom(classData.schedule?.room || "");
        setFormError(null);

        // Capture initial data for dirty check
        initialDataRef.current = {
          name: classData.name || "",
          icon: classData.icon || "BookOpen",
          days: initialDays,
          startTime: classData.schedule?.startTime || getRoundedTimeOffset(0),
          endTime: classData.schedule?.endTime || getRoundedTimeOffset(1),
          room: classData.schedule?.room || "",
        };
      } else {
        resetForm();
        initialDataRef.current = {
          name: "",
          icon: "BookOpen",
          days: [],
          startTime: getRoundedTimeOffset(0),
          endTime: getRoundedTimeOffset(1),
          room: "",
        };
      }
    }
  }, [open, isEdit, classData]);

  const isDirty = useMemo(() => {
    if (!initialDataRef.current) return false;
    
    const d1 = [...days].sort().join(",");
    const d2 = [...initialDataRef.current.days].sort().join(",");

    return (
      name !== initialDataRef.current.name ||
      icon !== initialDataRef.current.icon ||
      d1 !== d2 ||
      startTime !== initialDataRef.current.startTime ||
      endTime !== initialDataRef.current.endTime ||
      room !== initialDataRef.current.room
    );
  }, [name, icon, days, startTime, endTime, room]);

  const handleCloseAttempt = (force = false) => {
    if (force || !isDirty) {
      onOpenChange(false);
      setShowDiscardConfirm(false);
    } else {
      setShowDiscardConfirm(true);
    }
  };

  function handleStartTimeChange(val) {
    let durationMins = 60; // Default to 1 hour
    
    // Calculate current duration so we can shift and maintain it
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) {
        durationMins = diff;
      }
    }

    setStartTime(val);

    if (val) {
      const [nh, nm] = val.split(":").map(Number);
      let newEndMins = nh * 60 + nm + durationMins;
      
      // Cap at 23:45 safely
      if (newEndMins > 23 * 60 + 45) {
        newEndMins = 23 * 60 + 45;
      }
      
      const newEh = Math.floor(newEndMins / 60);
      const newEm = newEndMins % 60;
      setEndTime(`${newEh.toString().padStart(2, "0")}:${newEm.toString().padStart(2, "0")}`);
    }
  }

  function handleEndTimeChange(val) {
    setEndTime(val);
  }

  const formatEndTimeOption = (t) => {
    const formatted = format12Hour(t);
    if (!startTime) return <span>{formatted}</span>;
    
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = t.split(":").map(Number);
    let diffMins = (eh * 60 + em) - (sh * 60 + sm);
    
    if (diffMins <= 0) return <span>{formatted}</span>;
    
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    let durationStr = "";
    if (hrs > 0 && mins > 0) durationStr = `${hrs} hr ${mins} min`;
    else if (hrs > 0) durationStr = `${hrs} hr`;
    else durationStr = `${mins} min`;
    
    return (
      <>
        <span>{formatted}</span>
        <span className="text-muted-foreground/60 text-xs font-normal ml-3 whitespace-nowrap">({durationStr})</span>
      </>
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Class name is required.");
      return;
    }

    if (startTime && endTime && startTime >= endTime) {
      setFormError("End time must be strictly after the start time.");
      return;
    }

    setSubmitting(true);
    try {
      const schedule = {};
      if (days.length > 0) schedule.days = days;
      if (startTime) schedule.startTime = startTime;
      if (endTime) schedule.endTime = endTime;
      if (room.trim()) schedule.room = formatRoom(room);

      const payload = {
        name: name.trim(),
        icon,
        schedule: Object.keys(schedule).length > 0 ? schedule : undefined,
      };

      if (isEdit) {
        await updateClass(classData._id, payload);
        toast.success(`Class "${payload.name}" updated successfully`);
      } else {
        await createClass(payload);
        toast.success(`Class "${payload.name}" created successfully`);
      }

      const closeDialog = () => onOpenChange(false);
      closeDialog();
      
      onSuccess?.();
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} class`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(value) {
    if (value === false) {
      handleCloseAttempt();
    } else {
      onOpenChange(true);
    }
  }

  const MON_TO_SAT = WEEKDAYS.filter(d => d !== "Sunday");
  const monToSatSelected = MON_TO_SAT.every(d => days.includes(d)) && days.length === MON_TO_SAT.length;
  const toggleMonToSat = () => {
    setDays(monToSatSelected ? [] : [...MON_TO_SAT]);
  };
  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
        <div className="flex flex-col max-h-[96svh] relative">
          {/* Custom Enhanced Close Button */}
          <Button
            variant="secondary"
            size="icon-sm"
            className="absolute top-4 right-4 z-50 h-9 w-9 rounded-xl shadow-sm border bg-secondary/80 backdrop-blur-md hover:bg-secondary transition-all active:scale-95"
            onClick={() => handleCloseAttempt()}
          >
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </Button>

          <div className="px-4 py-5 sm:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
            <DialogHeader className="mb-4 pr-10">
              <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                {isEdit ? "Edit Class" : "Create Class"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground/80 mt-1.5">
                {isEdit ? "Update class details and schedule." : "Create a new class and schedule."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <Field>
                <FieldLabel
                  htmlFor="class-name"
                  className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block"
                >
                  Class Name
                </FieldLabel>
                <div className="flex gap-3">
                  <div className="relative" ref={iconPickerRef}>
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                      className={cn(
                        "h-11 w-11 flex items-center justify-center rounded-xl bg-secondary/30 border border-accent hover:bg-secondary/50 transition-colors text-muted-foreground",
                        showIconPicker && "bg-secondary border-primary/40 ring-2 ring-primary/10"
                      )}
                    >
                      <ClassIcon name={icon} className="size-5" />
                    </button>
                    {showIconPicker && (
                      <div className="absolute top-full left-0 mt-2 p-2 bg-popover border shadow-lg rounded-xl flex flex-wrap gap-1.5 w-[230px] animate-in fade-in-0 zoom-in-95 z-50">
                        {AVAILABLE_ICONS.map(iName => (
                          <button
                            key={iName}
                            type="button"
                            onClick={() => {
                              setIcon(iName);
                              setShowIconPicker(false);
                            }}
                            className={cn(
                              "h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent hover:scale-110 transition-all cursor-pointer text-muted-foreground hover:text-foreground", 
                              icon === iName && "bg-accent text-foreground scale-110"
                            )}
                          >
                            <ClassIcon name={iName} className="size-5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    id="class-name"
                    placeholder="e.g. CS101 - Intro to Programming"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 flex-1 rounded-xl text-base bg-secondary/30 focus-visible:bg-transparent transition-all border-accent focus-visible:ring-2 focus-visible:ring-ring"
                    autoFocus
                  />
                </div>
              </Field>

              <div className="space-y-7 pt-2">
                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                      Days
                    </FieldLabel>
                    <button
                      type="button"
                      onClick={toggleMonToSat}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {monToSatSelected ? "Clear Mon-Sat" : "Select Mon-Sat"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => {
                      const isSelected = days.includes(d);
                      return (
                        <label
                          key={d}
                          className="relative cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={isSelected}
                            onChange={() => toggleDay(d)}
                          />
                          <div
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200 ease-out select-none",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-transparent border-input text-muted-foreground group-hover:border-primary/40 group-hover:bg-accent/40"
                            )}
                          >
                            {d.slice(0, 3)}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field className="relative z-20">
                    <FieldLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                      Start Time
                    </FieldLabel>
                    <InputGroup className="h-11 rounded-xl bg-secondary/30 border-accent focus-within:bg-transparent">
                      <InputGroupAddon className="px-3 border-r border-accent/50 group-focus-within/input-group:border-primary/20">
                        <Clock className="text-muted-foreground/70 size-4" />
                      </InputGroupAddon>
                      <div className="flex-1 px-3 py-0 relative flex items-center h-full">
                        <TimeInput
                          id="class-start"
                          value={startTime}
                          onChange={handleStartTimeChange}
                          placeholder="Select"
                          intervals={timeIntervals.filter((t) => t <= "23:30")}
                        />
                      </div>
                    </InputGroup>
                  </Field>

                  <Field className="relative z-10">
                    <FieldLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2 block">
                      End Time
                    </FieldLabel>
                    <InputGroup className="h-11 rounded-xl bg-secondary/30 border-accent focus-within:bg-transparent">
                      <InputGroupAddon className="px-3 border-r border-accent/50 group-focus-within/input-group:border-primary/20">
                        <Clock className="text-muted-foreground/70 size-4" />
                      </InputGroupAddon>
                      <div className="flex-1 px-3 py-0 relative flex items-center h-full">
                        <TimeInput
                          id="class-end"
                          value={endTime}
                          onChange={handleEndTimeChange}
                          placeholder="Select"
                          intervals={timeIntervals.filter((t) => !startTime || t > startTime)}
                          formatTimeOption={formatEndTimeOption}
                        />
                      </div>
                    </InputGroup>
                  </Field>
                </div>

                <Field>
                  <FieldLabel
                    htmlFor="class-room"
                    className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5 block"
                  >
                    Room No.
                  </FieldLabel>
                  <InputGroup className="h-11 rounded-xl bg-secondary/30 border-accent focus-within:bg-transparent overflow-hidden">
                    <InputGroupAddon className="px-3 border-r border-accent/50 group-focus-within/input-group:border-primary/20">
                      <Navigation className="text-muted-foreground/70 size-4" />
                    </InputGroupAddon>
                    <input
                      id="class-room"
                      type="text"
                      placeholder="e.g. 101, 202-A"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="flex-1 bg-transparent px-3 text-sm font-medium outline-none placeholder:text-muted-foreground"
                    />
                  </InputGroup>
                </Field>
              </div>

              <div className="h-4 sm:hidden shrink-0" aria-hidden="true" /> {/* Dropdown buffer for mobile */}

              {formError && (
                <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2">
                  <span className="shrink-0 size-1.5 rounded-full bg-destructive" />
                  {formError}
                </div>
              )}

              <DialogFooter className="mt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full sm:w-auto rounded-xl font-semibold shadow-md active:scale-[0.98] transition-all"
                >
                  {submitting ? "Processing..." : isEdit ? "Save Changes" : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>

      {/* Discard Confirmation Dialog */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent showCloseButton={false} className="p-6 rounded-3xl">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-2">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold">Discard changes?</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              You have unsaved changes. Are you sure you want to close this form?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 mt-4">
            <Button
              variant="destructive"
              className="w-full rounded-xl font-bold h-11"
              onClick={() => handleCloseAttempt(true)}
            >
              Discard Changes
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl font-bold h-11 border-2"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Keep Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

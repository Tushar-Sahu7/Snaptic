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
        autoComplete="off"
      />

      {open && (
        <div>
          {intervals.map((t) => (
            <div
              key={t}
              data-value={t}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(t);
                setOpen(false);
              }}
            >

              {formatTimeOption ? formatTimeOption(t) : <span>{format12Hour(t)}</span>}
            </div>
          ))}
          {intervals.length === 0 && (
            <div>
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
        <span>({durationStr})</span>
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
      <DialogContent showCloseButton={false}>
        <div>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => handleCloseAttempt()}
          >
            <X />
            <span>Close</span>
          </Button>


          <div>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Edit Class" : "Create Class"}
              </DialogTitle>
              <DialogDescription>
                {isEdit ? "Update class details and schedule." : "Create a new class and schedule."}
              </DialogDescription>
            </DialogHeader>


            <form onSubmit={handleSubmit}>
              <Field>
                <FieldLabel
                  htmlFor="class-name"
                >
                  Class Name
                </FieldLabel>

                <div>
                  <div ref={iconPickerRef}>
                    <button
                      type="button"
                      onClick={() => setShowIconPicker(!showIconPicker)}
                    >
                      <ClassIcon name={icon} />
                    </button>

                    {showIconPicker && (
                      <div>
                        {AVAILABLE_ICONS.map(iName => (
                          <button
                            key={iName}
                            type="button"
                            onClick={() => {
                              setIcon(iName);
                              setShowIconPicker(false);
                            }}
                          >
                            <ClassIcon name={iName} />
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
                    autoFocus
                  />
                </div>
              </Field>


              <div>
                <Field>
                  <div>
                    <FieldLabel>
                      Days
                    </FieldLabel>
                    <button
                      type="button"
                      onClick={toggleMonToSat}
                    >
                      {monToSatSelected ? "Clear Mon-Sat" : "Select Mon-Sat"}
                    </button>
                  </div>

                  <div>
                    {WEEKDAYS.map((d) => {
                      const isSelected = days.includes(d);
                      return (
                        <label
                          key={d}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDay(d)}
                          />
                          <div>
                            {d.slice(0, 3)}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </Field>


                <div>
                  <Field>
                    <FieldLabel>
                      Start Time
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Clock />
                      </InputGroupAddon>
                      <div>
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


                  <Field>
                    <FieldLabel>
                      End Time
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <Clock />
                      </InputGroupAddon>
                      <div>
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
                  >
                    Room No.
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <Navigation />
                    </InputGroupAddon>
                    <input
                      id="class-room"
                      type="text"
                      placeholder="e.g. 101, 202-A"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                    />
                  </InputGroup>
                </Field>
              </div>


              <div aria-hidden="true" /> {/* Dropdown buffer for mobile */}

              {formError && (
                <div>
                  <span />
                  {formError}
                </div>
              )}


              <DialogFooter>
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
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
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div>
              <AlertCircle />
            </div>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to close this form?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleCloseAttempt(true)}
            >
              Discard Changes
            </Button>
            <Button
              variant="outline"
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

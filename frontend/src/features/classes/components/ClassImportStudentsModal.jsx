import React, { useState, useEffect } from "react";
import {
  fetchClasses,
  addStudent,
  fetchClassById,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardX,
  Check,
  Users,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ImportStudentsModal({
  open,
  onOpenChange,
  currentClassId,
  existingStudents = [],
  onSuccess,
}) {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (open) {
      loadClasses();
    } else {
      setSelectedClassId("");
      setStudents([]);
      setSelectedStudents(new Set());
    }
  }, [open]);

  useEffect(() => {
    if (selectedClassId) {
      loadStudentsForClass(selectedClassId);
    } else {
      setStudents([]);
    }
  }, [selectedClassId]);

  async function loadClasses() {
    try {
      const { data } = await fetchClasses();
      setClasses(data.classes.filter((c) => c._id !== currentClassId));
    } catch {
      toast.error("Failed to load other classes");
    }
  }

  async function loadStudentsForClass(id) {
    setLoadingStudents(true);
    try {
      const { data } = await fetchClassById(id);
      setStudents(data.class.students || []);
      setSelectedStudents(new Set());
    } catch {
      toast.error("Failed to load students for the selected class");
    } finally {
      setLoadingStudents(false);
    }
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(
        students
          .filter((s) => !existingStudents.some((es) => es._id === s._id))
          .map((s) => s._id)
      );
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId, checked) => {
    const newSet = new Set(selectedStudents);
    if (checked) {
      newSet.add(studentId);
    } else {
      newSet.delete(studentId);
    }
    setSelectedStudents(newSet);
  };

  async function handleImport() {
    if (selectedStudents.size === 0) return;
    setImporting(true);
    try {
      const promises = Array.from(selectedStudents).map((studentId) =>
        addStudent(currentClassId, { studentId }).catch((e) => {
          if (e.response?.status !== 400 && e.response?.status !== 409) {
            console.error(e);
          }
        })
      );

      await Promise.all(promises);
      toast.success(`Imported students successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      toast.error("Error importing some students");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-background">
        <div className="flex flex-col h-[600px]">
          <div className="p-8 border-b border-border bg-background sticky top-0 z-10">
            <DialogHeader className="p-0 text-left">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users size={18} strokeWidth={2.5} />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
                  Import Students
                </DialogTitle>
              </div>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Bulk-add students from your other active classes.
              </DialogDescription>
            </DialogHeader>

            {classes.length > 0 && (
              <div className="mt-6">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-border font-bold tracking-tight">
                    <SelectValue placeholder="Select class to import from..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-xl">
                    {classes.map((c) => (
                      <SelectItem
                        key={c._id}
                        value={c._id}
                        className="rounded-lg font-medium py-3"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-muted/10">
            {classes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <ClipboardX size={40} strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-foreground">
                    No Source Classes
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground max-w-[280px]">
                    You need at least one other class with students to use the import feature.
                  </p>
                </div>
              </div>
            ) : !selectedClassId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <Search size={32} strokeWidth={1} />
                </div>
                <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
                  Pick a class to start
                </p>
              </div>
            ) : loadingStudents ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[140px] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : students.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/30">
                  <Users size={32} strokeWidth={1} />
                </div>
                <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
                  No students in this class
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2 mb-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={
                        selectedStudents.size ===
                          students.filter(
                            (s) => !existingStudents.some((es) => es._id === s._id)
                          ).length && students.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      className="rounded-md border-border"
                    />
                    <span className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground/70 transition-colors">
                      Select All Available
                    </span>
                  </label>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold">
                    {selectedStudents.size} selected
                  </Badge>
                </div>

                <div className="space-y-2 pb-6">
                  {students.map((student) => {
                    const isAlreadyAdded = existingStudents.some(
                      (es) => es._id === student._id
                    );
                    const isChecked = selectedStudents.has(student._id);
                    return (
                      <div
                        key={student._id}
                        onClick={() =>
                          !isAlreadyAdded && handleSelectStudent(student._id, !isChecked)
                        }
                        className={cn(
                          "group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer",
                          isAlreadyAdded
                            ? "bg-muted/50 border-transparent opacity-60 grayscale cursor-not-allowed"
                            : isChecked
                            ? "bg-background border-primary shadow-lg shadow-primary/5 -translate-y-0.5"
                            : "bg-background border-border hover:border-foreground/20"
                        )}
                      >
                        {!isAlreadyAdded && (
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(c) => handleSelectStudent(student._id, c)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-md"
                          />
                        )}
                        <div className="relative">
                          <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                            {student?.avatar && <AvatarImage src={student.avatar} />}
                            <AvatarFallback className="font-bold text-xs bg-muted text-muted-foreground">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          {student?.faceEnrolled && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[oklch(0.3_0.02_160)] text-white flex items-center justify-center border-2 border-background">
                              <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {student.name}
                          </p>
                        </div>
                        {isAlreadyAdded && (
                          <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-tighter">
                            Already Enrolled
                          </Badge>
                        )}
                        {!isAlreadyAdded && !isChecked && (
                          <Plus size={16} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-background border-t border-border sticky bottom-0 z-10 flex-row gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={importing}
              className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedStudents.size === 0 || importing}
              className="flex-[2] h-12 rounded-xl font-bold bg-[oklch(0.3_0.02_160)] hover:bg-[oklch(0.25_0.02_160)] text-white shadow-xl shadow-emerald-900/10 transition-all active:scale-[0.98]"
            >
              {importing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {selectedStudents.size > 0 ? selectedStudents.size : ""} Students
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useEffect } from "react";
import { fetchClasses, addStudent, fetchClassById } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardX, Check } from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ImportStudentsModal({ open, onOpenChange, currentClassId, existingStudents = [], onSuccess }) {
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
      setClasses(data.classes.filter(c => c._id !== currentClassId));
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
          .filter(s => !existingStudents.some(es => es._id === s._id))
          .map(s => s._id)
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
    let successCount = 0;
    try {
      // Import them in a Promise.all or sequentially
      // Since addStudent routes look like `router.post("/:id/students", addStudent)` where studentId is in req.body
      // Wait, let's check `api/classes.js` addStudent method signature:
      // Typically `addStudent(classId, studentId)`
      const promises = Array.from(selectedStudents).map(studentId => 
        addStudent(currentClassId, studentId).catch(e => {
            // Filter out existing conflicts quietly
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
        <div className="flex flex-col max-h-[96svh]">
          <div className="px-4 py-5 sm:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
            <DialogHeader className="mb-2 shrink-0">
              <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight">Import Students</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Select students from your other active classes to quickly bulk-add them to this roster.
              </DialogDescription>
            </DialogHeader>

        {classes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary mb-4">
              <span className="text-xl"><ClipboardX /></span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No other classes to import from</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              The import feature lets you quickly copy rosters from your other existing classes. You currently don't have any other active classes.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            <div className="shrink-0 pt-2">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-full h-11 bg-secondary/30 border-accent">
                  <SelectValue placeholder="Select a class to import from..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-xl bg-card relative">
              {loadingStudents ? (
                <div className="p-4 flex flex-col gap-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                </div>
              ) : !selectedClassId ? (
                <div className="p-8 text-center text-sm text-muted-foreground italic h-full flex items-center justify-center">
                  Select a class above to view its roster.
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground italic h-full flex items-center justify-center">
                  This class has no students.
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Header Row */}
                  <div className="sticky top-0 bg-muted/80 backdrop-blur-md border-b px-4 py-3 flex items-center gap-3 z-10">
                    <Checkbox 
                      checked={selectedStudents.size === students.length && students.length > 0} 
                      onCheckedChange={handleSelectAll} 
                    />
                    <span className="text-sm font-semibold text-muted-foreground">Select All</span>
                    <span className="ml-auto text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                      {selectedStudents.size} selected
                    </span>
                  </div>
                  {/* Roster Rows */}
                  {students.map(student => {
                    const isAlreadyAdded = existingStudents.some(es => es._id === student._id);
                    const isChecked = selectedStudents.has(student._id);
                    return (
                      <div 
                        key={student._id} 
                        className={cn(
                          "flex items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0",
                          isAlreadyAdded ? "bg-muted/30 opacity-70" : "hover:bg-muted/30 cursor-pointer"
                        )} 
                        onClick={() => !isAlreadyAdded && handleSelectStudent(student._id, !isChecked)}
                      >
                        {!isAlreadyAdded ? (
                          <Checkbox 
                            checked={isChecked} 
                            onCheckedChange={(c) => handleSelectStudent(student._id, c)} 
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="size-4" /> // spacing filler
                        )}
                        <div className="relative inline-block shrink-0">
                          <Avatar className={`size-8 ${student?.faceEnrolled ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""}`}>
                            {student?.avatar && <AvatarImage src={student.avatar} className="object-cover" />}
                            <AvatarFallback className="text-xs">{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          {student?.faceEnrolled && (
                            <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-2 border-background text-white shadow-sm">
                              <Check className="size-2.5" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        {isAlreadyAdded && (
                          <Badge variant="outline" className="bg-background text-muted-foreground ml-auto">Added</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={selectedStudents.size === 0 || importing}>
            {importing ? "Importing..." : `Import ${selectedStudents.size > 0 ? selectedStudents.size : ""} Students`}
          </Button>
        </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

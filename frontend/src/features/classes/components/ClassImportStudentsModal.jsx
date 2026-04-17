import React, { useState, useEffect } from "react";
import { fetchClasses, addStudent, fetchClassById } from "@/features/classes/api/classes.api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      <DialogContent showCloseButton={false}>
        <div>
          <div>

            <DialogHeader>
              <DialogTitle>Import Students</DialogTitle>
              <DialogDescription>
                Select students from your other active classes to quickly bulk-add them to this roster.
              </DialogDescription>
            </DialogHeader>


        {classes.length === 0 ? (
          <div>
            <div>
              <span><ClipboardX /></span>
            </div>
            <h3>No other classes to import from</h3>
            <p>
              The import feature lets you quickly copy rosters from your other existing classes. You currently don't have any other active classes.
            </p>
          </div>
        ) : (
          <div>
            <div>

              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to import from..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>

              {loadingStudents ? (
                <div>
                  {[1, 2, 3].map(i => <Skeleton key={i} />)}
                </div>
              ) : !selectedClassId ? (
                <div>
                  Select a class above to view its roster.
                </div>
              ) : students.length === 0 ? (
                <div>
                  This class has no students.
                </div>
              ) : (
                <div>

                  {/* Header Row */}
                  <div>
                    <Checkbox 
                      checked={selectedStudents.size === students.length && students.length > 0} 
                      onCheckedChange={handleSelectAll} 
                    />
                    <span>Select All</span>
                    <span>
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
                        onClick={() => !isAlreadyAdded && handleSelectStudent(student._id, !isChecked)}
                      >

                        {!isAlreadyAdded ? (
                          <Checkbox 
                            checked={isChecked} 
                            onCheckedChange={(c) => handleSelectStudent(student._id, c)} 
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div /> // spacing filler
                        )}
                        <div>
                          <Avatar>
                            {student?.avatar && <AvatarImage src={student.avatar} />}
                            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                          </Avatar>
                          {student?.faceEnrolled && (
                            <div>
                              <Check />
                            </div>
                          )}
                        </div>
                        <div>
                          <span>{student.name}</span>
                        </div>
                        {isAlreadyAdded && (
                          <Badge variant="outline">Added</Badge>
                        )}
                      </div>
                    );

                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
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

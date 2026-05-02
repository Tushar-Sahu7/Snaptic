import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Search, Loader2, UserMinus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
// Will use mutations later: useAddStudent, useRemoveStudent

export function EnrollmentManager({ classId }) {
  const [search, setSearch] = useState("");
  
  // Dummy data for now until API is connected
  const enrolledStudents = [];
  const isLoading = false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Students</h2>
          <p className="text-sm text-muted-foreground">Manage enrolled students for this class.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Import from Class
          </Button>
          <Button size="sm">
            <UserPlus className="size-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search students..."
          className="pl-8 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : enrolledStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search ? "No students found" : "No students enrolled"}
            description={
              search 
                ? "No enrolled students match your search." 
                : "Add students to this class so they can be marked present during attendance."
            }
            className="py-12"
          />
        ) : (
          <div className="divide-y">
            {enrolledStudents.map((student) => (
              <div key={student.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center font-medium text-primary">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <UserMinus className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

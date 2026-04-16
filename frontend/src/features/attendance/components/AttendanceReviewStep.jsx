import { useState } from "react";
import { Search, UserCheck, UserX, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ReviewStep({ 
  students, 
  attendanceState, 
  onMarkManual
}) {
  const [query, setQuery] = useState("");

  const filteredStudents = (students || []).filter(s => {
    const nameStr = s.name || "";
    const rollStr = s.rollNumber || "";
    const lowerQuery = query.toLowerCase();
    
    return nameStr.toLowerCase().includes(lowerQuery) ||
           rollStr.toLowerCase().includes(lowerQuery);
  });

  const presentCount = Object.values(attendanceState).filter(s => s.status === "present").length;
  const absentCount = Object.values(attendanceState).filter(s => s.status === "absent").length;

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* 1. Header & Quick Stats */}
      <div className="p-6 border-b bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Present</span>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-primary rounded-full" />
                <span className="text-2xl font-black tabular-nums">{presentCount}</span>
              </div>
            </div>
            <div className="flex flex-col border-l pl-8">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Absent</span>
              <div className="flex items-center gap-2">
                <div className="size-2 bg-destructive rounded-full" />
                <span className="text-2xl font-black tabular-nums">{absentCount}</span>
              </div>
            </div>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Filter by name or roll number..."
              className="pl-10 h-11 bg-background"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Filtered List */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b py-2 bg-background">
          <TabsList className="bg-transparent h-10 p-0 items-end justify-start gap-6 w-full">
            <TabsTrigger 
              value="all" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none h-full px-0 text-[11px] font-bold uppercase tracking-wider"
            >
              All Students
            </TabsTrigger>
            <TabsTrigger 
              value="present" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none h-full px-0 text-[11px] font-bold uppercase tracking-wider text-primary"
            >
              Confirmed
            </TabsTrigger>
            <TabsTrigger 
              value="absent" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-destructive data-[state=active]:bg-transparent shadow-none h-full px-0 text-[11px] font-bold uppercase tracking-wider text-destructive"
            >
              Unconfirmed
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <TabsContent value="all" className="m-0 space-y-2 focus-visible:outline-none">
            {filteredStudents.map(student => (
              <StudentRow 
                key={student._id} 
                student={student} 
                state={attendanceState[student._id.toString()]} 
                onMark={onMarkManual} 
              />
            ))}
          </TabsContent>
          <TabsContent value="present" className="m-0 space-y-2 focus-visible:outline-none">
            {filteredStudents.filter(s => attendanceState[s._id.toString()]?.status === "present").map(student => (
              <StudentRow 
                key={student._id} 
                student={student} 
                state={attendanceState[student._id.toString()]} 
                onMark={onMarkManual} 
              />
            ))}
          </TabsContent>
          <TabsContent value="absent" className="m-0 space-y-2 focus-visible:outline-none">
            {filteredStudents.filter(s => attendanceState[s._id.toString()]?.status === "absent").map(student => (
              <StudentRow 
                key={student._id} 
                student={student} 
                state={attendanceState[student._id.toString()]} 
                onMark={onMarkManual} 
              />
            ))}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function StudentRow({ student, state, onMark }) {
  const isPresent = state?.status === "present";
  const sId = student._id.toString();

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-2xl border transition-all",
      isPresent 
        ? "bg-primary/5 border-primary/20 hover:border-primary/30" 
        : "bg-background border-muted hover:border-muted-foreground/30"
    )}>
      <div className="flex items-center gap-4">
        <Avatar className="size-11 border-2 border-background shadow-sm">
          <AvatarImage src={student.avatar} />
          <AvatarFallback className="bg-muted font-bold text-xs">
            {student.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight">{student.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {student.rollNumber || "No Roll #"}
            </span>
            {state?.method && (
              <Badge variant="secondary" className="text-[8px] h-3.5 px-1.5 uppercase font-bold tracking-wider opacity-70">
                {state.method}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant={isPresent ? "ghost" : "destructive"}
          className={cn(
            "h-9 px-3 rounded-xl font-bold transition-all",
            isPresent ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "bg-destructive hover:bg-destructive/90 shadow-sm"
          )}
          onClick={() => onMark(sId, "absent")}
        >
          {isPresent ? <UserX className="size-4 mr-2" /> : <X className="size-4 mr-2" />}
          {isPresent ? "Absence" : "Mark Absent"}
        </Button>
        <Button
          size="sm"
          variant={isPresent ? "default" : "outline"}
          className={cn(
            "h-9 px-3 rounded-xl font-bold transition-all",
            isPresent ? "bg-primary hover:bg-primary/90 shadow-sm" : "border-primary text-primary hover:bg-primary/10"
          )}
          onClick={() => onMark(sId, "present")}
        >
          {isPresent ? <Check className="size-4 mr-2" /> : <UserCheck className="size-4 mr-2" />}
          {isPresent ? "Presence" : "Mark Present"}
        </Button>
      </div>
    </div>
  );
}


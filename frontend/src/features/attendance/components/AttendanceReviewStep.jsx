import { useState } from "react";
import { Search, UserCheck, UserX, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


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
    <div>

      {/* 1. Header & Quick Stats */}
      <div>

        <div>
          <div>
            <div>

              <span>Present</span>
              <div>
                <div />
                <span>{presentCount}</span>
              </div>
            </div>

            <div>
              <span>Absent</span>
              <div>
                <div />
                <span>{absentCount}</span>
              </div>
            </div>
          </div>

          <div>
            <Search />
            <Input
              placeholder="Filter by name or roll number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>


      {/* 2. Filtered List */}
      <Tabs defaultValue="all">
        <div>
          <TabsList>

            <TabsTrigger
              value="all"
            >
              All Students
            </TabsTrigger>
            <TabsTrigger
              value="present"
            >
              Confirmed
            </TabsTrigger>
            <TabsTrigger
              value="absent"
            >
              Unconfirmed
            </TabsTrigger>
          </TabsList>
        </div>


        <div>
          <TabsContent value="all">

            {filteredStudents.map(student => (
              <StudentRow 
                key={student._id} 
                student={student} 
                state={attendanceState[student._id.toString()]} 
                onMark={onMarkManual} 
              />
            ))}
          </TabsContent>
          <TabsContent value="present">
            {filteredStudents.filter(s => attendanceState[s._id.toString()]?.status === "present").map(student => (
              <StudentRow
                key={student._id}
                student={student}
                state={attendanceState[student._id.toString()]}
                onMark={onMarkManual}
              />
            ))}
          </TabsContent>
          <TabsContent value="absent">

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
    <div>
      <div>
        <Avatar>
          <AvatarImage src={student.avatar} />
          <AvatarFallback>
            {student.name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>

        <div>
          <span>{student.name}</span>
          <div>
            <span>
              {student.rollNumber || "No Roll #"}
            </span>
            {state?.method && (
              <Badge variant="secondary">
                {state.method}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        <Button
          size="sm"
          variant={isPresent ? "ghost" : "destructive"}
          onClick={() => onMark(sId, "absent")}
        >
          {isPresent ? <UserX /> : <X />}
          {isPresent ? "Absence" : "Mark Absent"}
        </Button>
        <Button
          size="sm"
          variant={isPresent ? "default" : "outline"}
          onClick={() => onMark(sId, "present")}
        >
          {isPresent ? <Check /> : <UserCheck />}
          {isPresent ? "Presence" : "Mark Present"}
        </Button>
      </div>
    </div>
  );

}


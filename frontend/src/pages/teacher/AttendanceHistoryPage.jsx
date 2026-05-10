import { useState } from "react";
import { useParams, Link } from "react-router";
import { format } from "date-fns";
import { History, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendanceHistory } from "@/features/attendance/api/attendance.queries";
import { useClassDetail } from "@/features/classes/hooks/useClasses";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyTitle, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";

export default function AttendanceHistoryPage() {
  const { id: classId } = useParams();
  const [dateRange, setDateRange] = useState("all");

  const { data: classObj, isLoading: isClassLoading } = useClassDetail(classId);

  // Calculate start/end dates based on selection
  let startDate, endDate;
  const today = new Date();

  if (dateRange === "this-week") {
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startDate = startOfWeek.toISOString();
  } else if (dateRange === "this-month") {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate = startOfMonth.toISOString();
  } else if (dateRange === "last-month") {
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    startDate = startOfLastMonth.toISOString();
    endDate = endOfLastMonth.toISOString();
  }

  const { data, isLoading } = useAttendanceHistory({ classId, startDate, endDate });
  const records = data?.data?.records || [];

  if (isClassLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/teacher/dashboard">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/teacher/classes">Classes</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/teacher/classes/${classId}`}>
                    {classObj?.data?.name || "Class Details"}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Attendance Records</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Attendance Records</h1>
            {classObj && <Badge variant="outline">{classObj.data.name}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to={`/teacher/classes/${classId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Class
            </Link>
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Showing attendance records for the selected time range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No records found</EmptyTitle>
                <EmptyDescription>There are no attendance records for this class in the selected time range.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Session Date</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.recordId} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">
                        {record.session ? format(new Date(record.session.date), "MMM d, yyyy") : "Unknown"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {record.student?.name}
                        <div className="text-xs text-muted-foreground font-normal">
                          {record.student?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={record.status === "present" ? "success" : "destructive"}>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">
                        {record.method}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {record.markedAt ? format(new Date(record.markedAt), "h:mm a") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { format } from "date-fns";
import { History, Calendar as CalendarIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { useClasses } from "@/features/classes/hooks/useClasses";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyTitle, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { Icon as LucideIcon } from "@/components/ui/icon-picker";

export default function StudentAttendanceHistoryPage() {
  const [dateRange, setDateRange] = useState("all");
  const [selectedClassId, setSelectedClassId] = useState("all");

  const { classes, loading: isClassesLoading } = useClasses();

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

  const filters = {
    startDate,
    endDate,
    ...(selectedClassId !== "all" && { classId: selectedClassId })
  };

  const { data, isLoading } = useAttendanceHistory(filters);
  const records = data?.data?.records || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/student/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>My Attendance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight">Attendance History</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={isClassesLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
          <CardTitle>My Records</CardTitle>
          <CardDescription>
            Showing your attendance history based on selected filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : records.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <History className="h-8 w-8 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No records found</EmptyTitle>
                <EmptyDescription>There are no attendance records matching your criteria.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Class</th>
                    <th className="px-4 py-3 font-medium">Session Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.recordId} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        {record.class && (
                          <>
                            <div
                              className="p-1 rounded-md"
                              style={{
                                backgroundColor: `color-mix(in oklch, ${record.class.color}, transparent 90%)`,
                                color: record.class.color
                              }}
                            >
                              <LucideIcon name={record.class.icon} size={16} />
                            </div>
                            {record.class.name}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {record.session ? format(new Date(record.session.date), "MMM d, yyyy") : "Unknown"}
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

import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useClasses } from "@/features/classes/hooks/useClasses";

// UI Components
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { BookOpen, GraduationCap } from "lucide-react";

// Components
import ClassListHeader from "@/features/classes/components/ClassListHeader";
import ClassCard from "@/components/shared/ClassCard";

export default function StudentClassListPage() {
  const navigate = useNavigate();
  const { classes, loading } = useClasses();

  // Local State
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("active");

  // Memoized Filtering
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      // Filter by status first
      const matchesStatus = cls.status === tab;
      if (!matchesStatus) return false;

      if (search) {
        const query = search.toLowerCase();
        return (
          cls.name.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [classes, search, tab]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 md:px-0 md:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ClassListHeader
        tab={tab}
        onTabChange={setTab}
        search={search}
        onSearchChange={setSearch}
        hideTabs={false}
        hideCreate={true}
        hasSearchQuery={!!search}
      />

      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onClick={() => navigate(`/student/classes/${cls._id}`)}
              footer={
                cls.teacher?.name && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    <span className="font-bold text-foreground/90">
                      by {cls.teacher.name}
                    </span>
                  </div>
                )
              }
            />
          ))}
        </div>
      ) : (
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>
              {classes.length === 0
                ? "No classes enrolled"
                : "No results found"}
            </EmptyTitle>
            <EmptyDescription>
              {classes.length === 0
                ? "You are not enrolled in any classes yet. Please contact your teacher."
                : `We couldn't find any classes matching "${search}".`}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

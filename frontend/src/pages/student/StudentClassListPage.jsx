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
      <div>

        <div>
          <Skeleton />
        </div>

        <div>
          <Skeleton />
        </div>

        <div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>

    );
  }

  return (
    <div>

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
        <div>

          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls._id}
              cls={cls}
              onClick={() => navigate(`/student/classes/${cls._id}`)}
              footer={
                cls.teacher?.name && (
                  <div>
                    <GraduationCap />
                    <span>
                      by {cls.teacher.name}
                    </span>
                  </div>

                )
              }
            />
          ))}
        </div>
      ) : (
        <Empty>

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

import {
  Plus,
  Search,
  X,
  ArchiveRestore,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function ClassListHeader({
  tab,
  onTabChange,
  search,
  onSearchChange,
  onCreateClick,
  onUnarchiveAll,
  onDeleteAll,
  canBulkAction,
  hasSearchQuery,
  viewType,
  onViewTypeChange,
  hideTabs = false,
  hideCreate = false,
}) {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  return (
    <header className="flex flex-col gap-10">
      {/* Title & Primary Action Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1.5">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {isStudent
              ? "Enrolled Classes"
              : hideTabs
                ? "Class Records"
                : "My Classes"}
          </h1>
          <p className="text-muted-foreground font-medium tracking-tight">
            {isStudent
              ? "View your enrolled classes and track your attendance."
              : "Manage your teaching sessions and students."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isStudent && !hideCreate && tab === "active" && (
            <Button
              onClick={onCreateClick}
              size="xl"
              className={cn(
                "group rounded-2xl shadow-xl shadow-primary/10 active:scale-95 transition-all duration-300",
              )}
            >
              <Plus
                className="mr-2 w-5 h-5 transition-transform duration-500 group-hover:rotate-90"
                strokeWidth={3}
              />
              Create Class
            </Button>
          )}

          {tab === "archived" && !isStudent && canBulkAction && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <Button
                variant="outline"
                size="xl"
                onClick={onUnarchiveAll}
                className="rounded-2xl border-border/50 hover:bg-background hover:shadow-sm transition-all active:scale-95"
              >
                <ArchiveRestore className="w-5 h-5 text-emerald-600" />
                Unarchive All
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={onDeleteAll}
                className="rounded-2xl border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all active:scale-95"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
                Delete All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation & Search Bar Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-2 rounded-2xl bg-muted/40 border border-border/50 backdrop-blur-sm shadow-sm transition-all duration-500">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Custom Styled Tabs */}
          {!hideTabs && (
            <Tabs
              value={tab}
              onValueChange={onTabChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-10">
                <TabsTrigger value="active" className="px-8">
                  Active
                </TabsTrigger>
                <TabsTrigger value="archived" className="px-8">
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!hideTabs && (
            <div className="h-6 w-px bg-border/60 hidden sm:block mx-1" />
          )}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* View Type Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-border/40 shadow-sm">
            <Button
              variant={viewType === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => onViewTypeChange("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8 rounded-lg transition-all"
              onClick={() => onViewTypeChange("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 lg:w-80">
            <InputGroup className="bg-background rounded-xl border border-border/40 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
              <InputGroupAddon className="pl-3.5">
                <Search className="w-4 h-4 text-muted-foreground/60" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by class name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-11 border-none bg-transparent placeholder:text-muted-foreground/50 font-medium tracking-tight focus-visible:ring-0"
              />
              {hasSearchQuery && (
                <InputGroupAddon align="inline-end" className="pr-1.5">
                  <InputGroupButton
                    size="icon-sm"
                    onClick={() => onSearchChange("")}
                    className="rounded-lg hover:bg-muted/50"
                  >
                    <X className="text-muted-foreground/60" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </div>
      </div>
    </header>
  );
}

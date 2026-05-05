import { Plus, Search, ArchiveRestore, Trash2, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  return (
    <header className="flex flex-col gap-10">
      {/* Title & Primary Action Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            {hideTabs ? "Enrolled Classes" : "My Classes"}
          </h1>
          <p className="text-muted-foreground font-medium tracking-tight">
            Manage your teaching sessions and student rosters.
          </p>
        </div>

        {!hideCreate && (
          <Button
            onClick={onCreateClick}
            size="lg"
            className={cn(
              "rounded-2xl p-6 active:scale-95"
            )}
          >
            <Plus className="mr-2.5 w-5 h-5 transition-transform duration-500 group-hover:rotate-90" strokeWidth={3} />
            Create Class
          </Button>
        )}
      </div>

      {/* Navigation & Search Bar Section */}
      {/* Navigation & Search Bar Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-2 lg:p-3 rounded-2xl lg:rounded-[2.5rem] bg-muted/30 border border-border/40 backdrop-blur-md shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Custom Styled Tabs */}
          {!hideTabs && (
            <Tabs
              value={tab}
              onValueChange={onTabChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-12 bg-background p-1 rounded-2xl border border-border/50 shadow-sm">
                <TabsTrigger
                  value="active"
                  className={cn(
                    "px-6 h-10 rounded-xl font-bold tracking-tight transition-all duration-300",
                    "data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
                    "data-[state=active]:shadow-none"
                  )}
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className={cn(
                    "px-6 h-10 rounded-xl font-bold tracking-tight transition-all duration-300",
                    "data-[state=active]:bg-foreground data-[state=active]:text-background"
                  )}
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!hideTabs && <div className="h-8 w-px bg-border/50 hidden sm:block mx-2" />}

          {/* Bulk Actions for Archived Tab */}
          {tab === "archived" && canBulkAction && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
              <Button
                variant="outline"
                size="sm"
                onClick={onUnarchiveAll}
                className="h-10 rounded-xl font-bold border-border/50 hover:bg-background"
              >
                <ArchiveRestore className="mr-2 w-4 h-4 text-emerald-600" />
                Unarchive All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAll}
                className="h-10 rounded-xl font-bold border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Trash2 className="mr-2 w-4 h-4 text-destructive" />
                Delete All
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* View Type Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-background border border-border/50">
            <Button 
              variant={viewType === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-lg"
              onClick={() => onViewTypeChange("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewType === "list" ? "secondary" : "ghost"} 
              size="icon" 
              className="h-9 w-9 rounded-lg"
              onClick={() => onViewTypeChange("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 lg:w-80">
            <InputGroup className="bg-background rounded-2xl border border-border/50 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
              <InputGroupAddon className="pl-4">
                <Search className="w-4 h-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by class name..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-12 border-none bg-transparent placeholder:text-muted-foreground font-medium tracking-tight focus-visible:ring-0"
              />
              {hasSearchQuery && (
                <InputGroupAddon className="pr-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onSearchChange("")}
                    className="w-8 h-8 rounded-lg hover:bg-muted"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </div>
      </div>
    </header>
  );
}

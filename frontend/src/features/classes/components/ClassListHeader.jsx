import { Plus, Search, ArchiveRestore, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * ClassListHeader - MUJI-inspired minimalist header for the class management interface.
 * Principles: Calm, Tactile, Essential.
 */
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
  hideTabs = false,
  hideCreate = false,
}) {
  return (
    <header className="flex flex-col gap-10">
      {/* Title & Primary Action Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            {hideTabs ? "Enrolled Classes" : "My Classes"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">
            Manage your teaching sessions and student rosters.
          </p>
        </div>

        {!hideCreate && (
          <Button
            onClick={onCreateClick}
            size="lg"
            className={cn(
              "rounded-2xl px-8 h-14 font-bold text-base transition-all duration-500",
              "bg-[oklch(0.3_0.02_160)] hover:bg-[oklch(0.25_0.02_160)] text-white shadow-xl shadow-emerald-900/10",
              "active:scale-95 group"
            )}
          >
            <Plus className="mr-2.5 w-5 h-5 transition-transform duration-500 group-hover:rotate-90" strokeWidth={3} />
            Create Class
          </Button>
        )}
      </div>

      {/* Navigation & Search Bar Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-2 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100/50 dark:border-zinc-800/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          {/* Custom Styled Tabs */}
          {!hideTabs && (
            <Tabs
              value={tab}
              onValueChange={onTabChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-12 bg-white dark:bg-zinc-950 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                <TabsTrigger
                  value="active"
                  className={cn(
                    "px-6 h-10 rounded-xl font-bold tracking-tight transition-all duration-300",
                    "data-[state=active]:bg-[oklch(0.95_0.02_160)] data-[state=active]:text-[oklch(0.3_0.05_160)]",
                    "data-[state=active]:shadow-none"
                  )}
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value="archived"
                  className={cn(
                    "px-6 h-10 rounded-xl font-bold tracking-tight transition-all duration-300",
                    "data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-zinc-900"
                  )}
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!hideTabs && <div className="h-8 w-px bg-zinc-200/50 dark:bg-zinc-800/50 hidden sm:block mx-2" />}

          {/* Bulk Actions for Archived Tab */}
          {tab === "archived" && canBulkAction && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
              <Button
                variant="outline"
                size="sm"
                onClick={onUnarchiveAll}
                className="h-10 rounded-xl font-bold border-zinc-200/50 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800"
              >
                <ArchiveRestore className="mr-2 w-4 h-4 text-emerald-600" />
                Unarchive All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAll}
                className="h-10 rounded-xl font-bold border-zinc-200/50 dark:border-zinc-800/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Trash2 className="mr-2 w-4 h-4 text-destructive" />
                Delete All
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Search Bar */}
        <div className="w-full lg:w-96">
          <InputGroup className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm focus-within:ring-2 focus-within:ring-[oklch(0.9_0.05_160)] transition-all duration-300">
            <InputGroupAddon className="pl-4">
              <Search className="w-4 h-4 text-zinc-400" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by class name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 border-none bg-transparent placeholder:text-zinc-400 font-medium tracking-tight focus-visible:ring-0"
            />
            {hasSearchQuery && (
              <InputGroupAddon className="pr-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onSearchChange("")}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>
    </header>
  );
}

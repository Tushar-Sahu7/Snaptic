import { 
  Plus, 
  Search, 
  ArchiveRestore, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
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
  hideTabs = false,
  hideCreate = false
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          {hideTabs ? "Enrolled Classes" : "My Classes"}
        </h1>
        {!hideCreate && (
          tab === "active" ? (
            <Button onClick={onCreateClick}>
              <Plus data-icon="inline-start" />
              Create Class
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 font-semibold text-xs transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/30"
                disabled={!canBulkAction}
                onClick={onUnarchiveAll}
              >
                <ArchiveRestore className="size-4 mr-2" />
                Unarchive All {hasSearchQuery && "Results"}
              </Button>

              <Button 
                variant="destructive" 
                size="sm"
                className="h-9 font-semibold text-xs"
                disabled={!canBulkAction}
                onClick={onDeleteAll}
              >
                <Trash2 className="size-4 mr-2" />
                Delete All {hasSearchQuery && "Results"}
              </Button>
            </div>
          )
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {!hideTabs ? (
          <div className="flex bg-secondary/40 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => onTabChange("active")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                tab === "active"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Active
            </button>
            <button
              onClick={() => onTabChange("archived")}
              className={cn(
                "flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all",
                tab === "archived"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Archived
            </button>
          </div>
        ) : (
          <div className="sm:flex-1" />
        )}

        <InputGroup className="max-w-md w-full sm:w-80">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search classes by name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>
    </div>
  );
}

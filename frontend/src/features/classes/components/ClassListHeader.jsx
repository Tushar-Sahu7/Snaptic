import { Plus, Search, ArchiveRestore, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";


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
    <div>
      <div>

        <h1>
          {hideTabs ? "Enrolled Classes" : "My Classes"}
        </h1>

        {!hideCreate &&
          (tab === "active" ? (
            <Button onClick={onCreateClick}>
              <Plus data-icon="inline-start" />
              Create Class
            </Button>
          ) : (
            <div>
              <Button
                variant="outline"
                size="sm"

                disabled={!canBulkAction}
                onClick={onUnarchiveAll}
              >
                <ArchiveRestore />
                Unarchive All {hasSearchQuery && "Results"}
              </Button>

              <Button
                variant="destructive"
                size="sm"

                disabled={!canBulkAction}
                onClick={onDeleteAll}
              >
                <Trash2 />
                Delete All {hasSearchQuery && "Results"}
              </Button>
            </div>
          ))}
      </div>

      <div>
        {!hideTabs ? (
          <div>
            <button
              onClick={() => onTabChange("active")}
            >
              Active
            </button>
            <button
              onClick={() => onTabChange("archived")}
            >
              Archived
            </button>
          </div>
        ) : (
          <div />
        )}

        <InputGroup>
          <InputGroupAddon>
            <Search />
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

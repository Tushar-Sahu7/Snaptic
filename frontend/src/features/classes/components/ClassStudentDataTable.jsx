import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function StudentDataTable({
  data,
  actionsRender,
  selectable,
  onSelectionChange,
  toolbarActions,
  loading = false,
  hideToolbar = false,
  syncUrl = true,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL sync helpers
  const initialPage = syncUrl ? (Number(searchParams.get("page")) || 1) : 1;
  const initialSize = syncUrl ? (Number(searchParams.get("size")) || 10) : 10;
  const initialSearch = syncUrl ? (searchParams.get("q") || "") : "";
  const initialSort = React.useMemo(() => {
    if (!syncUrl) return [];
    const s = searchParams.get("sort");
    if (!s) return [];
    const [id, desc] = s.split(":");
    return [{ id, desc: desc === "desc" }];
  }, [searchParams, syncUrl]);

  const [rowSelection, setRowSelection] = React.useState({});
  const [sorting, setSorting] = React.useState(initialSort.length ? initialSort : [{ id: "name", desc: false }]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState(initialSearch);
  const [pagination, setPagination] = React.useState({
    pageIndex: initialPage - 1,
    pageSize: initialSize,
  });

  // Update URL when table state changes
  React.useEffect(() => {
    if (!syncUrl) return;
    
    const params = new URLSearchParams(searchParams);

    if (globalFilter) params.set("q", globalFilter);
    else params.delete("q");

    if (sorting.length)
      params.set(
        "sort",
        `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`,
      );
    else params.delete("sort");

    if (pagination.pageIndex > 0)
      params.set("page", String(pagination.pageIndex + 1));
    else params.delete("page");

    if (pagination.pageSize !== 10)
      params.set("size", String(pagination.pageSize));
    else params.delete("size");

    // Only update if changed to avoid infinite loop
    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [globalFilter, sorting, pagination, setSearchParams, searchParams, syncUrl]);

  React.useEffect(() => {
    if (onSelectionChange) {
      // rowSelection is typically an object like { '0': true, '2': true } where keys are indices
      const selectedStudents = Object.keys(rowSelection).map(
        (index) => data[index],
      );
      onSelectionChange(selectedStudents);
    }
  }, [rowSelection, data]);

  const columns = React.useMemo(() => {
    const cols = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student
            <ArrowUpDown />
          </Button>
        ),

        cell: ({ row }) => {
          const student = row.original;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                  {student?.avatar && <AvatarImage src={student.avatar} />}
                  <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                {student?.faceEnrolled && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border">
                    <div className="bg-emerald-500 rounded-full p-0.5">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground leading-tight">{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.email || "No email provided"}</span>
              </div>
            </div>
          );
        },

      },

      {
        accessorKey: "faceEnrolled",
        header: "Face status",
        cell: ({ row }) => {
          const isEnrolled = row.original.faceEnrolled;
          return (
            <div className="flex items-center">
              {isEnrolled ? (
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider"
                >
                  <CheckCircle className="w-3 h-3" />
                  Face Enrolled
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-muted-foreground/20 gap-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wider"
                >
                  <XCircle className="w-3 h-3" />
                  Not Enrolled
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          return actionsRender ? actionsRender(row.original) : null;
        },
        enableHiding: false,
      },
    ];
 
    let finalCols = cols;

    if (selectable) {
      finalCols.unshift({
        id: "select",
        header: ({ table }) => (
          <div>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return finalCols;
  }, [actionsRender, selectable]);

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      {!hideToolbar && (
        <div>
          <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search data-icon="inline-start" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search students…"
            value={globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            disabled={loading}
          />
        </InputGroup>


        {toolbarActions && (
          <div>{toolbarActions}</div>
        )}

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns{" "}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "faceEnrolled"
                        ? "Face status"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      )}


      <div>
        <div>
          <Table>
            <TableHeader>

            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isFaceStatus = header.column.id === "faceEnrolled";
                  return (
                    <TableHead
                      key={header.id}
                    >

                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: initialSize }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group hover:bg-muted/30 transition-colors duration-200"
                >

                  {row.getVisibleCells().map((cell) => {
                    const isFaceStatus = cell.column.id === "faceEnrolled";
                    return (
                      <TableCell 
                        key={cell.id}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                >
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      <div>
        <div>
          {selectable
            ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
            : `Showing ${table.getRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s).`}
        </div>

        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] rounded-lg bg-background border-muted-foreground/10 focus:ring-primary/10">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top" className="rounded-xl border-border/50">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="rounded-lg">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <Pagination>

            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                />
              </PaginationItem>

              {(() => {
                const currentPage = table.getState().pagination.pageIndex + 1;
                const totalPages = table.getPageCount();
                const pages = [];

                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, "ellipsis", totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(
                      1,
                      "ellipsis",
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    );
                  } else {
                    pages.push(
                      1,
                      "ellipsis",
                      currentPage,
                      "ellipsis",
                      totalPages,
                    );
                  }
                }

                return pages.map((page, i) => (
                  <PaginationItem key={i}>
                    {page === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => table.setPageIndex(page - 1)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ));
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

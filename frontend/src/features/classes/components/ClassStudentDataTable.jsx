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
            className="-ml-4 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const student = row.original;
          return (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative inline-block shrink-0">
                <Avatar className={`size-10 sm:size-12 ${student?.faceEnrolled ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background" : ""}`}>
                  {student?.avatar && <AvatarImage src={student.avatar} className="object-cover" />}
                  <AvatarFallback className="text-[10px] sm:text-sm font-semibold">
                    {getInitials(student.name)}
                  </AvatarFallback>
                </Avatar>
                {student?.faceEnrolled && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full border-2 border-background text-white shadow-sm">
                    <Check className="size-3 sm:size-3.5" />
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium">{student.name}</span>
            </div>
          );
        },
      },

      {
        accessorKey: "faceEnrolled",
        header: "Face status",
        cell: ({ row }) => {
          const isEnrolled = row.original.faceEnrolled;
          return isEnrolled ? (
            <Badge
              variant="secondary"
              className="bg-muted text-foreground border-transparent whitespace-nowrap"
            >
              <CheckCircle className="size-3 mr-1 text-emerald-500" />
              Face Enrolled
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-muted-foreground border-dashed whitespace-nowrap"
            >
              <XCircle className="size-3 mr-1 text-muted-foreground/50" />
              Not Enrolled
            </Badge>
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
          <div className="pl-3 sm:pl-5 pr-2">
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
          <div className="pl-3 sm:pl-5 pr-2">
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
    <div className="flex flex-col gap-3">
      {!hideToolbar && (
        <div className="flex items-center gap-3">
          <InputGroup className="w-full max-w-sm h-8 bg-secondary/20 border-none">
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
          <div className="flex flex-wrap items-center gap-2">{toolbarActions}</div>
        )}

        <div className="ml-auto hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columns{" "}
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
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
                      className="capitalize"
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

      <div className="relative w-full">
        <div className="border rounded-2xl bg-card overflow-hidden">
          <Table className="[&_td]:p-3 sm:[&_td]:p-4 [&_th]:p-3 sm:[&_th]:p-4">
            <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isFaceStatus = header.column.id === "faceEnrolled";
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "font-semibold text-muted-foreground",
                        isFaceStatus && "hidden md:table-cell"
                      )}
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
                      <Skeleton className="h-5 w-full rounded-md opacity-70" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isFaceStatus = cell.column.id === "faceEnrolled";
                    return (
                      <TableCell 
                        key={cell.id}
                        className={cn(isFaceStatus && "hidden md:table-cell")}
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
                  className="h-24 text-center text-muted-foreground italic"
                >
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
        <div className="text-sm text-muted-foreground order-2 sm:order-1 whitespace-nowrap text-center sm:text-left w-full sm:w-auto">
          {selectable
            ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s) selected.`
            : `Showing ${table.getRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} row(s).`}
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 sm:gap-x-6 gap-y-2 order-1 sm:order-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-xs sm:text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={
                    !table.getCanPreviousPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
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
                        className="cursor-pointer"
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
                  className={
                    !table.getCanNextPage()
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

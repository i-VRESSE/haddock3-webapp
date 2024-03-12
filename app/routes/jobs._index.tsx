import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowDownUpIcon,
  XIcon,
  PencilIcon,
} from "lucide-react";

import { PropsWithChildren, useState } from "react";

import { getBartenderToken } from "~/bartender-client/token.server";
import { JobModelDTO } from "~/bartender-client/types";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { getJobs } from "~/models/job.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const token = await getBartenderToken(request);
  const jobs = await getJobs(token);
  return json({ jobs });
};

const columnHelper = createColumnHelper<JobModelDTO>();

function JobLink({ jobid, children }: PropsWithChildren<{ jobid: number }>) {
  return (
    <Link className="hover:underline" to={`/jobs/${jobid}`}>
      {children}
    </Link>
  );
}

function ColumnHeader({
  column,
  title,
  className,
}: {
  column: Column<JobModelDTO>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) {
    return <div className={cn("text-center", className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => {
          column.toggleSorting(column.getIsSorted() === "asc");
        }}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDownIcon className="ml-2 h-4 w-4" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUpIcon className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDownUpIcon className="ml-2 h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function RenameAction({
  onRename,
  disabled,
}: {
  onRename: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      disabled={disabled}
      variant="ghost"
      onClick={onRename}
      title="Rename job"
      size="icon"
    >
      <PencilIcon size={16} />
    </Button>
  );
}

function DeleteAction({
  onDelete,
  disabled,
}: {
  onDelete: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={onDelete}
      title="Delete/cancel job"
      size="icon"
    >
      <XIcon size={16} />
    </Button>
  );
}

export default function JobsPage() {
  const { jobs } = useLoaderData<typeof loader>();
  const columns = [
    columnHelper.accessor("id", {
      cell: ({ row }) => (
        <JobLink jobid={row.original.id}>{row.original.id}</JobLink>
      ),
      header: ({ column }) => <ColumnHeader column={column} title="ID" />,
    }),
    columnHelper.accessor("state", {
      header: ({ column }) => <ColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <JobLink jobid={row.original.id}>{row.original.state}</JobLink>
      ),
    }),
    columnHelper.accessor("name", {
      header: ({ column }) => <ColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <JobLink jobid={row.original.id}>{row.original.name}</JobLink>
      ),
    }),
    columnHelper.accessor("created_on", {
      header: ({ column }) => (
        <ColumnHeader column={column} title="Created on" />
      ),
      cell: ({ row }) => (
        <JobLink jobid={row.original.id}>
          {new Date(row.original.created_on).toUTCString()}
        </JobLink>
      ),
    }),
    columnHelper.accessor("updated_on", {
      header: ({ column }) => (
        <ColumnHeader column={column} title="Updated on" />
      ),
      cell: ({ row }) => (
        <JobLink jobid={row.original.id}>
          {new Date(row.original.updated_on).toUTCString()}
        </JobLink>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: ({ column }) => <ColumnHeader column={column} title="Actions" />,
      cell: ({ row }) => {
        // job in new or staging_out state cannot be deleted, you have to wait for job to switch to another state
        const disabled =
          state === "submitting" ||
          row.original.state === "new" ||
          row.original.state === "staging_out";
        return (
          <div className="flex items-center justify-center">
            <RenameAction
              disabled={state === "submitting"}
              onRename={() => renameJob(row.original.id, row.original.name)}
            />
            <DeleteAction
              onDelete={() => deleteJob(row.original.id)}
              disabled={disabled}
            />
          </div>
        );
      },
    }),
  ];
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "id",
      desc: true,
    },
  ]);
  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const { submit, state } = useFetcher();

  function deleteJob(id: number): void {
    if (window.confirm("Are you sure you want to delete job?") === false) {
      return;
    }
    submit({}, { method: "delete", action: `/jobs/${id}` });
  }

  function renameJob(id: number, name: string): void {
    const newName = window.prompt("Enter new name for the job", name);
    if (newName === null) {
      return;
    }
    const data = new FormData();
    data.set("name", newName);
    submit(data, { method: "post", action: `/jobs/${id}/name` });
  }

  return (
    <main>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No jobs.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </main>
  );
}

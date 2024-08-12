import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
import { useTheme } from "remix-themes";

import { getBartenderToken } from "~/bartender-client/token.server";
import { JobModelDTO } from "~/bartender-client/types";
import { DataTablePagination } from "~/components/DataTablePagination";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
  try {
    const token = await getBartenderToken(request);
    const jobs = await getJobs(token);
    return json({
      jobs: (jobs as JobModelDTO[]) ?? ([] as JobModelDTO[]),
      error: null,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (resp: any) {
    // authentication errors are handled by error boundary
    if ([401, 403].includes(resp.status)) {
      throw resp;
    } else {
      return json({
        jobs: [] as JobModelDTO[],
        error: `${resp.status ?? 500} - ${resp.statusText ?? "Server error"}`,
      });
    }
  }
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

type Submit = ReturnType<typeof useFetcher>["submit"];

function deleteJob(id: number, submit: Submit): void {
  if (window.confirm("Are you sure you want to delete job?") === false) {
    return;
  }
  submit({}, { method: "delete", action: `/jobs/${id}` });
}

function RenameAction({
  submit,
  job,
  disabled,
}: {
  submit: Submit;
  job: JobModelDTO;
  disabled: boolean;
}) {
  return (
    <Button
      disabled={disabled}
      variant="ghost"
      onClick={() => renameJob(job.id, job.name, submit)}
      title="Rename job"
      size="icon"
    >
      <PencilIcon size={16} />
    </Button>
  );
}

function renameJob(id: number, name: string, submit: Submit): void {
  const newName = window.prompt("Enter new name for the job", name);
  if (newName === null) {
    return;
  }
  const data = new FormData();
  data.set("name", newName);
  submit(data, { method: "post", action: `/jobs/${id}/name` });
}

function DeleteAction({
  job,
  submit,
  disabled,
}: {
  submit: Submit;
  job: JobModelDTO;
  disabled: boolean;
}) {
  return (
    <Button
      variant="ghost"
      disabled={disabled}
      onClick={() => deleteJob(job.id, submit)}
      title="Delete/cancel job"
      size="icon"
    >
      <XIcon size={16} />
    </Button>
  );
}

export default function JobsPage() {
  const { jobs, error } = useLoaderData<typeof loader>();
  const { submit, state: fetcherState } = useFetcher();
  const [theme] = useTheme();
  const colorScheme = { colorScheme: theme === "dark" ? "dark" : "light" };

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
        const deleteDisabled =
          fetcherState === "submitting" ||
          row.original.state === "new" ||
          row.original.state === "staging_out";
        return (
          <div className="flex items-center justify-center">
            <RenameAction
              disabled={fetcherState === "submitting"}
              submit={submit}
              job={row.original}
            />
            <DeleteAction
              submit={submit}
              job={row.original}
              disabled={deleteDisabled}
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
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <main>
      <div className="flex items-center pb-4">
        <Input
          placeholder="Filter jobs by name..."
          type="search"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={({ target }) => {
            // console.log("onChange...", target.value)
            table.getColumn("name")?.setFilterValue(target.value);
          }}
          style={colorScheme}
          className="max-w-sm"
        />
      </div>
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
                          header.getContext(),
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
                {error ? (
                  <span className="text-error">
                    Failed to load job list. {error}
                  </span>
                ) : (
                  <span className="">No jobs</span>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </main>
  );
}

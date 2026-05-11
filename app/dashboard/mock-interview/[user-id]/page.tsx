"use client";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import {
  Table as UiTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePathname, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { Badge } from "@/components/ui/badge";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1` || "http://localhost:1995/api/v1";

type Candidates = {
  id: string;
  interview: string;
  interviewScore: string;
  type: string;
  difficulty: string;
  basedOn: string;
  date: string;
  status?: string;
};

const ITEMS_PER_PAGE = 10;

export const columns: ColumnDef<Candidates>[] = [
  {
    accessorKey: "interview",
    header: "Interview",
  },
  {
    accessorKey: "interviewScore",
    header: "Interview Score",
    cell: ({ row }) => {
      if (row.original.status !== "completed") return "-";
      return row.original.interviewScore;
    },
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty Level",
  },
  {
    accessorKey: "basedOn",
    header: "Based On",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status || "completed";
      const isCompleted = status === "completed";
      return (
        <Badge
          variant="outline"
          className={
            isCompleted
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }
        >
          {isCompleted ? "Completed" : "In Progress"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const pathname = usePathname();
      return (
        <Link
          href={`${pathname}/${row.original.id}`}
          className="text-[#314370] font-medium underline underline-offset-2"
        >
          View Report
        </Link>
      );
    },
  },
];

const Page = () => {
  const pathname = usePathname();
  const params = useParams();
  const userId = params["user-id"];

  const [data, setData] = useState<Candidates[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    if (!userId) return;
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/interview/institute/candidate/${userId}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setData(res.data.data);
          if (res.data.pagination) {
            setPaginationMeta({
              totalItems: res.data.pagination.totalItems,
              totalPages: res.data.pagination.totalPages,
              hasNext: res.data.pagination.hasNext,
              hasPrev: res.data.pagination.hasPrev,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [userId, currentPage]);

  const getVisiblePages = () => {
    const total = paginationMeta.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(currentPage - 2, total - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  return (
    <main className="w-full space-y-4 py-4">
      <section className="w-full flex items-end justify-between relative">
        <h1 className="font-bold text-xl">
          Total {paginationMeta.totalItems} Mock Interviews
        </h1>
        <Link
          href={`${pathname}/interview-result-analysis`}
          className="w-fit text-white flex items-center px-2 py-2 bg-[#071526] rounded-md gap-1 cursor-pointer"
        >
          <h1>View Detailed Progress</h1>
        </Link>
      </section>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <SessionTable data={data} />
      )}

      {/* Server-side Pagination */}
      {!loading && paginationMeta.totalItems > 0 && (
        <div className="w-full flex items-center justify-between py-3">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <strong>
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, paginationMeta.totalItems)}
            </strong>{" "}
            of <strong>{paginationMeta.totalItems}</strong> sessions
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!paginationMeta.hasPrev}
              className="border-2 border-[#071526] text-[#071526] px-6 py-1 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {getVisiblePages().map((pageNo) => (
              <button
                key={pageNo}
                onClick={() => setCurrentPage(pageNo)}
                className={`px-3 py-1 rounded-md border-2 cursor-pointer text-sm ${
                  currentPage === pageNo
                    ? "bg-[#071526] border-[#071526] text-white font-semibold"
                    : "border-[#071526] text-[#071526]"
                }`}
              >
                {pageNo}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(paginationMeta.totalPages, p + 1))
              }
              disabled={!paginationMeta.hasNext}
              className="bg-[#071526] border-2 border-[#071526] text-white px-6 py-1 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;

function SessionTable({ data }: { data: Candidates[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full rounded-md border border-gray-200 overflow-hidden">
      <UiTable>
        <TableHeader className="bg-[#EEF1F8]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-[#1E1E1E] font-semibold text-sm"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="bg-white hover:bg-white border-b border-black/10"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-[#1E1E1E] text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UiTable>
    </div>
  );
}
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1` || "http://localhost:1995/api/v1";

type Candidates = {
  id: string;
  candidateName: string;
  totalInterviews: string;
  uniqueInterviews: string;
  reattempts: string;
  overallScore: string;
  avgScore: string;
};

const ITEMS_PER_PAGE = 10;

const Page = () => {
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
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_URL}/interview/institute/candidates?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
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
        console.error("Error fetching candidates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [currentPage]);

  const getVisiblePages = () => {
    const total = paginationMeta.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(currentPage - 2, total - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  return (
    <div className="w-full flex flex-col py-4">
      <section className="w-full flex items-end justify-between relative mb-4">
        <h1 className="font-bold text-xl">
          Total {paginationMeta.totalItems} Candidates Attempted
        </h1>
        <button className="text-sm font-medium">Filter</button>
      </section>

      <div className="w-full">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataTable columns={columns} data={data} showPagination={false} />
        )}
      </div>

      {/* Server-side Pagination */}
      {!loading && paginationMeta.totalItems > 0 && (
        <div className="w-full flex items-center justify-between py-3 mt-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <strong>
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, paginationMeta.totalItems)}
            </strong>{" "}
            of <strong>{paginationMeta.totalItems}</strong> candidates
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!paginationMeta.hasPrev}
              className="border-2 border-[#0B5B4D] text-[#0B5B4D] px-6 py-1 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {getVisiblePages().map((pageNo) => (
              <button
                key={pageNo}
                onClick={() => setCurrentPage(pageNo)}
                className={`px-3 py-1 rounded-md border-2 cursor-pointer text-sm ${
                  currentPage === pageNo
                    ? "bg-[#0B5B4D] border-[#0B5B4D] text-white font-semibold"
                    : "border-[#0B5B4D] text-[#0B5B4D]"
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
              className="bg-[#0B5B4D] border-2 border-[#0B5B4D] text-white px-6 py-1 rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;

export const columns: ColumnDef<Candidates>[] = [
  {
    accessorKey: "candidateName",
    header: "Candidate Name",
  },
  {
    accessorKey: "totalInterviews",
    header: "Total Interviews",
  },
  {
    accessorKey: "uniqueInterviews",
    header: "Unique Interviews",
  },
  {
    accessorKey: "reattempts",
    header: "Re-Attempts",
  },
  {
    accessorKey: "overallScore",
    header: "Overall Score",
  },
  {
    accessorKey: "avgScore",
    header: "Avg Score",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/mock-interview/${row.original.id}`}
        className="text-[#005B4F] font-medium underline underline-offset-2"
      >
        View
      </Link>
    ),
  },
];
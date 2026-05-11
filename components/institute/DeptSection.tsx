"use client";
import Link from "next/link";
import React, { useState, useMemo } from "react";

const PAGE_SIZE = 10;

interface Props {
  data?: any[];
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const DeptSection = ({ data = [], totalCount, currentPage: serverPage, onPageChange }: Props) => {
  const [localPage, setLocalPage] = useState(1);
  const isServerSide = totalCount !== undefined && onPageChange !== undefined;

  const currentPage = isServerSide ? (serverPage || 1) : localPage;
  const departments = data || [];

  const totalPages = isServerSide 
    ? Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE))
    : Math.max(1, Math.ceil(departments.length / PAGE_SIZE));

  const paginatedDepartments = useMemo(() => {
    if (isServerSide) return departments;
    const start = (currentPage - 1) * PAGE_SIZE;
    return departments.slice(start, start + PAGE_SIZE);
  }, [departments, currentPage, isServerSide]);

  const handleNext = () => {
      if (isServerSide) {
          onPageChange?.(currentPage + 1);
      } else {
          setLocalPage((p) => Math.min(totalPages, p + 1));
      }
  };

  const handlePrev = () => {
      if (isServerSide) {
          onPageChange?.(currentPage - 1);
      } else {
          setLocalPage((p) => Math.max(1, p - 1));
      }
  };

  return (
    <div className="w-full relative overflow-hidden bg-gray-50/50 p-4 rounded-b-xl border border-t-0 border-gray-100">
      <div className="overflow-y-auto pr-2 space-y-3">
        {/* Header */}
        <div className="border border-[#9FB3C8] bg-[#EEF1F8] rounded-lg">
          <div className="grid grid-cols-4 py-3 text-xs font-semibold text-[#0a0a14]">
            <div className="pl-6 text-center">No</div>
            <div className="text-center">Department Name</div>
            <div className="text-center">Created At</div>
            <div className="text-center">Action</div>
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {paginatedDepartments.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No departments found.
            </div>
          ) : (
            paginatedDepartments.map((dept: any, index: number) => (
              <div
                key={dept.id || index}
                className="grid grid-cols-4 bg-white py-3 text-xs rounded-xl border items-center hover:shadow-sm transition-shadow"
              >
                <div className="pl-6 text-center">
                  {(currentPage - 1) * PAGE_SIZE + index + 1}
                </div>

                <div className="text-center font-medium">{dept.name}</div>
                <div className="text-center text-gray-500">{dept.createdAt}</div>

                <div className="flex justify-center">
                    <Link
                    href={`/dashboard/departments`}
                    className="underline text-[#314370] font-medium cursor-pointer hover:text-[#145a3d]"
                    >
                    View More
                    </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {(totalPages > 1 || departments.length > 0) && (
          <div className="flex flex-col items-center gap-2 mt-6">
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                ‹
              </button>

              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#071526] text-white text-xs font-semibold">
                {currentPage}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeptSection;
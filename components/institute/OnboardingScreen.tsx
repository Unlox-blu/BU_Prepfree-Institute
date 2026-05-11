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

const OnboardingScreen = ({ data = [], totalCount, currentPage: serverPage, onPageChange }: Props) => {
  // Local state is used as fallback for client-side pagination
  const [localPage, setLocalPage] = useState(1);
  
  // Determine if we are using server-side or client-side pagination
  const isServerSide = totalCount !== undefined && onPageChange !== undefined;
  
  const currentPage = isServerSide ? (serverPage || 1) : localPage;
  const candidates = data || [];

  const totalPages = isServerSide 
    ? Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE))
    : Math.max(1, Math.ceil(candidates.length / PAGE_SIZE));

  const paginatedCandidates = useMemo(() => {
    // If server side, the 'data' prop is already the chunk for the current page
    if (isServerSide) return candidates;
    
    // Client side slicing
    const start = (currentPage - 1) * PAGE_SIZE;
    return candidates.slice(start, start + PAGE_SIZE);
  }, [candidates, currentPage, isServerSide]);

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
          <div className="grid grid-cols-7 py-3 text-xs font-semibold text-[#0a0a14]">
            <div className="pl-6 text-center">No</div>
            <div className="text-center">Student Name</div>
            <div className="text-center break-words">Email</div>
            <div className="text-center">Profile Completion %</div>
            <div className="text-center">Roll Number</div>
            <div className="text-center">Phone Number</div>
            <div className="text-center">Action</div>
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {paginatedCandidates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No candidates found.
            </div>
          ) : (
            paginatedCandidates.map((c: any, index: number) => (
              <div
                key={c.id || index}
                className="grid grid-cols-7 bg-white py-3 text-xs rounded-xl border items-center hover:shadow-sm transition-shadow"
              >
                <div className="pl-6 text-center">
                  {((currentPage - 1) * PAGE_SIZE) + index + 1}
                </div>

                <div className="text-center font-medium">{c.name}</div>

                <div className="text-center break-all text-gray-600">
                  {c.email}
                </div>

                <div className="w-full flex items-center justify-center">
                  <ProfileCompletion value={c.profileCompletion || 0} />
                </div>

                <div className="text-center text-gray-600">{c.roll}</div>
                <div className="text-center text-gray-600">{c.phone}</div>

                <div className="flex justify-center">
                  <Link
                    href={`/dashboard/database/profile?id=${c.id}`}
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
        {(totalPages > 1 || candidates.length > 0) && (
          <div className="flex flex-col items-center gap-2 mt-6">
            {/* Page info ABOVE */}
            <span className="text-xs text-gray-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            {/* Navigation BELOW */}
            <div className="flex items-center gap-3">
              {/* Prev */}
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                ‹
              </button>

              {/* Current Page */}
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-[#071526] text-white text-xs font-semibold">
                {currentPage}
              </div>

              {/* Next */}
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

export default OnboardingScreen;

const ProfileCompletion = ({ value }: any) => {
  const percent = parseInt(value);
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="40" height="40">
      <circle
        cx="20"
        cy="20"
        r={radius}
        stroke="#E5E7EB"
        strokeWidth="4"
        fill="none"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        stroke="#9FB3C8"
        strokeWidth="4"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
      />
      <text
        x="50%"
        y="50%"
        dy="4px"
        textAnchor="middle"
        className="text-[10px] fill-black font-medium"
      >
        {value}%
      </text>
    </svg>
  );
};
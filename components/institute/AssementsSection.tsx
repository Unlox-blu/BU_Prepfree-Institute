"use client";
import { ArrowUpRight, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

const PAGE_SIZE = 8; // Kept as 8 for grid layout

interface Props {
  data?: any[];
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const AssementsSection = ({ data = [], totalCount, currentPage: serverPage, onPageChange }: Props) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [localPage, setLocalPage] = useState(1);
  const isServerSide = totalCount !== undefined && onPageChange !== undefined;

  const currentPage = isServerSide ? (serverPage || 1) : localPage;
  const tests = data || [];

  const totalPages = isServerSide 
    ? Math.max(1, Math.ceil((totalCount || 0) / PAGE_SIZE))
    : Math.max(1, Math.ceil(tests.length / PAGE_SIZE));

  const paginatedTests = useMemo(() => {
    if (isServerSide) return tests;
    const start = (currentPage - 1) * PAGE_SIZE;
    return tests.slice(start, start + PAGE_SIZE);
  }, [tests, currentPage, isServerSide]);

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
        <section
        className={`w-full grid gap-4 h-auto transition-all duration-500 ease-in-out ${
            filterOpen ? "grid-cols-3 pr-4" : "grid-cols-4"
        }`}
        >
        {paginatedTests.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 mt-10">
            No active assessments found.
            </div>
        ) : (
            paginatedTests.map((test: any) => (
            <div
                key={test.id}
                className="row-span-1 col-span-1 px-4 py-4 bg-white rounded-lg border hover:shadow-md transition-shadow group flex flex-col justify-between"
            >
                <div>
                    <div className="flex flex-col items-start justify-between border-b border-gray-100 pb-3">
                    <div className="flex gap-2">
                        <div className="flex flex-col">
                        <h1 className="text-gray-900 text-md font-medium line-clamp-1">
                            {test.name}
                        </h1>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                            Test your knowledge and assess your skill level with this
                            curated challenge.
                        </p>
                        </div>
                    </div>

                    <TopicsList categories={[...(test.categories || [])]} />
                    </div>

                    <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-1 text-[#748784] text-xs">
                        <Clock size={14} />
                        <p>{test.time}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#748784] text-xs">
                        <FileText size={14} />
                        <p>{test.questions}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#748784] text-xs">
                        <Calendar size={14} />
                        <p>{test.attempts_left} attempts</p>
                    </div>
                    </div>
                </div>
    
                <Link
                href={`/dashboard/assessment/${test.id}`}
                className="w-full flex gap-3 items-center mt-2 h-auto py-2 justify-center rounded-xl border border-[#071526] cursor-pointer text-[#071526] font-medium hover:bg-[#071526] hover:text-white transition-all"
                >
                View Test
                <ArrowUpRight size={18} />
                </Link>
            </div>
            ))
        )}
        </section>

        {/* Pagination */}
        {(totalPages > 1 || tests.length > 0) && (
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
  );
};

export default AssementsSection;

function TopicsList({ categories }: { categories: string[] }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex gap-2 w-full flex-wrap mt-3">
      {(showAll ? categories : categories?.slice(0, 2)).map(
        (category: string, index: number) => (
          <div
            key={index}
            className="bg-[#EEF1F8] text-[#071526]/80 px-2 py-1 rounded-full text-[10px] font-medium flex items-center justify-center whitespace-nowrap"
          >
            {category}
          </div>
        )
      )}

      {!showAll && categories?.length > 2 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowAll(true);
          }}
          className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-[10px] flex items-center justify-center cursor-pointer hover:bg-gray-200"
        >
          +{categories.length - 2}
        </button>
      )}
    </div>
  );
}
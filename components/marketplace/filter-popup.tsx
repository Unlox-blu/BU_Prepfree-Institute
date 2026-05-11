"use client";
import React, { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
// Importing Job interface locally to avoid circular deps if needed, 
// or simpler: just accept props without strict Job[] typing for simplicity here.
// But we will use the same shape.

interface FilterPopupProps {
  setFilterOpen: (val: boolean) => void;
  companies: any[]; // Using any to avoid complex type imports if strictness isn't required
  jobTypeCounts: Record<string, number>;
  jobRoleCounts: Record<string, number>;
}

export function FilterPopup({
  setFilterOpen,
  companies,
  jobTypeCounts,
  jobRoleCounts,
}: FilterPopupProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [filters, setFilters] = useState({ salaryMin: "", salaryMax: "" });

  const handleToggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleClear = () => {
    setFilters({ salaryMin: "", salaryMax: "" });
    setOpenSection(null);
  };

  const renderDropdownContent = (title: string) => {
    switch (title) {
      case "Salary Range":
        return (
          <div className="flex gap-3 mt-2 pb-3">
            <input
              type="text"
              placeholder="Min"
              value={filters.salaryMin}
              onChange={(e) =>
                setFilters({ ...filters, salaryMin: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
            />
            <input
              type="text"
              placeholder="Max"
              value={filters.salaryMax}
              onChange={(e) =>
                setFilters({ ...filters, salaryMax: e.target.value })
              }
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
            />
          </div>
        );
      case "Job Type":
        return (
          <div className="flex flex-col gap-2 mt-2 pb-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> All ({companies.length})
            </label>
            {Object.keys(jobTypeCounts).map((type) => (
              <label key={type} className="flex items-center gap-2 text-sm">
                <input type="checkbox" /> {type} ({jobTypeCounts[type]})
              </label>
            ))}
          </div>
        );
      // Logic for other cases remains standard placeholder or specific implementation as per original
      default:
        return (
           <div className="flex gap-3 mt-2 pb-3">
              <input type="text" placeholder={title} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none" />
           </div>
        );
    }
  };

  const SECTIONS = [
    "Salary Range",
    "Job Type",
    "Job Status",
    "Onsite/Remote",
    "Years of Experience",
    "Job Posted In",
    "Job Role",
    "Location",
    "Employers",
  ];

  return (
    <div className="relative w-[360px] h-[600px] z-50 bg-white shadow-xl flex flex-col overflow-hidden">
      <div className="flex w-full items-center justify-between bg-white shadow-xl p-4">
        <h1 className="text-md font-medium">Filter</h1>
        <button onClick={() => setFilterOpen(false)} className="cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 px-4">
        <button
          onClick={handleClear}
          className="text-[#071526] underline text-sm font-medium cursor-pointer mt-4"
        >
          Clear Filters
        </button>
        {SECTIONS.map((title) => (
          <div key={title} className="border-b border-gray-200">
            <button
              onClick={() => handleToggleSection(title)}
              className="w-full flex items-center justify-between py-3 text-sm text-gray-800 cursor-pointer"
            >
              {title}
              {openSection === title ? (
                <ChevronUp className="w-4 h-4 text-gray-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-700" />
              )}
            </button>
            {openSection === title && renderDropdownContent(title)}
          </div>
        ))}
      </div>
    </div>
  );
}
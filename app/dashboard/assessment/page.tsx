"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Loader2, Eye, TrendingUp, Check } from "lucide-react";
import CreateAssessmentModal from "@/components/assessment/create-assessment-modal";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

type Assessment = {
  id: string;
  name: string;
  totalCandidates: number;
  noOfQuestions: number;
  category: string;
  domain: string;
  publishDate: string;
  publishDateRaw?: string | null;
  isDraft: boolean;
  isPublic: boolean;
  isLive: boolean;
  isTrending: boolean;
};

type SortKey = "default" | "name" | "publishDate";

const PAGE_SIZE = 10;

const Page = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [activeTab, setActiveTab] = useState<"main" | "drafts">("main");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Initialize with Default
  const [sortKey, setSortKey] = useState<SortKey>("default");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchAssessments = async (page = 1) => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const statusParam = activeTab === "drafts" ? "draft" : "published";

      const res = await fetch(
        `${API_BASE_URL}/assessments/?page=${page}&limit=${PAGE_SIZE}&status=${statusParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (json.success && Array.isArray(json.assessments)) {
        const mappedData: Assessment[] = json.assessments.map((item: any) => {
          const raw = item.createdAt ? new Date(item.createdAt).toISOString() : null;

          return {
            id: item._id,
            name: item.test_name,
            totalCandidates: item.assigned_count || 0,
            noOfQuestions: item.total_questions || 0,
            category: Array.isArray(item.test_categories)
              ? item.test_categories.join(", ")
              : "General",
            domain: item.domain || "General",
            publishDate: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-GB")
              : "-",
            publishDateRaw: raw,
            isDraft: item.is_draft,
            isPublic: item.is_public,
            isLive: item.is_live,
            isTrending: Boolean(item.is_trending),
          };
        });

        setAssessments(mappedData);
        const totalCount = json.count || mappedData.length;
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE) || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchAssessments(1);
  }, [activeTab]);

  useEffect(() => {
    fetchAssessments(currentPage);
  }, [currentPage]);

  // Handle Live Toggle
  const toggleLiveStatus = async (id: string, currentStatus: boolean) => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/assessments/${id}/status`, {
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ isAlive: !currentStatus })
        });

        if (res.ok) {
            toast.success(`Assessment is now ${!currentStatus ? 'Live' : 'Hidden'}`);
            setAssessments(prev => prev.map(a => {
                if (a.id === id) {
                    return {
                        ...a,
                        isLive: !currentStatus,
                        isTrending: !currentStatus ? a.isTrending : false
                    };
                }
                return a;
            }));
        } else {
            toast.error("Failed to update status");
        }
    } catch (error) {
        toast.error("Error updating status");
    }
  };

  // Sorting
  const sortedAssessments = useMemo(() => {
    const arr = [...assessments];
    const dir = sortDir === "asc" ? 1 : -1;

    // CASE 1: Default Sort 
    if (sortKey === "default") {
        return arr.sort((a, b) => {
            // Trending Priority
            if (a.isTrending !== b.isTrending) {
                return a.isTrending ? -1 : 1;
            }
            // Live Priority
            if (a.isLive !== b.isLive) {
                return a.isLive ? -1 : 1;
            }
            // Date (Always Newest First for Default)
            const da = a.publishDateRaw ? Date.parse(a.publishDateRaw) : 0;
            const db = b.publishDateRaw ? Date.parse(b.publishDateRaw) : 0;
            return db - da;
        });
    }

    // CASE 2: Specific Sorts 
    if (sortKey === "name") {
      return arr.sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase()
          ? -1 * dir
          : a.name.toLowerCase() > b.name.toLowerCase()
          ? 1 * dir
          : 0
      );
    }

    if (sortKey === "publishDate") {
      return arr.sort((a, b) => {
        const da = a.publishDateRaw ? Date.parse(a.publishDateRaw) : 0;
        const db = b.publishDateRaw ? Date.parse(b.publishDateRaw) : 0;
        return (da - db) * dir;
      });
    }

    return arr;
  }, [assessments, sortKey, sortDir]);

  // Helper to check active state for styling
  const isSortActive = (key: SortKey, dir?: "asc" | "desc") => {
     if (key !== sortKey) return false;
     if (dir && dir !== sortDir) return false;
     return true;
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans relative">
      
      <section className="flex items-center justify-between mb-6">
        
        <h1 className="text-xl font-bold text-[#0a0a14]">
          Total {assessments.length} {assessments.length === 1 ? "Assessment" : "Assessments"}
        </h1>

        <div className="flex items-center gap-4 relative">

          {/* SORT */}
          <div className="relative">

            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 text-sm font-medium text-[#0a0a14] px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
            >
              Sort <ArrowUpDown size={16} />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-md z-30 py-1">
                <div className="flex flex-col text-sm">

                  {/* Default Option */}
                  <button
                    onClick={() => {
                      setSortKey("default");
                      setSortDir("desc"); 
                      setShowSortMenu(false);
                    }}
                    className={`px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        isSortActive("default") ? "text-[#071526] font-medium bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>Default</span>
                    {isSortActive("default") && <Check size={14} />}
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setSortKey("name");
                      setSortDir("asc");
                      setShowSortMenu(false);
                    }}
                    className={`px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        isSortActive("name", "asc") ? "text-[#071526] font-medium bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>Name (A–Z)</span>
                    {isSortActive("name", "asc") && <Check size={14} />}
                  </button>

                  <button
                    onClick={() => {
                      setSortKey("name");
                      setSortDir("desc");
                      setShowSortMenu(false);
                    }}
                    className={`px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        isSortActive("name", "desc") ? "text-[#071526] font-medium bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>Name (Z–A)</span>
                    {isSortActive("name", "desc") && <Check size={14} />}
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={() => {
                      setSortKey("publishDate");
                      setSortDir("desc");
                      setShowSortMenu(false);
                    }}
                    className={`px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        isSortActive("publishDate", "desc") ? "text-[#071526] font-medium bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>Newest First</span>
                    {isSortActive("publishDate", "desc") && <Check size={14} />}
                  </button>

                  <button
                    onClick={() => {
                      setSortKey("publishDate");
                      setSortDir("asc");
                      setShowSortMenu(false);
                    }}
                    className={`px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        isSortActive("publishDate", "asc") ? "text-[#071526] font-medium bg-green-50/50" : "text-gray-700"
                    }`}
                  >
                    <span>Oldest First</span>
                    {isSortActive("publishDate", "asc") && <Check size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Create Assessment */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#071526] hover:bg-[#094d41] text-white text-sm font-medium px-6 py-2.5 rounded-md"
          >
            Create Assessment
          </button>
        </div>
      </section>

      {/* TABS */}
      <div className="flex items-center gap-8 border-b mb-4">
        <button
          onClick={() => setActiveTab("main")}
          className={`pb-2 text-sm font-medium border-b-2 ${
            activeTab === "main"
              ? "border-[#071526] text-[#071526]"
              : "border-transparent text-gray-500"
          }`}
        >
          Main
        </button>

        <button
          onClick={() => setActiveTab("drafts")}
          className={`pb-2 text-sm font-medium border-b-2 ${
            activeTab === "drafts"
              ? "border-[#071526] text-[#071526]"
              : "border-transparent text-gray-500"
          }`}
        >
          Drafts
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex flex-1 justify-center items-center">
          <Loader2 size={32} className="animate-spin text-[#071526]" />
        </div>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-y-auto pr-2">

            {/* Header */}
            <div className="w-full border border-[#9FB3C8] bg-[#EEF1F8] rounded-lg">
              <div className={`grid ${activeTab === "main" ? "grid-cols-8" : "grid-cols-7"} py-5 text-sm font-semibold`}>
                <div className="text-center">Name</div>
                <div className="text-center">Assignees</div>
                <div className="text-center">No. of Questions</div>
                <div className="text-center">Category</div>
                <div className="text-center">Domain</div>
                <div className="text-center">Publish date</div>
                {activeTab === "main" && <div className="text-center">Live</div>}
                <div className="text-center">Action</div>
              </div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-3 mt-3">
              {sortedAssessments.map((item) => (
                <div
                  key={item.id}
                  className={`grid ${activeTab === "main" ? "grid-cols-8" : "grid-cols-7"} bg-white py-5 rounded-xl shadow hover:shadow-md transition items-center relative overflow-hidden`}
                >
                  {/* Trending Badge - Only show in Default sort or if actively trending */}
                  {item.isTrending && (
                    <div className="absolute top-0 left-0 bg-[#EEF1F8] text-[#071526] px-2 py-1 rounded-br-lg flex items-center gap-1 shadow-sm border-r border-b border-[#071526]/10">
                        <TrendingUp size={12} className="stroke-[3]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Trending</span>
                    </div>
                  )}

                  {/* Name wrapped */}
                  <div className="pl-6 text-left break-words pt-1">{item.name}</div>

                  <div className="text-center font-medium text-gray-700">
                    {item.isPublic ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">Public</span>
                    ) : (
                        item.totalCandidates
                    )}
                  </div>
                  <div className="text-center">{item.noOfQuestions}</div>

                  <div className="text-center break-words">{item.category}</div>
                  <div className="text-center break-words">{item.domain}</div>

                  <div className="text-center">{item.publishDate}</div>

                  {activeTab === "main" && (
                      <div className="flex justify-center">
                        <Switch 
                            checked={item.isLive}
                            onCheckedChange={() => toggleLiveStatus(item.id, item.isLive)}
                            className="data-[state=checked]:bg-[#071526] scale-90"
                        />
                      </div>
                  )}

                  <div className="flex justify-center">
                    {activeTab === "drafts" ? (
                      <Link
                        href={`/dashboard/assessment/${item.id}/qna`}
                        className="text-[#071526] underline font-semibold"
                      >
                        Edit
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/assessment/${item.id}`}
                        className="text-[#314370] hover:text-[#071526] transition-colors"
                        title="View Report"
                      >
                        <Eye size={20} />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between mt-4">
        <span className="text-sm">Pages {currentPage} of {totalPages}</span>

        <div className="flex gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-6 py-2 border rounded-md disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-6 py-2 bg-[#071526] text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showCreateModal && (
        <CreateAssessmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchAssessments(currentPage);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;
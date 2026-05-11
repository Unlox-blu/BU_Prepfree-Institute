"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChartNoAxesColumn,
  CircleCheck,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import EditCandidateModal from "@/components/candidate/edit-candidate-modal";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

type Candidate = {
  id: string;
  name: string;
  email: string;
  status: string;
  phone: string;
  profileCompletion: string;
  qualified: boolean;
  isActive: boolean;
};

type SortKey = "name" | "email" | "status" | "profileCompletion";

const SORT_LABELS: Record<SortKey, string> = {
  name: "Name",
  email: "Email",
  status: "Status",
  profileCompletion: "Profile Completion",
};

const PAGE_SIZE = 10;

const tabs = [
  { id: "all", label: "All Candidates" },
  { id: "qualified", label: "Qualified" },
  { id: "placed", label: "Placed" },
];

const Page = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Candidate | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      // If page is already 1, we must explicitly fetch because the currentPage effect won't fire
      if (currentPage === 1) {
        fetchCandidates(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Trigger fetch when tab changes
  useEffect(() => {
    setCurrentPage(1);
    // If page is already 1, we must explicitly fetch because the currentPage effect won't fire
    if (currentPage === 1) {
      fetchCandidates(1);
    }
  }, [activeTab]);

  const router = useRouter();

  const fetchCandidates = async (page = 1) => {
    try {
      setLoading(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) throw new Error("No token found");

      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        search: search || "",
        tab: activeTab || "all", // all / qualified / placed
      });

      // Updated Endpoint to match existing Institute Routes
      const res = await fetch(`${API_BASE_URL}/institute/users?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch candidates");

      const json = await res.json();
      const items = Array.isArray(json.data) ? json.data : [];

      const mapped: Candidate[] = items.map((item: any) => ({
        id: item._id ?? "",
        name: item.candidate_name ?? "",
        email: item.email ?? "",
        status: item.status ?? "inactive",
        profileCompletion: item.profile_completion ?? "0%",
        phone: item.phone_no,
        qualified: item.qualified,
        isActive: item.is_active,
      }));

      setCandidates(mapped);

      const totalCount = json.count ?? 0;
      setTotalPages(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
      setCurrentPage(json.currentPage || page); // Use API current page or fallback to requested page
    } catch (err) {
      console.error("API error:", err);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates(currentPage);
  }, [currentPage]);

  // ------------------------------------------
  // SORTING (Applied to the current page view)
  // ------------------------------------------
  const sortedCandidates = useMemo(() => {
    // We sort the candidates currently in state (which represents the current page)
    const source = candidates;
    if (!sortKey) return source;

    const arr = [...source];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      const va = (a as any)[sortKey]?.toString() ?? "";
      const vb = (b as any)[sortKey]?.toString() ?? "";
      return va.localeCompare(vb) * dir;
    });

    return arr;
  }, [candidates, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
    setShowSortMenu(false);
  };

  const clearSort = () => {
    setSortKey(null);
    setSortDir("asc");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedCandidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async (candidate: any) => {
    if (!confirm(`Delete ${candidate.name}?`)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found");

      // Updated Endpoint
      const res = await fetch(`${API_BASE_URL}/institute/users/${candidate.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json.message || "Delete failed");

      toast.success("Candidate deleted");
      fetchCandidates(currentPage);
    } catch {
      toast.error("Error deleting candidate");
    }
  };

  const handleToggleActive = async (id: string, newState: boolean) => {
    try {
      const token = localStorage.getItem("token");

      // Updated Endpoint
      const res = await fetch(`${API_BASE_URL}/institute/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: newState }),
      });

      if (!res.ok) {
        throw new Error("Failed to update active status");
      }

      // 🔄 Refresh list
      fetchCandidates(currentPage);
    } catch (error) {
      console.error("Error updating active status:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return toast.error("No candidates selected");

    if (!confirm(`Delete ${selectedIds.length} candidates?`)) return;

    try {
      const token = localStorage.getItem("token");

      // Updated Endpoint
      const res = await fetch(`${API_BASE_URL}/institute/users/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json.message);

      toast.success("Deleted successfully");
      setSelectedIds([]);
      fetchCandidates(currentPage);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  const handleSingleUpdate = () => {
    if (selectedIds.length === 0)
      return toast.error("Select a candidate to update");

    if (selectedIds.length > 1)
      return toast.error("You can update only one candidate");

    const target = candidates.find((x) => x.id === selectedIds[0]);
    if (!target) return toast.error("Candidate not found");

    setEditData(target);
    setEditModalOpen(true);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");

      // Updated Endpoint
      const res = await fetch(`${API_BASE_URL}/institute/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok)
        return toast.error(json.message || "Failed to update status");

      toast.success("Status updated");
      fetchCandidates(currentPage);
    } catch {
      toast.error("Status update failed");
    }
  };

  const updateQualified = async (id: string, currentValue: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found");

      const newValue = !currentValue;

      // Updated Endpoint
      const res = await fetch(`${API_BASE_URL}/institute/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qualified: newValue }),
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json.message || "Update failed");

      toast.success(
        newValue ? "Candidate qualified" : "Candidate disqualified"
      );

      fetchCandidates(currentPage);
    } catch {
      toast.error("Error updating qualification");
    }
  };

  const StatusDropdown = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {
    const statuses = ["Placed", "Not Placed"];

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs border px-2 py-1 rounded-md"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans relative">
      {/* HEADER */}
      <section className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#1E1E1E]">Database</h1>
          <input
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-4 relative">
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1 text-[#E31717] text-sm font-medium px-6 py-2.5 rounded-md bg-white"
          >
            <Trash2 size={14} />
            Delete
          </button>

          <button
            onClick={handleSingleUpdate}
            className="flex items-center gap-1 text-[#0B5B4D] border border-[#0B5B4D] text-sm font-medium px-6 py-2.5 rounded-md bg-white"
          >
            Update Details
          </button>


        </div>
      </section>

      {/* TABS */}
      <section className="flex items-center justify-between w-full gap-6 border-b border-gray-300 pb-4 mb-6">
        <div className="w-fit flex rounded-md overflow-hidden border-2 border-black/20 mt-4">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 cursor-pointer transition-colors ${activeTab === tab.id
                  ? "bg-[#FFDC85] font-semibold"
                  : "bg-white text-gray-700"
                } ${idx !== tabs.length - 1 ? "border-r-2 border-black/20" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SORT BUTTON */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 text-sm font-medium text-[#1E1E1E] px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Sort <ArrowUpDown size={16} />
            {sortKey && (
              <span>
                {SORT_LABELS[sortKey]} ({sortDir})
              </span>
            )}
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-30 border">
              <div className="p-2">
                {Object.keys(SORT_LABELS).map((k) => (
                  <button
                    key={k}
                    onClick={() => toggleSort(k as SortKey)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm"
                  >
                    {SORT_LABELS[k as SortKey]}
                  </button>
                ))}

                <button
                  onClick={clearSort}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm text-[#0B5B4D] font-medium mt-2"
                >
                  Clear sort
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TABLE */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0B5B4D]" size={32} />
        </div>
      ) : (
        <div className="flex-1 relative">
          <div className="absolute inset-0 overflow-y-auto pr-2">
            <div className="border border-[#69BE81] bg-[#EAF6EE] rounded-lg">
              <div className="grid grid-cols-8 py-3 text-xs font-semibold text-[#1E1E1E]">
                <div className="pl-6 text-center">No</div>

                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={
                      selectedIds.length === sortedCandidates.length &&
                      sortedCandidates.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </div>

                <div className="text-center">Candidate Name</div>
                <div className="text-center">Profile Completion</div>
                <div className="text-center">Phone Number</div>
                <div className="text-center">Email</div>
                <div className="text-center">Status</div>
                <div className="text-center">Action</div>
              </div>
            </div>

            {/* ROWS */}
            <div className="flex flex-col gap-3 mt-3">
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No candidates found.
                </div>
              ) : (
                sortedCandidates.map((c, index) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-8 bg-white py-3 text-xs rounded-xl border items-center"
                  >
                    <div className="pl-6 text-center">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </div>

                    <div className="text-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => toggleSelectOne(c.id)}
                      />
                    </div>

                    <div className="text-center">{c.name}</div>

                    <div className="w-full flex items-center justify-center">
                      <ProfileCompletion value={c.profileCompletion} />
                    </div>

                    <div className="text-center">{c.phone}</div>
                    <div className="text-center">{c.email}</div>

                    <div className="flex items-center justify-center">
                      <StatusDropdown
                        value={c.status}
                        onChange={(status) => updateStatus(c.id, status)}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex">
                              <Switch
                                checked={c.isActive}
                                onCheckedChange={(value) =>
                                  handleToggleActive(c.id, value)
                                }
                                className="scale-75 origin-center data-[state=checked]:bg-[#0B5B4D]"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="bg-[#0B5B4D] text-white text-xs fill-[#0B5B4D] border-none"
                          >
                            Clicking here will deactivate this candidate’s
                            profile <br /> which will not let the candidate to
                            access their <br /> own profile
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="cursor-pointer" onClick={() => {
                              router.push(`/dashboard/database/profile?id=${c.id}`)
                            }}>
                              <User size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="bg-[#0B5B4D] text-white text-xs px-2 py-1"
                          >
                            View Profile
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/dashboard/database/scoreboard?id=${c.id}`
                                )
                              }
                            >
                              <ChartNoAxesColumn size={16} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="bg-[#0B5B4D] text-white text-xs px-2 py-1"
                          >
                            View Scorecard
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="cursor-pointer"
                              onClick={() => updateQualified(c.id, c.qualified)}
                            >
                              <CircleCheck
                                size={16}
                                className={`${c.qualified ? "fill-[#0B5B4D] text-white" : ""
                                  }`}
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="bg-[#0B5B4D] text-white text-xs px-2 py-1"
                          >
                            Mark As Qualified
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="cursor-pointer"
                              onClick={() => handleDelete(c)}
                            >
                              <Trash2 size={16} className="text-[#DD1C1C]" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="center"
                            className="bg-[#0B5B4D] text-white text-xs px-2 py-1"
                          >
                            Delete User
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-6 py-2 border border-[#0B5B4D] rounded-md text-[#0B5B4D] disabled:opacity-50"
          >
            Prev
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-6 py-2 bg-[#0B5B4D] text-white rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>



      {editModalOpen && editData && (
        <EditCandidateModal
          data={editData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            fetchCandidates(currentPage);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;

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
        stroke="#27CC53"
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
        className="text-[10px] fill-black"
      >
        {value}
      </text>
    </svg>
  );
};
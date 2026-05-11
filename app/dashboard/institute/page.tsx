"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Loader2, Pencil, Trash2 } from "lucide-react";
import CreateInstituteModal from "@/components/institute/add-institute-modal";
import EditInstituteModal from "@/components/institute/edit-institute-modal";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

// ------------------ TYPES ------------------
type Institute = {
  id: string;
  name: string;
  email: string;
  address: string;
  category: string;
  establishedDate: string;
  establishedDateRaw?: string | null;
};

type SortKey = "name" | "email" | "address" | "category" | "establishedDate";

const SORT_LABELS: Record<SortKey, string> = {
  name: "Name",
  email: "Email",
  address: "Address",
  category: "Category",
  establishedDate: "Established",
};

const PAGE_SIZE = 10;

// ------------------ PAGE ------------------
const Page = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ------------------ SAMPLE FALLBACK DATA ------------------
  const SAMPLE_DATA: Institute[] = [
    {
      id: "1",
      name: "Global Tech Institute",
      email: "contact@gtinst.com",
      address: "Bangalore, India",
      category: "Technology",
      establishedDate: "12/05/2010",
      establishedDateRaw: "2010-05-12",
    },
    {
      id: "2",
      name: "National Arts Academy",
      email: "info@artsacademy.org",
      address: "Delhi, India",
      category: "Arts",
      establishedDate: "09/01/2005",
      establishedDateRaw: "2005-01-09",
    },
  ];

  // ------------------ FETCH INSTITUTES ------------------
  const fetchInstitutes = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/institutes?page=${page}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Failed to fetch");

      const mapped: Institute[] = json.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        address: item.address,
        category: item.category,
        establishedDate: new Date(item.createdAt).toLocaleDateString("en-GB"),
        establishedDateRaw: item.createdAt,
      }));

      setInstitutes(mapped);
      setTotalPages(Math.ceil(json.total / PAGE_SIZE));
    } catch (err) {
      console.warn("API failed, loading sample data...");
      toast.warning("Using sample data (API offline)");

      // Use sample data
      setInstitutes(SAMPLE_DATA);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes(currentPage);
  }, [currentPage]);

  // ------------------ SORT ------------------
  const sortedInstitutes = useMemo(() => {
    if (!sortKey) return institutes;

    const arr = [...institutes];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "establishedDate") {
        const da = a.establishedDateRaw ? Date.parse(a.establishedDateRaw) : 0;
        const db = b.establishedDateRaw ? Date.parse(b.establishedDateRaw) : 0;
        return (da - db) * dir;
      }
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });

    return arr;
  }, [institutes, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  };

  // ------------------ DELETE ONE ------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this institute?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/institutes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully");
      fetchInstitutes(currentPage);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ------------------ BULK DELETE ------------------
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No items selected");
      return;
    }
    if (!confirm("Delete selected institutes?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/institutes/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      toast.success("Bulk delete success");
      setSelectedIds([]);
      setSelectAll(false);
      fetchInstitutes(currentPage);
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  // ------------------ EDIT ------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleEdit = (institute: Institute) => {
    setEditData(institute);
    setEditModalOpen(true);
  };

  // ------------------ SELECT LOGIC ------------------
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setSelectedIds(newState ? institutes.map((i) => i.id) : []);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans relative">
      {/* HEADER */}
      <section className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#1E1E1E]">All Institutes</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBulkDelete}
            className="text-red-600 px-4 py-2 rounded-md flex items-center gap-2 bg-white"
          >
            <Trash2 size={18}/>
            Delete
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#0B5B4D] text-white px-6 py-2 rounded-md"
          >
            Add Institute
          </button>
        </div>
      </section>

      {/* TABLE */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0B5B4D]" size={32} />
        </div>
      ) : (
        <div className="flex-1">
          <div className="border bg-[#EAF6EE] rounded-lg">
            <div className="grid grid-cols-8 py-5 text-sm font-semibold">
              <div className="pl-6 text-center">Sr.No</div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="text-center">Name</div>
              <div className="text-center">Email</div>
              <div className="text-center">Address</div>
              <div className="text-center">Category</div>
              <div className="text-center">Established</div>
              <div className="text-center">Action</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {sortedInstitutes.map((i, index) => (
              <div
                key={i.id}
                className="grid grid-cols-8 bg-white py-5 rounded-xl border"
              >
                <div className="pl-6 text-center">{index + 1}</div>

                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedIds.includes(i.id)}
                    onChange={() => toggleSelect(i.id)}
                  />
                </div>

                <div className="text-center">{i.name}</div>
                <div className="text-center">{i.email}</div>
                <div className="text-center">{i.address}</div>
                <div className="text-center">{i.category}</div>
                <div className="text-center">{i.establishedDate}</div>

                <div className="flex gap-2 items-center justify-center">
                  <Link href={`/dashboard/institute/departments?id=${i.id}`} className="text-[#0B5B4D] underline">View More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGINATION */}
      <div className="flex justify-between mt-4">
        <span>
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border px-4 py-2 rounded-md"
          >
            Prev
          </button>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="bg-[#0B5B4D] text-white px-4 py-2 rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateInstituteModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchInstitutes(currentPage);
            setShowCreateModal(false);
          }}
        />
      )}

      {editModalOpen && (
        <EditInstituteModal
          institute={editData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            fetchInstitutes(currentPage);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Loader2, Pencil, Trash2 } from "lucide-react";
import CreateSubscriberModal from "@/components/subscriber/create-subscriber-modal";
import EditSubscriberModal from "@/components/subscriber/edit-subscriber-modal";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

// ------------------ TYPES ------------------
type Subscriber = {
  id: string;
  name: string;
  email: string;
  status: string;
  frequency: string;
  category: string;
  addedDate: string;
  addedDateRaw?: string | null;
};

type SortKey =
  | "name"
  | "email"
  | "status"
  | "frequency"
  | "category"
  | "addedDate";

const SORT_LABELS: Record<SortKey, string> = {
  name: "Name",
  email: "Email",
  status: "Status",
  frequency: "Frequency",
  category: "Category",
  addedDate: "Added Date",
};

const PAGE_SIZE = 10;

// ------------------ PAGE ------------------
const Page = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ------------------ FETCH SUBSCRIPTIONS ------------------
  const fetchSubscribers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/comm-subs?page=${page}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch");

      const mapped: Subscriber[] = json.data.map((item: any) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        status: item.status,
        frequency: item.frequency,
        category: item.category,
        addedDate: new Date(item.createdAt).toLocaleDateString("en-GB"),
        addedDateRaw: item.createdAt,
      }));

      setSubscribers(mapped);
      setTotalPages(Math.ceil((json.pagination?.total ?? json.total ?? 0) / PAGE_SIZE));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(currentPage);
  }, [currentPage]);

  // ------------------ SORT ------------------
  const sortedSubscribers = useMemo(() => {
    if (!sortKey) return subscribers;

    const arr = [...subscribers];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "addedDate") {
        const da = a.addedDateRaw ? Date.parse(a.addedDateRaw) : 0;
        const db = b.addedDateRaw ? Date.parse(b.addedDateRaw) : 0;
        return (da - db) * dir;
      }
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });

    return arr;
  }, [subscribers, sortKey, sortDir]);

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
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/comm-subs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully");
      fetchSubscribers(currentPage);
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
    if (!confirm("Delete selected items?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/comm-subs/bulk-delete`, {
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
      fetchSubscribers(currentPage);
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  // ------------------ EDIT ------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const handleEdit = (sub: Subscriber) => {
    setEditData(sub);
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
    setSelectedIds(newState ? subscribers.map((s) => s.id) : []);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans relative">
      {/* HEADER */}
      <section className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#0a0a14]">All Subscriptions</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBulkDelete}
            className="text-red-600 border border-red-600 px-4 py-2 rounded-md"
          >
            Bulk Delete
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#071526] text-white px-6 py-2 rounded-md"
          >
            Add Subscription
          </button>
        </div>
      </section>

      {/* TABLE */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#071526]" size={32} />
        </div>
      ) : (
        <div className="flex-1">
          <div className="border bg-[#EEF1F8] rounded-lg">
            <div className="grid grid-cols-9 py-5 text-sm font-semibold">
              <div className="pl-6">Sr.No</div>
              <div>
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </div>
              <div>Name</div>
              <div>Email</div>
              <div>Status</div>
              <div>Frequency</div>
              <div>Category</div>
              <div>Added</div>
              <div>Action</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {sortedSubscribers.map((s, index) => (
              <div
                key={s.id}
                className="grid grid-cols-9 bg-white py-5 rounded-xl border"
              >
                <div className="pl-6">{index + 1}</div>

                <div>
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSelect(s.id)}
                  />
                </div>

                <div>{s.name}</div>
                <div className="truncate">{s.email}</div>
                <div>{s.status}</div>
                <div>{s.frequency}</div>
                <div>{s.category}</div>
                <div>{s.addedDate}</div>

                <div className="flex gap-2">
                  <Pencil
                    size={16}
                    className="cursor-pointer"
                    onClick={() => handleEdit(s)}
                  />
                  <Trash2
                    size={16}
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(s.id)}
                  />
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
            className="bg-[#071526] text-white px-4 py-2 rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateSubscriberModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchSubscribers(currentPage);
            setShowCreateModal(false);
          }}
        />
      )}

      {editModalOpen && (
        <EditSubscriberModal
          data={editData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            fetchSubscribers(currentPage);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;

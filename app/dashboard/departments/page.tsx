"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Loader2, Pencil, Trash2 } from "lucide-react";
import CreateDepartmentModal from "@/components/department/add-department-modal";
import EditDepartmentModal from "@/components/department/edit-department-modal";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

// ------------------ TYPES ------------------
type Department = {
  id: string;
  name: string;
};

type SortKey = "name";

const PAGE_SIZE = 10;

// ------------------ PAGE ------------------
const Page = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // ------------------ FETCH DEPARTMENTS ------------------
  const fetchDepartments = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // FIX: Added /institute prefix
      const res = await fetch(
        `${API_BASE_URL}/institute/departments?page=${page}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      const mapped: Department[] = json.data.map((item: any) => ({
        id: item._id,
        name: item.name,
      }));

      setDepartments(mapped);
      setTotalPages(Math.ceil(json.total / PAGE_SIZE));
    } catch (err) {
      toast.error("Failed to fetch departments");
      setDepartments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(currentPage);
  }, [currentPage]);

  // ------------------ SORT ------------------
  const sortedDepartments = useMemo(() => {
    if (!sortKey) return departments;

    const arr = [...departments];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });

    return arr;
  }, [departments, sortKey, sortDir]);

  // ------------------ DELETE ONE ------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;

    try {
      const token = localStorage.getItem("token");

      // FIX: Added /institute prefix
      const res = await fetch(`${API_BASE_URL}/institute/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully");
      fetchDepartments(currentPage);
    } catch {
      toast.error("Delete failed");
    }
  };

  // ------------------ BULK DELETE ------------------
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No departments selected");
      return;
    }
    if (!confirm("Delete selected departments?")) return;

    try {
      const token = localStorage.getItem("token");

      // FIX: Added /institute prefix
      const res = await fetch(`${API_BASE_URL}/institute/departments/bulk-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error();

      toast.success("Bulk delete success");
      setSelectedIds([]);
      setSelectAll(false);
      fetchDepartments(currentPage);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  // ------------------ EDIT ------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Department | null>(null);

  const handleEdit = (department: Department) => {
    setEditData(department);
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
    setSelectedIds(newState ? departments.map((i) => i.id) : []);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 font-sans relative">
      {/* HEADER */}
      <section className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#0a0a14]">Departments</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={handleBulkDelete}
            className="text-red-600 px-4 py-2 rounded-md flex items-center gap-2 bg-white"
          >
            <Trash2 size={18} />
            Delete
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#071526] text-white px-6 py-2 rounded-md"
          >
            Add Department
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
            <div className="grid grid-cols-6 py-5 text-sm font-semibold">
              <div className="pl-6 text-center">Sr.No</div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="text-center col-span-2">Name</div>
              <div className="text-center col-span-2">Action</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {sortedDepartments.length === 0 && (
                <div className="text-center py-10 text-gray-500">No departments found.</div>
            )}
            {sortedDepartments.map((d, index) => (
              <div
                key={d.id}
                className="grid grid-cols-6 bg-white py-5 rounded-xl border"
              >
                <div className="pl-6 text-center">{index + 1 + (currentPage-1)*PAGE_SIZE}</div>

                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedIds.includes(d.id)}
                    onChange={() => toggleSelect(d.id)}
                  />
                </div>

                <div className="text-center col-span-2">{d.name}</div>

                <div className="flex gap-2 items-center justify-center col-span-2">
                  <Pencil
                    size={16}
                    className="cursor-pointer"
                    onClick={() => handleEdit(d)}
                  />
                  <Trash2
                    size={16}
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(d.id)}
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
          Page {currentPage} of {totalPages || 1}
        </span>

        <div className="flex gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="border px-4 py-2 rounded-md disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="bg-[#071526] text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateDepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchDepartments(currentPage);
            setShowCreateModal(false);
          }}
        />
      )}

      {editModalOpen && (
        <EditDepartmentModal
          department={editData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            fetchDepartments(currentPage);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Page;
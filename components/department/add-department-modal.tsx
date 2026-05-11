"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

export default function AddDepartmentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name) return toast.error("Department name required");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // FIX: Added /institute prefix
      const res = await fetch(`${API_BASE_URL}/institute/departments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Department Added Successfully");
      onSuccess?.();
    } catch (err) {
      toast.error("Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[450px] p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Add Department</h2>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Department Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#0B5B4D] text-white rounded-md py-2"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";
import { Switch } from "@/components/ui/switch";

export default function EditCandidateModal({ data, onClose, onSuccess }: any) {
  const [name, setName] = useState(data.name || "");
  const [email, setEmail] = useState(data.email || ""); // Often emails are immutable, but keeping editable if backend allows
  const [phone, setPhone] = useState(data.phone || "");
  const [status, setStatus] = useState(data.status || "Not Placed");
  const [qualified, setQualified] = useState(data.qualified || false);
  const [isActive, setIsActive] = useState(data.isActive !== undefined ? data.isActive : true);

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!name) return toast.error("Name is required");
    if (!email) return toast.error("Email is required");
    if (!phone) return toast.error("Phone is required");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not logged in");
        setLoading(false);
        return;
      }

      // CORRECTED ENDPOINT: /institute/users/:id
      const res = await fetch(`${API_BASE_URL}/institute/users/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidate_name: name,
          phone_no: phone,
          status: status,
          qualified: qualified,
          is_active: isActive
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Failed to update candidate");
        setLoading(false);
        return;
      }

      toast.success("Candidate updated successfully!");
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white w-[50%] rounded-xl p-8 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-6">Manage Candidate</h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Name</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email - Disabled often for security, or Enabled if allowed */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            className="w-full border px-3 py-2 rounded-md bg-gray-50 cursor-not-allowed"
            value={email}
            disabled
            title="Email cannot be changed"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Phone Number</label>
          <input
            className="w-full border px-3 py-2 rounded-md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex gap-8 mb-4">
          {/* Status */}
          <div className="w-1/2">
            <label className="block font-medium mb-1">Placement Status</label>
            <select
              className="w-full border px-3 py-2 rounded-md"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Not Placed">Not Placed</option>
              <option value="Placed">Placed</option>
            </select>
          </div>
        </div>

        <div className="flex gap-10 mt-6">
          {/* Active Toggle */}
          <div className="flex flex-col gap-2">
            <label className="block font-medium text-sm">Account Status</label>
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v)}
                className="data-[state=checked]:bg-[#0B5B4D]"
              />
              <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>

          {/* Qualified Toggle */}
          <div className="flex flex-col gap-2">
            <label className="block font-medium text-sm">Qualified</label>
            <div className="flex items-center gap-2">
              <Switch
                checked={qualified}
                onCheckedChange={(v) => setQualified(v)}
                className="data-[state=checked]:bg-[#0B5B4D]"
              />
              <span className="text-sm">{qualified ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>

        {/* Update Button */}
        <div className="w-full flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-[#0B5B4D] text-white px-6 py-2 rounded-md flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Manage Candidate
          </button>
        </div>
      </div>
    </div>
  );
}
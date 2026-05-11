"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

export default function EditSubscriberModal({ data, onClose, onSuccess }: any) {
  const [email, setEmail] = useState(data.email || "");
  const [category, setCategory] = useState(data.category || "");
  const [frequency, setFrequency] = useState(data.frequency || "");
  const [status, setStatus] = useState(data.status || "");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(data.name || "");

  const handleUpdate = async () => {
    if (!name) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!frequency) return toast.error("Frequency is required");
    if (!status) return toast.error("Status is required");
    if (!category) return toast.error("Category is required");

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Not logged in");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/comm-subs/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          category,
          frequency,
          status,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Failed to update subscriber");
        setLoading(false);
        return;
      }

      toast.success("Subscriber updated successfully!");
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
      <div className="bg-white w-[600px] rounded-xl p-6 relative">
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Subscriber</h2>

        <label className="block font-medium">Name</label>
        <input
          className="w-full border px-3 py-2 rounded mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Email */}
        <label className="block font-medium">Email</label>
        <input
          className="w-full border px-3 py-2 rounded mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Frequency */}
        <label className="block mt-4 font-medium">Frequency</label>
        <select
          className="w-full border px-3 py-2 rounded mt-1"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="">Select Frequency</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
        </select>

        {/* Status */}
        <label className="block mt-4 font-medium">Status</label>
        <select
          className="w-full border px-3 py-2 rounded mt-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Select Status</option>
          <option value="Subscribed">Subscribed</option>
          <option value="Unsubscribed">Unsubscribed</option>
        </select>

        {/* Category */}
        <label className="block mt-4 font-medium">Category</label>
        <select
          className="w-full border px-3 py-2 rounded mt-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="tech">Tech News</option>
          <option value="coding">Coding Tips</option>
          <option value="general">General</option>
        </select>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="mt-5 w-full bg-[#071526] text-white py-2 rounded flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Update
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";

export default function AddSubscriberModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState("");
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Subscribed");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!frequency) {
      toast.error("Please select a frequency");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in.");
        setIsLoading(false);
        return;
      }

      // 🔥 Correct API endpoint
      const res = await fetch(`${API_BASE_URL}/comm-subs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          frequency,
          category,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to create subscription");
        setIsLoading(false);
        return;
      }

      toast.success("Subscription created successfully!");

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white w-[40%] max-w-[500px] rounded-2xl relative shadow-xl p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={22} />
        </button>

        <h1 className="text-xl font-semibold">Add Subscription</h1>

        {/* Email */}
        <div className="mt-6">
          <label className="block font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="name"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mt-6">
          <label className="block font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="xyz@gmail.com"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Frequency */}
        <div className="mt-6">
          <label className="block font-medium">
            Frequency <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </div>

        {/* Category */}
        <div className="mt-6">
          <label className="block font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="tech">Tech News</option>
            <option value="coding">Coding Tips</option>
            <option value="general">General</option>
          </select>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-end gap-4 mt-10">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-md text-gray-600"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#071526] text-white rounded-md flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

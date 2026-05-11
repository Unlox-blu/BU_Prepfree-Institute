"use client";

import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";
import { Switch } from "@/components/ui/switch";

export default function AddCandidateModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [placementStatus, setPlacementStatus] = useState("Not Placed");
  const [qualified, setQualified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  // profileCompletion is calculated by backend, not set manually usually, 
  // but keeping state if you intended to send it for visual reasons (though backend ignores it)
  const [profileCompletion, setProfileCompletion] = useState("0%");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!phone.trim()) return toast.error("Phone number is required");

    try {
      setIsLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in.");
        setIsLoading(false);
        return;
      }

      // CORRECTED ENDPOINT: /institute/users
      const res = await fetch(`${API_BASE_URL}/institute/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidate_name: name,
          email,
          phone_no: phone,
          country_code: "+91", // Defaulting as per your backend
          status: placementStatus,
          is_active: isActive,
          qualified: qualified,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Failed to add candidate");
        setIsLoading(false);
        return;
      }

      toast.success("Candidate added successfully!");

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
      <div className="bg-white w-[50%] rounded-2xl relative shadow-xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={22} />
        </button>

        <h1 className="text-xl font-semibold">Manage Candidate</h1>

        {/* Fake fields to trick aggressive browser password managers */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} aria-hidden="true">
          <input type="email" name="fake_email_for_autofill" tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake_password_for_autofill" tabIndex={-1} autoComplete="new-password" />
        </div>

        {/* Name */}
        <div className="mt-6">
          <label className="block font-medium">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Candidate name"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
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
            autoComplete="off"
            readOnly
            onFocus={(e) => e.target.removeAttribute('readonly')}
          />
        </div>

        {/* Phone */}
        <div className="mt-6">
          <label className="block font-medium">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="9876543210"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex gap-8">
          {/* Placement Status */}
          <div className="mt-6 w-full">
            <label className="block font-medium">Placement Status</label>
            <select
              className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
              value={placementStatus}
              onChange={(e) => setPlacementStatus(e.target.value)}
            >
              <option value="Not Placed">Not Placed</option>
              <option value="Placed">Placed</option>
            </select>
          </div>

          {/* Active Toggle */}
          <div className="mt-6 flex flex-col gap-2">
            <label className="block font-medium">Status</label>
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v)}
                className="data-[state=checked]:bg-[#0B5B4D]"
              />
              <span className="text-sm">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Qualified */}
          <div className=" mt-6 flex flex-col gap-2">
            <label className="block font-medium">Qualified</label>
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
            className="px-6 py-2 bg-[#0B5B4D] text-white rounded-md flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Candidate
          </button>
        </div>
      </div>
    </div>
  );
}
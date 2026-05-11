"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditInstituteModal({
  onClose,
  onSuccess,
  institute,
}: {
  onClose: () => void;
  onSuccess?: () => void;
  institute: any;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill form when opening
  useEffect(() => {
    if (institute) {
      setName(institute.name || "");
      setCode(institute.code || "");
      setEmail(institute.email || "");
      setPhone(institute.phone || "");
    }
  }, [institute]);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Institute name is required");
    if (!code.trim()) return toast.error("Institute code is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!phone.trim()) return toast.error("Phone number is required");

    try {
      setIsLoading(true);

      // 🔥 Sample object for update (replace with API later)
      const updatedInstitute = {
        ...institute,
        name,
        code,
        email,
        phone,
        updatedAt: new Date().toISOString(),
      };

      console.log("INSTITUTE UPDATED SAMPLE:", updatedInstitute);

      toast.success("Institute updated successfully!");

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!institute) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <div className="bg-white w-[40%] max-w-[500px] rounded-2xl relative shadow-xl p-8">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={22} />
        </button>

        <h1 className="text-xl font-semibold">Edit Institute</h1>

        {/* Institute Name */}
        <div className="mt-6">
          <label className="block font-medium">
            Institute Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Institute name"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Institute Code */}
        <div className="mt-6">
          <label className="block font-medium">
            Institute Code <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="SX001"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mt-6">
          <label className="block font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="info@institute.com"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div className="mt-6">
          <label className="block font-medium">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="9876543210"
            className="mt-2 w-full border rounded-md px-3 py-3 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
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

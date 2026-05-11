"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

export default function EditMemberModal({
  onClose,
  onSuccess,
  member,
}: {
  onClose: () => void;
  onSuccess?: () => void;
  member: any;
}) {
  const [firstname, setFirstname] = useState(member?.firstname || "");
  const [lastname, setLastname] = useState(member?.lastname || "");
  const [phone, setPhone] = useState(member?.phone_number || "");
  
  const [role, setRole] = useState(member?.role || "Faculty");
  
  const [department_uuid, setDepartmentUuid] = useState(
    member?.department_uuid?._id || member?.department_uuid || ""
  );
  
  const [designation, setDesignation] = useState(member?.designation || "");

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/institute/departments?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.data) {
          setDepartments(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, []);

  const handleUpdate = async () => {
    if (!firstname || !phone) {
      return toast.error("Required fields missing");
    }
    if ((role === "HOD" || role === "Faculty") && !department_uuid) {
      return toast.error("Department is required for this role");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institute/members/${member._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          phone_number: phone,
          role,
          department_uuid: (role === "HOD" || role === "Faculty") ? department_uuid : null,
          designation,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Member Updated Successfully");
      onSuccess?.();
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Member</h2>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-medium text-gray-700">First Name</label>
                <input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="border p-2 rounded w-full mt-1" />
             </div>
             <div>
                <label className="text-xs font-medium text-gray-700">Last Name</label>
                <input value={lastname} onChange={(e) => setLastname(e.target.value)} className="border p-2 rounded w-full mt-1" />
             </div>
          </div>

          <div>
             <label className="text-xs font-medium text-gray-700">Phone</label>
             <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border p-2 rounded w-full mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-medium text-gray-700">Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded w-full mt-1">
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="Institute Admin">Institute Admin</option>
                </select>
             </div>
             <div>
                <label className="text-xs font-medium text-gray-700">Designation</label>
                <input value={designation} onChange={(e) => setDesignation(e.target.value)} className="border p-2 rounded w-full mt-1" />
             </div>
          </div>

          {(role === "HOD" || role === "Faculty") && (
             <div>
                <label className="text-xs font-medium text-gray-700">Department *</label>
                <select value={department_uuid} onChange={(e) => setDepartmentUuid(e.target.value)} className="border p-2 rounded w-full mt-1">
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
             </div>
          )}

          <button onClick={handleUpdate} disabled={loading} className="bg-[#0B5B4D] text-white rounded-md py-2 mt-2">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Update Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
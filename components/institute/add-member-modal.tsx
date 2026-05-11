"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

export default function AddMemberModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [role, setRole] = useState("Faculty"); // Default Role
  const [department_uuid, setDepartmentUuid] = useState("");
  const [designation, setDesignation] = useState("");

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Departments
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
        console.error("Failed to fetch departments", err);
      }
    };
    fetchDepartments();
  }, []);

  const handleSubmit = async () => {
    if (!firstname || !email || !password || !phone) {
      return toast.error("Please fill all required fields");
    }
    // Require Department for HOD and Faculty
    if ((role === "HOD" || role === "Faculty") && !department_uuid) {
      return toast.error("Please select a department");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institute/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          phone_number: phone,
          country_code: "+91",
          password,
          role,
          department_uuid: (role === "HOD" || role === "Faculty") ? department_uuid : null,
          designation,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add member");

      toast.success("Member Added Successfully");
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-[500px] p-6 relative my-10">
        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Add New Member</h2>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-xs font-medium text-gray-700">First Name *</label>
                <input
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                    placeholder="John"
                />
            </div>
            <div>
                <label className="text-xs font-medium text-gray-700">Last Name</label>
                <input
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                    placeholder="Doe"
                />
            </div>
          </div>

          <div>
             <label className="text-xs font-medium text-gray-700">Email *</label>
             <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded w-full mt-1"
                placeholder="john@example.com"
                type="email"
            />
          </div>
          
          <div>
             <label className="text-xs font-medium text-gray-700">Phone *</label>
             <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 rounded w-full mt-1"
                placeholder="9876543210"
            />
          </div>

          <div>
             <label className="text-xs font-medium text-gray-700">Password *</label>
             <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded w-full mt-1"
                type="password"
                placeholder="******"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-medium text-gray-700">Role</label>
                <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                >
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD (Head of Dept)</option>
                    <option value="Institute Admin">Institute Admin</option>
                </select>
             </div>
             
             <div>
                <label className="text-xs font-medium text-gray-700">Designation</label>
                <input
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                    placeholder="Professor"
                />
             </div>
          </div>

          {/* Show Department Select for Faculty & HOD */}
          {(role === "HOD" || role === "Faculty") && (
             <div>
                <label className="text-xs font-medium text-gray-700">Department *</label>
                <select
                    value={department_uuid}
                    onChange={(e) => setDepartmentUuid(e.target.value)}
                    className="border p-2 rounded w-full mt-1"
                >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                            {dept.name}
                        </option>
                    ))}
                </select>
             </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#071526] text-white rounded-md py-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
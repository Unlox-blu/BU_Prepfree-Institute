"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Pencil, Trash2, Copy } from "lucide-react";
import AddMemberModal from "@/components/institute/add-member-modal";
import EditMemberModal from "@/components/institute/edit-member-modal";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<any>(null);

  // Invite Links
  const signupLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link Copied");
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/institute/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      
      if (json.instituteMembers && Array.isArray(json.instituteMembers)) {
        setMembers(json.instituteMembers);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institute/members/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Member deleted");
        fetchMembers();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Error deleting");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 relative font-sans">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#0a0a14]">Institute Members</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#071526] text-white px-6 py-2 rounded-md"
        >
          Add Member
        </button>
      </div>

      {/* INVITE LINKS SECTION */}
      <div className="w-full flex flex-col gap-2 mt-2 mb-8 border-b pb-6">
          <h1 className="font-medium text-md">Invite via link</h1>
          <p className="text-sm text-gray-600">
            Share this link to invite members:
          </p>

          <div className="flex gap-4 items-center">
            <input
              type="text"
              readOnly
              value={signupLink}
              disabled
              className="p-3 w-full bg-white rounded-md border text-sm"
            />
            <button
              onClick={() => copyToClipboard(signupLink)}
              className="py-2 px-3 h-fit rounded-md flex items-center gap-2 text-white bg-[#071526] hover:bg-[#094d41] text-sm font-medium"
            >
              <Copy size={16} />
              Copy
            </button>
          </div>
      </div>

      {/* MEMBERS TABLE */}
      <h2 className="text-lg font-bold text-[#0a0a14] mb-4">All Members</h2>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#071526]" size={32} />
        </div>
      ) : (
        <div className="flex-1">
          <div className="border bg-[#EEF1F8] rounded-lg">
            <div className="grid grid-cols-6 py-3 text-sm font-semibold text-[#0a0a14]">
              <div className="pl-6 text-center">Sr.No</div>
              <div className="text-center col-span-1">Name</div>
              <div className="text-center">Email</div>
              <div className="text-center">Role</div>
              <div className="text-center">Department</div>
              <div className="text-center">Action</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {members.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No members found.</div>
            ) : (
              members.map((m, index) => (
                <div key={m._id} className="grid grid-cols-6 bg-white py-3 rounded-xl border items-center">
                  <div className="pl-6 text-center">{index + 1}</div>
                  <div className="text-center font-medium">{m.firstname} {m.lastname}</div>
                  <div className="text-center text-xs break-all px-2">{m.email}</div>
                  <div className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs 
                        ${m.role === 'HOD' ? 'bg-purple-100 text-purple-700' : 
                          m.role === 'Institute Admin' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'}`}>
                        {m.role}
                    </span>
                  </div>
                  <div className="text-center text-sm">
                    {m.department_uuid?.name || "-"}
                  </div>
                  <div className="flex justify-center gap-3">
                     <Pencil size={16} className="cursor-pointer text-gray-600" onClick={() => setEditMember(m)} />
                     <Trash2 size={16} className="cursor-pointer text-red-600" onClick={() => handleDelete(m._id)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddMemberModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
                setShowAddModal(false);
                fetchMembers();
            }}
        />
      )}

      {editMember && (
        <EditMemberModal
            member={editMember}
            onClose={() => setEditMember(null)}
            onSuccess={() => {
                setEditMember(null);
                fetchMembers();
            }}
        />
      )}
    </div>
  );
}
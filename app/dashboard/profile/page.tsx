"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
  Loader2,
  Save,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL } from "@/lib/config";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone_number: "",
    designation: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institute/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.user) {
        setProfile(json.user);
        setFormData({
          firstname: json.user.firstname || "",
          lastname: json.user.lastname || "",
          phone_number: json.user.phone_number || "",
          designation: json.user.designation || "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/institute/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        fetchProfile();
      } else {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F1F1F1]">
        <Loader2 className="animate-spin text-[#0B5B4D]" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F1F1F1] min-h-screen">
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-500">
            Manage your personal information and account details
          </p>
        </header>

        {/* Profile Summary Card */}
        <Card className="shadow-sm border-none">
          <CardContent className="pt-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-[#EAF6EE] flex items-center justify-center mb-4">
              <User size={40} className="text-[#0B5B4D]" />
            </div>

            <h2 className="text-lg font-bold text-gray-900">
              {profile?.firstname} {profile?.lastname}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {profile?.designation || "No Designation Set"}
            </p>

            <div className="w-full pt-4 border-t space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <ShieldCheck size={14} /> Role
                </span>
                <Badge
                  variant="outline"
                  className="capitalize bg-white text-[#0B5B4D] border-[#0B5B4D]/20"
                >
                  {profile?.role || "Member"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                  <Building2 size={14} /> Dept
                </span>
                <span className="font-medium text-gray-900">
                  {profile?.department_uuid?.name || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle className="text-lg">
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your basic profile details here.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <Input
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstname: e.target.value,
                      })
                    }
                    className="bg-gray-50/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <Input
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastname: e.target.value,
                      })
                    }
                    className="bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    value={profile?.email}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed pl-10"
                  />
                  <Mail
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>
                <p className="text-[11px] text-gray-400 italic">
                  Email cannot be changed by institute members.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone_number: e.target.value,
                      })
                    }
                    className="bg-gray-50/50 pl-10"
                  />
                  <Phone
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Designation
                </label>
                <div className="relative">
                  <Input
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        designation: e.target.value,
                      })
                    }
                    className="bg-gray-50/50 pl-10"
                  />
                  <Briefcase
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0B5B4D] hover:bg-[#084a3e] px-8 py-5 text-white flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

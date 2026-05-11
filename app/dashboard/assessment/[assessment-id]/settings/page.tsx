"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";
import { PageLoader } from "@/components/shared/page-loader";
import SettingsTab from "@/components/assessment/settings-tab";

export default function AssessmentSettingsPage() {
  const params = useParams();
  const id = params?.["assessment-id"] as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/assessments/${id}/details`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          toast.error("Failed to load assessment settings");
          setLoading(false);
          return;
        }
        const json = await res.json();
        setData(json.data || json);
      } catch (err) {
        console.error("Fetch error", err);
        toast.error("Network error loading settings");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <PageLoader />;

  return (
    <div className="w-full min-h-screen bg-[#F1F1F1]">
      <div className="max-w-[1400px] mx-auto px-6 py-8">

        <SettingsTab 
            assessmentId={id} 
            initialData={data} 
            apiBaseUrl={API_BASE_URL}
            onUpdate={(updated: any) => setData((prev: any) => ({ ...prev, ...updated }))} 
        />
      </div>
    </div>
  );
}
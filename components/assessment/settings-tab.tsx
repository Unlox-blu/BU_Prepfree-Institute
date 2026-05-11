"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Users, Globe, Lock } from "lucide-react";
import { AssigneesDrawer } from "./assignees-drawer";
import { Switch } from "@/components/ui/switch";
import { API_BASE_URL } from "@/lib/config";

export default function SettingsTab({ assessmentId, initialData, apiBaseUrl, onUpdate }: any) {
  const router = useRouter();
  const [savingSettings, setSavingSettings] = useState(false);
  const [assignDrawerOpen, setAssignDrawerOpen] = useState(false);

  // Fallback to config if prop is missing
  const effectiveApiUrl = apiBaseUrl || API_BASE_URL;

  // Determine if assessment was already live when loaded
  const isAlreadyPublished = initialData?.is_live || initialData?.is_public; 

  // Form State
  const [formData, setFormData] = useState({
    testName: "",
    durationHours: "" as number | "",
    durationMinutes: "" as number | "",
    attempts: 1 as number,
    publishOn: "",
    expiresOn: "",
    publishNow: false,
    expiresNever: false,
    lockPassword: "",
    trending: false,
    isLive: false,
    accessType: "public" as "public" | "private", 
  });

  const [originalAttempts, setOriginalAttempts] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialData) {
      const currentAttempts = initialData.max_attempts || initialData.attempts || 1;
      setOriginalAttempts(currentAttempts);

      setFormData({
        testName: initialData.test_name || "",
        durationHours: initialData.duration_hours ?? "",
        durationMinutes: initialData.duration_minutes ?? "",
        attempts: currentAttempts,
        publishOn: initialData.publish_on ? new Date(initialData.publish_on).toISOString().split("T")[0] : "",
        expiresOn: initialData.expires_on ? new Date(initialData.expires_on).toISOString().split("T")[0] : "",
        publishNow: Boolean(initialData.is_live),
        expiresNever: Boolean(initialData.expires_never),
        lockPassword: initialData.lock_password || "",
        trending: Boolean(initialData.trending),
        isLive: Boolean(initialData.is_live),
        accessType: initialData.is_public ? "public" : "private",
      });
      if (initialData.assigned_users) {
        setSelectedUserIds(new Set(initialData.assigned_users));
      }
    }
  }, [initialData]);

  const handleChange = (key: string, value: any) => {
    if (key === "isLive" && value === false) {
        setFormData((prev) => ({ ...prev, [key]: value, trending: false }));
    } else {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handlePublishNowChange = (checked: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    setFormData((prev) => ({
      ...prev,
      publishNow: checked,
      publishOn: checked ? today : prev.publishOn,
      isLive: checked, 
      trending: checked ? prev.trending : false
    }));
  };

  const handleExpiresNeverChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      expiresNever: checked,
      expiresOn: checked ? "" : prev.expiresOn,
    }));
  };

  const handleSave = async (opts?: { publish?: boolean }) => {
    if (!formData.testName.trim()) return toast.error("Assessment Name is required");

    const totalDuration = (Number(formData.durationHours) || 0) * 60 + (Number(formData.durationMinutes) || 0);
    if (totalDuration === 0) {
        toast.error("Duration cannot be 0 minutes.");
        return;
    }

    try {
      setSavingSettings(true);
      const token = localStorage.getItem("token");
      
      const body = {
        id: assessmentId,
        test_name: formData.testName,
        duration_hours: Number(formData.durationHours) || 0,
        duration_minutes: Number(formData.durationMinutes) || 0,
        max_attempts: Number(formData.attempts) || 1,
        publish_on: formData.publishNow ? new Date().toISOString() : (formData.publishOn || null),
        expires_on: formData.expiresNever ? null : (formData.expiresOn || null),
        publish_now: Boolean(formData.publishNow),
        expires_never: Boolean(formData.expiresNever),
        lock_password: formData.lockPassword || null,
        trending: Boolean(formData.trending),
        is_live: Boolean(formData.isLive), 
        is_public: formData.accessType === "public",
        publish: opts?.publish !== undefined ? opts.publish : undefined,
      };

      // Save Settings
      await fetch(`${effectiveApiUrl}/assessments/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      // Prepare Assignees List
      const finalAssignees = formData.accessType === "public" 
        ? [] 
        : Array.from(selectedUserIds);

      // Save Assignments
      await fetch(`${effectiveApiUrl}/assessments/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assessment_id: assessmentId,
          assigned_users: finalAssignees,
          assigned_institutes_ids: [],
          replace_list: true 
        }),
      });

      toast.success(opts?.publish ? "Published successfully" : "Settings saved");
      if(onUpdate) onUpdate(body);

      // Only redirect if it was a Publish action
      if (opts?.publish) {
         router.push("/dashboard/assessment");
      }

    } catch (err: any) {
      toast.error(err.message || "Error saving");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex gap-8 items-start relative mt-6">
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Main Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assessment Settings</h2>
          </div>

          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-4">
              <div>
                <label className="block text-sm font-medium">Assessment Name<span className="text-red-500">*</span></label>
                <input value={formData.testName} onChange={(e) => handleChange("testName", e.target.value)} className="mt-2 w-full border rounded-md p-3 text-sm" placeholder="Type Here" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Duration<span className="text-red-500">*</span></label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 flex-1">
                        <input 
                            type="number" 
                            value={formData.durationHours} 
                            onChange={(e) => handleChange("durationHours", e.target.value)} 
                            placeholder="0" 
                            className="w-full border rounded-md p-3 text-sm" 
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Hours</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        <input 
                            type="number" 
                            value={formData.durationMinutes} 
                            onChange={(e) => handleChange("durationMinutes", e.target.value)} 
                            placeholder="0" 
                            className="w-full border rounded-md p-3 text-sm" 
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">Mins</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium">Attempts</label>
                  <select 
                    value={formData.attempts} 
                    onChange={(e) => handleChange("attempts", e.target.value)} 
                    className="mt-2 w-full border rounded-md p-3 text-sm bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                        <option 
                          key={num} 
                          value={num}
                          disabled={isAlreadyPublished && num < originalAttempts}
                          className={isAlreadyPublished && num < originalAttempts ? "text-gray-400" : ""}
                        >
                          {num}
                        </option>
                    ))}
                  </select>
                  {isAlreadyPublished && (
                      <p className="text-[10px] text-gray-500 mt-1 italic">
                          (Attempts can only be increased for published assessments)
                      </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Publish On</label>
                  <input 
                    type="date" 
                    value={formData.publishOn} 
                    disabled={formData.publishNow || isAlreadyPublished} 
                    onChange={(e) => handleChange("publishOn", e.target.value)} 
                    className="mt-2 w-full border rounded-md p-3 text-sm disabled:bg-gray-100 disabled:text-gray-500" 
                  />
                  
                  {!isAlreadyPublished && (
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            checked={formData.publishNow} 
                            onChange={(e) => handlePublishNowChange(e.target.checked)} 
                            id="pubNow" 
                            className="h-4 w-4 rounded border-gray-300 text-[#071526] focus:ring-[#071526]"
                        />
                        <label htmlFor="pubNow" className="text-sm select-none cursor-pointer">Publish Now</label>
                      </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium">Expires On</label>
                  <input 
                    type="date" 
                    value={formData.expiresOn} 
                    disabled={formData.expiresNever} 
                    onChange={(e) => handleChange("expiresOn", e.target.value)} 
                    className="mt-2 w-full border rounded-md p-3 text-sm disabled:bg-gray-100 disabled:text-gray-400" 
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                        type="checkbox" 
                        checked={formData.expiresNever} 
                        onChange={(e) => handleExpiresNeverChange(e.target.checked)} 
                        id="expNever" 
                        className="h-4 w-4 rounded border-gray-300 text-[#071526] focus:ring-[#071526]"
                    />
                    <label htmlFor="expNever" className="text-sm select-none cursor-pointer">Never Expire</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Lock Password</label>
                <input value={formData.lockPassword} onChange={(e) => handleChange("lockPassword", e.target.value)} className="mt-2 w-full border rounded-md p-3 text-sm" placeholder="Optional password protection" />
              </div>
            </div>

            {/* Manage Access Section */}
            <div className="col-span-12 mt-6">
              <div className="border rounded-lg p-6 bg-white space-y-6">
                
                {/* Header */}
                <div>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-gray-500"/> Manage Access
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Control who can see and attempt this assessment.
                  </div>
                </div>

                {/* Access Selection */}
                <div className="flex gap-4">
                    {/* Option 1: Public */}
                    <div 
                        onClick={() => handleChange("accessType", "public")}
                        className={`flex-1 flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.accessType === 'public' 
                            ? 'bg-[#EEF1F8] border-[#071526] ring-1 ring-[#071526]' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className={`mt-1 p-1 rounded-full ${formData.accessType === 'public' ? 'bg-[#071526] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Globe size={16} />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 text-sm">Public Access</div>
                            <div className="text-xs text-gray-500 mt-1">Visible to all students in the institute.</div>
                        </div>
                    </div>

                    {/* Option 2: Private */}
                    <div 
                        onClick={() => handleChange("accessType", "private")}
                        className={`flex-1 flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            formData.accessType === 'private' 
                            ? 'bg-[#EEF1F8] border-[#071526] ring-1 ring-[#071526]' 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className={`mt-1 p-1 rounded-full ${formData.accessType === 'private' ? 'bg-[#071526] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Lock size={16} />
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 text-sm">Specific Assignees</div>
                            <div className="text-xs text-gray-500 mt-1">Visible only to selected candidates.</div>
                        </div>
                    </div>
                </div>

                {/* Conditional Assignee List */}
                {formData.accessType === "private" && (
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div>
                            <div className="font-medium text-gray-900 text-sm">Selected Candidates</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {selectedUserIds.size === 0 
                                    ? "No candidates assigned yet." 
                                    : `${selectedUserIds.size} candidates assigned.`
                                }
                            </div>
                        </div>
                        <button 
                            onClick={() => setAssignDrawerOpen(true)} 
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors shadow-sm font-medium"
                        >
                            {selectedUserIds.size > 0 ? "Modify List" : "Select Candidates"}
                        </button>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pb-8">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="flex items-center gap-6">
                
                {/* Live Toggle */}
                <div className="flex items-center gap-2 border-r pr-6 mr-2">
                    <label htmlFor="live-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">Live</label>
                    <Switch
                        id="live-toggle"
                        checked={formData.isLive}
                        onCheckedChange={(checked) => handleChange("isLive", checked)}
                        className="data-[state=checked]:bg-[#071526]"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label 
                        htmlFor="trending-check" 
                        className={`text-sm font-medium cursor-pointer ${!formData.isLive ? "text-gray-400" : "text-gray-700"}`}
                    >
                        Mark as Trending
                    </label>
                    <input 
                        id="trending-check"
                        type="checkbox" 
                        checked={formData.trending} 
                        disabled={!formData.isLive} // Disabled if Live is off
                        onChange={(e) => handleChange("trending", e.target.checked)} 
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#071526] focus:ring-[#071526] disabled:opacity-50" 
                    />
                </div>

                <div className="flex gap-3">
                    {/* Render specific buttons based on published status */}
                    {isAlreadyPublished ? (
                        <button 
                            onClick={() => handleSave()} 
                            disabled={savingSettings} 
                            className="px-6 py-2 bg-[#071526] text-white rounded-md text-sm font-medium hover:bg-[#094d41]"
                        >
                            {savingSettings ? "Saving..." : "Save Settings"}
                        </button>
                    ) : (
                        <>
                            <button onClick={() => handleSave({ publish: false })} disabled={savingSettings} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 bg-white">
                                {savingSettings ? "Saving..." : "Save Draft"}
                            </button>
                            <button onClick={() => handleSave({ publish: true })} disabled={savingSettings} className="px-4 py-2 bg-[#071526] text-white rounded-md text-sm font-medium hover:bg-[#094d41]">
                                {savingSettings ? "Publishing..." : "Publish"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>

      <aside className="w-[300px]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
           <div className="text-gray-800 font-medium">Summary</div>
           
           <div className="mt-4 flex justify-between text-sm">
               <span className="text-gray-500">Access Type</span>
               <span className={`font-medium ${formData.accessType === 'public' ? 'text-green-600' : 'text-orange-600'}`}>
                   {formData.accessType === 'public' ? 'Public' : 'Private'}
               </span>
           </div>

           <div className="mt-2 text-sm text-gray-500">Category: {initialData?.category || initialData?.test_categories?.join(", ") || "—"}</div>
           <div className="mt-2 text-sm text-gray-500">Questions: {initialData?.total_questions ?? 0}</div>
           
           <div className="mt-6 text-sm text-gray-500">Breakdown</div>
           {initialData?.counts_by_difficulty && Object.entries(initialData.counts_by_difficulty).map(([k, v]) => (
                <div key={k} className="text-sm text-gray-800 mt-1 capitalize">{k}: {v as number}</div>
           ))}
        </div>
      </aside>

      {assignDrawerOpen && (
        <AssigneesDrawer
          isOpen={assignDrawerOpen}
          onClose={() => setAssignDrawerOpen(false)}
          selectedIds={Array.from(selectedUserIds)}
          onAssign={(ids) => setSelectedUserIds(new Set(ids))}
          apiBaseUrl={effectiveApiUrl}
        />
      )}
    </div>
  );
}
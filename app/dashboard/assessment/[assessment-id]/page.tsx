"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

// --- Components ---
import PerformanceTab from "@/components/assessment/performance-tab";
import QuestionsTab from "@/components/assessment/questions-tab";
import SettingsTab from "@/components/assessment/settings-tab";
import { PageLoader } from "@/components/shared/page-loader";

// --- UI & Charts ---
import { Pie, PieChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; 

export default function PerformancePage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params["assessment-id"] as string;
  
  const [activeTab, setActiveTab] = useState("performance");
  const [loading, setLoading] = useState(true);
  
  const [assessmentDetails, setAssessmentDetails] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterAttempts, setFilterAttempts] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Assessment Details
        const detailsRes = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, { headers });
        const detailsJson = await detailsRes.json();
        
        if (detailsJson.success) {
            const data = detailsJson.assessment || detailsJson.data;
            const totalMins = data.total_test_time || 0;
            const mappedDetails = {
                ...data,
                duration_hours: Math.floor(totalMins / 60),
                duration_minutes: totalMins % 60,
                max_attempts: data.max_attempts || 1
            };
            setAssessmentDetails(mappedDetails);
        }

        // 2. Fetch Candidates with Filters
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            status: filterStatus,
        });
        if(filterAttempts) queryParams.append('attempts', filterAttempts);

        const usersRes = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/participants?${queryParams}`, { headers });
        const usersJson = await usersRes.json();
        
        if (usersJson.success) {
          const users = usersJson.users || usersJson.data || [];
          setCandidates(users);
          setTotalCandidates(usersJson.pagination?.total || users.length);
          
          // Update total_test_time from participant response if available to ensure sync
          if (usersJson.total_test_time) {
              setAssessmentDetails((prev: any) => ({ ...prev, total_test_time: usersJson.total_test_time }));
          }

          let low = 0, mid = 0, high = 0;
          users.forEach((u: any) => {
            if(u.last_score !== null) {
               const score = parseFloat(u.last_score) || 0; 
               if (score <= 30) low++;
               else if (score <= 60) mid++;
               else high++;
            }
          });

          setScoreDistribution([
            { label: "0-30", visitors: low, fill: "#FF672E" },   
            { label: "31-60", visitors: mid, fill: "#FFE176" },  
            { label: "61-100", visitors: high, fill: "#94D75B" },
          ]);
        }

        // 3. Fetch Analytics for Chart
        const perfRes = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/performance`, { headers });
        const perfJson = await perfRes.json();
        if (perfJson.success) {
            setChartData(perfJson.data || []);
        }

      } catch (err) {
        console.error("Error fetching data", err);
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) fetchData();
  }, [assessmentId, page, limit, filterStatus, filterAttempts]);

  const handleViewReport = (candidate: any) => {
    const status = (candidate.status || '').toLowerCase();
    
    // Check for 'started' OR 'ongoing' (also 'resumed' as it implies ongoing)
    if (status === 'started' || status === 'ongoing' || status === 'resumed') {
        const startTime = new Date(candidate.submitted_at).getTime();
        const durationMinutes = assessmentDetails?.total_test_time || 0;
        const durationMs = durationMinutes * 60 * 1000;
        const endTime = startTime + durationMs;
        const timeLeftMs = Math.max(0, endTime - Date.now());

        const minutes = Math.floor(timeLeftMs / 60000);
        const seconds = Math.floor((timeLeftMs % 60000) / 1000);

        toast.warning(`Test is ongoing. Report will be generated once the assessment completed. Estimated Assessment time left: ${minutes}m ${seconds}s`);
        return;
    }

    if(candidate.attempts_taken === 0) {
        toast.info("Candidate has not attempted the test yet.");
        return;
    }
    
    router.push(`/dashboard/assessment/${assessmentId}/${candidate._id}`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="w-full min-h-screen p-6 bg-[#F8F9FA] pb-24"> 
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Performance</h1>
          <p className="text-gray-500 text-sm">Detailed analysis and candidate results</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="w-full flex flex-col lg:flex-row gap-6 mb-10">
        {/* Assessment Card */}
        <div className="w-full lg:w-[60%] p-6 flex flex-col gap-4 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div>
              <h1 className="text-xl font-bold text-gray-900">{assessmentDetails?.test_name || "Assessment"}</h1>
              <p className="text-gray-400 text-sm mt-1">{assessmentDetails?.category || "Practice Assessment"}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-[#E0FFE8] text-[#0B5B4D] border-[#0B5B4D]/10 px-3 py-1">Domain Based</Badge>
            <div className="border border-gray-100 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 text-gray-600 bg-gray-50/50">
              <Clock size={14} className="text-[#0B5B4D]"/> {assessmentDetails?.total_test_time || 0} mins
            </div>
            <div className="border border-gray-200 text-xs px-3 py-1.5 rounded-full text-gray-600 bg-gray-50/50">
              Questions: {assessmentDetails?.total_questions || assessmentDetails?.mcqs?.length || 0} 
            </div>
          </div>
          <div className="border-t border-gray-100 mt-auto pt-4 flex gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <p className="text-gray-500"><span className="text-gray-900 font-medium">{totalCandidates}</span> Candidates</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <p className="text-gray-500"><span className="text-gray-900 font-medium">{assessmentDetails?.is_live ? "Active" : "Draft"}</span> Status</p>
            </div>
          </div>
        </div>

        {/* Score Distribution Card */}
        <div className="w-full lg:w-[40%] p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h1 className="font-semibold text-gray-900 mb-4">Score Distribution</h1>
          <div className="flex items-center justify-between h-full">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center text-xs font-medium text-gray-600">
                <div className="w-3 h-3 bg-[#FF672E] rounded-sm"></div> 0-30 (Low)
              </div>
              <div className="flex gap-2 items-center text-xs font-medium text-gray-600">
                <div className="w-3 h-3 bg-[#FFE176] rounded-sm"></div> 31-60 (Mid)
              </div>
              <div className="flex gap-2 items-center text-xs font-medium text-gray-600">
                <div className="w-3 h-3 bg-[#94D75B] rounded-sm"></div> 61-100 (High)
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <ChartPieDonut data={scoreDistribution} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl w-fit mb-8 overflow-hidden border border-gray-200 bg-white shadow-sm">
        {[{ id: "performance", label: "Performance" }, { id: "questions", label: "Questions" }, { id: "settings", label: "Settings" }].map((tab, idx) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-10 py-3.5 cursor-pointer transition-all text-sm font-semibold
              ${activeTab === tab.id ? "bg-[#FFDC85] text-gray-900" : "bg-white text-gray-500 hover:bg-gray-50"}
              ${idx !== 2 ? "border-r border-gray-200" : ""}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "performance" && (
          <PerformanceTab 
            candidates={candidates} 
            chartData={chartData} 
            onReportView={handleViewReport} 
            pagination={{
                page, limit, total: totalCandidates, 
                onPageChange: setPage, 
                onLimitChange: setLimit
            }}
            filters={{
                status: filterStatus,
                attempts: filterAttempts,
                onStatusChange: setFilterStatus,
                onAttemptsChange: setFilterAttempts
            }}
          />
        )}

        {activeTab === "questions" && (
          <QuestionsTab questions={assessmentDetails?.mcqs || []} />
        )}

        {activeTab === "settings" && (
          <SettingsTab 
            assessmentId={assessmentId} 
            initialData={assessmentDetails} 
            apiBaseUrl={API_BASE_URL}
            onUpdate={(updated: any) => setAssessmentDetails((prev: any) => ({ ...prev, ...updated }))} 
          />
        )}
      </div>
    </div>
  );
}

function ChartPieDonut({ data }: { data: any[] }) {
  const config = { visitors: { label: "Candidates" } } satisfies ChartConfig;
  return (
    <div className="w-[140px] h-[140px]">
      <ChartContainer config={config} className="w-full h-full">
        <PieChart>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="visitors" nameKey="label" innerRadius={35} outerRadius={60} paddingAngle={5} cornerRadius={4} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
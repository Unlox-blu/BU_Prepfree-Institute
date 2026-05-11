"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/config";
import { Loader2, ArrowLeft, FileText, Mic, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interfaces
interface Assessment {
  id: string;
  title: string;
  domain: string;
  score: string;
  percentage: number;
  status: string;
  date: string;
}

interface MockInterview {
  id: string;
  role: string;
  score: string;
  status: string;
  date: string;
}

interface Stats {
  taken: number;
  total: number;
  attemptRate: number;
  avgScore: number;
  highest: number;
  lowest: number;
}

export default function ClientCode() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [stats, setStats] = useState<{ assessment: Stats; interview: Stats } | null>(null);
  const [loading, setLoading] = useState(true);

  // Assessment Columns
  const assessmentColumns: ColumnDef<Assessment>[] = [
    {
      accessorKey: "title",
      header: "Assessment Name",
      cell: ({ row }) => <span className="font-medium text-[#0a0a14]">{row.getValue("title")}</span>,
    },
    {
      accessorKey: "domain",
      header: "Domain",
    },
    {
      accessorKey: "score",
      header: "Score",
    },
    {
      accessorKey: "percentage",
      header: "Percentage",
      cell: ({ row }) => (
        <span
          className={`font-semibold ${row.original.percentage >= 50 ? "text-green-600" : "text-red-600"
            }`}
        >
          {row.getValue("percentage")}%
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 capitalize">{String(row.getValue("status"))}</Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Attempted On",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
  ];

  // Interview Columns
  const interviewColumns: ColumnDef<MockInterview>[] = [
    {
      accessorKey: "role",
      header: "Job Role",
      cell: ({ row }) => <span className="font-medium text-[#0a0a14]">{row.getValue("role")}</span>,
    },
    {
      accessorKey: "score",
      header: "Overall Score",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("score")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 capitalize">{String(row.getValue("status"))}</Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Conducted On",
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      id: "action",
      cell: ({ row }) => (
        <Button variant="link" className="text-[#071526] h-auto p-0" onClick={() => window.open(`/dashboard/mock-interview/${id}/${row.original.id}`, '_blank')}>
          View Report
        </Button>
      )
    }
  ];

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/institute/users/${id}/scorecard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setAssessments(json.assessments || []);
          setInterviews(json.mockInterviews || []);
          setStats(json.stats || null);
        }
      } catch (error) {
        console.log("ERROR:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-[70vh]"><Loader2 className="animate-spin text-[#071526]" size={40} /></div>;

  return (
    <main className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-white border-gray-200">
          <ArrowLeft size={18} className="text-gray-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scoreboard</h1>
          <p className="text-sm text-gray-500">Comprehensive view of assessments and interview performance.</p>
        </div>
      </div>

      {/* ASSESSMENTS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <div className="p-1.5 bg-green-100 rounded-lg text-green-700"><FileText size={20} /></div>
            Assessments
          </div>
          {/* Counts Line */}
          <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md border shadow-sm">
            Total assessments taken: <span className="text-[#071526] font-bold">{stats?.assessment.taken || 0}/{stats?.assessment.total || 0}</span>
          </div>
        </div>

        {/* Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Attempt Rate</CardTitle>
              <Activity className="h-4 w-4 text-[#071526]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.assessment.attemptRate || 0}%</div>
              <p className="text-xs text-gray-500">of assigned tests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Score</CardTitle>
              <Target className="h-4 w-4 text-[#071526]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.assessment.avgScore || 0}%</div>
              <p className="text-xs text-gray-500">Average percentage</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Highest Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.assessment.highest || 0}%</div>
              <p className="text-xs text-gray-500">Best performance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lowest Score</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.assessment.lowest || 0}%</div>
              <p className="text-xs text-gray-500">Needs improvement</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {assessments.length > 0 ? <DataTable columns={assessmentColumns} data={assessments} pageSize={5} /> : <div className="text-center py-8 text-gray-500 text-sm">No assessments recorded.</div>}
        </div>
      </div>

      {/* MOCK INTERVIEWS */}
      <div className="space-y-4 pt-4 border-t border-dashed">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700"><Mic size={20} /></div>
            AI Mock Interviews
          </div>
          {/* Counts Line */}
          <div className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md border shadow-sm">
            Total interviews taken: <span className="text-blue-600 font-bold">{stats?.interview.taken || 0}/{stats?.interview.total || 0}</span>
          </div>
        </div>

        {/* Interview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.interview.attemptRate || 0}%</div>
              <p className="text-xs text-gray-500">Sessions completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Score</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.interview.avgScore || 0}/10</div>
              <p className="text-xs text-gray-500">Average rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Highest Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.interview.highest || 0}/10</div>
              <p className="text-xs text-gray-500">Best performance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Lowest Score</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.interview.lowest || 0}/10</div>
              <p className="text-xs text-gray-500">Needs improvement</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {interviews.length > 0 ? <DataTable columns={interviewColumns} data={interviews} pageSize={5} /> : <div className="text-center py-8 text-gray-500 text-sm">No mock interviews recorded.</div>}
        </div>
      </div>
    </main>
  );
}
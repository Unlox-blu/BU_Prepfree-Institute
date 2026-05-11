"use client";

import React from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import { format } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  timeTaken: { label: "Time Taken (s)", color: "#0B5B4D" },
};

const CustomBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    return (
      <g>
        <defs>
          <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#066841" stopOpacity={1} />
            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF672E" stopOpacity={1} />
            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={1} />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={width} height={height} fill={fill} rx={6} ry={6} />
      </g>
    );
};

export default function PerformanceTab({ 
    candidates, 
    chartData, 
    onReportView,
    pagination,
    filters 
}: { 
    candidates: any[], 
    chartData: any[], 
    onReportView: (c: any) => void,
    pagination: { page: number, limit: number, total: number, onPageChange: (p: number) => void, onLimitChange: (l: number) => void },
    filters: { status: string, attempts: string, onStatusChange: (v: string) => void, onAttemptsChange: (v: string) => void }
}) {
  
  const formattedChartData = chartData.map((d, i) => ({
      ...d,
      name: `${i + 1}Q`,
      value: d.timeTaken || 0, 
      isPositive: (d.accuracy || 0) >= 50
  }));

  return (
    <div className="flex flex-col gap-6">
      
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Average Time Taken Per Question (Seconds)</h3>
        <div className="w-full h-[300px]">
           <ChartContainer config={chartConfig} className="w-full h-full">
             <BarChart accessibilityLayer data={formattedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tickLine={false} tickMargin={10} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <ChartTooltip cursor={{fill: '#F3F4F6'}} content={<ChartTooltipContent hideLabel />} />
                
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40} shape={<CustomBar />}>
                  {formattedChartData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={entry.isPositive ? "url(#greenGradient)" : "url(#orangeGradient)"} 
                    />
                  ))}
                </Bar>
             </BarChart>
           </ChartContainer>
        </div>
      </div>
      
      {/* List Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[500px]">
        
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-lg font-semibold text-gray-900">Candidate Performance</h1>
          
          <div className="flex flex-wrap gap-3 items-center">
             <Select value={filters?.status || "all"} onValueChange={filters?.onStatusChange}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Candidates</SelectItem>
                    <SelectItem value="attempted">Attempted</SelectItem>
                    <SelectItem value="not_attempted">Not Attempted</SelectItem>
                </SelectContent>
             </Select>

             <Input 
                type="number" 
                placeholder="Attempt #" 
                className="w-[100px] h-9 text-xs"
                value={filters?.attempts || ""}
                onChange={(e) => filters?.onAttemptsChange(e.target.value)}
             />

             <button className="px-3 py-2 flex items-center gap-2 text-white bg-[#0B5B4D] hover:bg-[#094d41] rounded-lg text-sm font-medium transition-all shadow-sm">
                <Download size={16}/> Export
             </button>
          </div>
        </div>
        
        {/* Table Content */}
        <div className="w-full flex flex-col gap-2 min-w-[800px] overflow-x-auto">
            {/* Header (Status Column Added) */}
            <div className="w-full h-12 bg-[#F9FAFB] border-b border-gray-200 rounded-t-lg grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr_1fr] items-center px-4 gap-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Name</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Attempt no.</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Type</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Overall %</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Score</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Date</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</div>
            </div>

            {/* Rows (Status Column Added) */}
            {candidates.length > 0 ? (
                candidates.map((candidate, idx) => (
                    <div key={idx} className="w-full h-14 bg-white border-b border-gray-100 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1.5fr_1fr] items-center px-4 gap-2 hover:bg-gray-50 transition-colors">
                        <div className="text-sm font-medium text-gray-900 truncate pr-2">{candidate.name}</div>
                        <div className="text-sm text-gray-600 text-center">{candidate.attempts_taken || 0}</div>
                        <div className="text-sm text-gray-600 text-center">Assignment</div>
                        
                        {/* Status Badge */}
                        <div className="text-center flex justify-center">
                            <Badge variant="outline" className={`
                                ${candidate.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  ['Started', 'Ongoing', 'Resumed', 'started', 'ongoing'].includes(candidate.status) ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                  'bg-gray-100 text-gray-600'}
                            `}>
                                {candidate.status || 'Not Started'}
                            </Badge>
                        </div>

                        <div className="text-sm text-gray-600 text-center font-medium">
                            {candidate.latest_percentage ? `${candidate.latest_percentage}%` : "-"}
                        </div>
                        <div className="text-sm text-gray-600 text-center">
                            {candidate.last_score !== null ? candidate.last_score : "-"}
                        </div>
                        <div className="text-sm text-gray-600 text-center">
                            {candidate.submitted_at ? format(new Date(candidate.submitted_at), "dd/MM/yy") : "-"}
                        </div>
                        <div className="text-right">
                            <button 
                                onClick={() => onReportView(candidate)}
                                className="text-[#0B5B4D] hover:text-[#094d41] text-sm font-medium underline"
                            >
                                View Report
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="w-full h-32 flex items-center justify-center text-gray-400 text-sm border-t border-gray-100">
                    No candidates found.
                </div>
            )}
        </div>

        {/* Pagination Controls */}
        {pagination && (
            <div className="flex items-center justify-end gap-4 mt-6 border-t pt-4">
                <span className="text-xs text-gray-500">
                    Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <div className="flex gap-2">
                    <button 
                        disabled={pagination.page <= 1}
                        onClick={() => pagination.onPageChange(pagination.page - 1)}
                        className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        disabled={pagination.page * pagination.limit >= pagination.total}
                        onClick={() => pagination.onPageChange(pagination.page + 1)}
                        className="p-2 rounded-md border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
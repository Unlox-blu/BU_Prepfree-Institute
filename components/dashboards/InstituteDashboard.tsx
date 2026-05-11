"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, BriefcaseBusiness, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  XAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Link from "next/link";
import OnboardingScreen from "@/components/institute/OnboardingScreen";
import ActiveStudent from "@/components/institute/ActiveStudent";
import AssementsSection from "@/components/institute/AssementsSection";
import DeptSection from "@/components/institute/DeptSection";
import Image from "next/image";

/* Tool Tips Hover */

const JobsHoverTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const { month, desktop } = payload[0].payload;

  return (
    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm z-50">
      <p className="text-[11px] text-gray-500">{month}</p>
      <p className="text-[11px] text-gray-500">Total Jobs Posted</p>
      <p className="text-lg font-semibold text-[#071526]">{desktop}</p>
    </div>
  );
};

const PlacementHoverTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const { month, desktop } = payload[0].payload;

  return (
    <div className="bg-white border rounded-lg px-3 py-2 shadow-sm z-50">
      <p className="text-[11px] text-gray-500">{month}</p>
      <p className="text-[11px] text-gray-500">Total Candidates Placed</p>
      <p className="text-lg font-semibold text-[#C39520]">{desktop}</p>
    </div>
  );
};

/* Types and Component */

interface DashboardData {
  score: number; 
  score1: number;
  score2: number; 
  score3: number; 

  counts?: {
      onboarded: number;
      active: number;
      assessments: number;
      departments: number;
  };

  onboardedUsers: any[]; 
  activeUsers: any[];
  activeAssessments: any[];
  departmentList: any[];

  completionData: { range: string; value: number }[];
  placement: {
    id: string;
    name: string;
    role: string;
    instituteDepartment: string;
    status: string;
  }[];
  jobs: {
    id: string;
    name: string;
    role: string;
    salary: string;
    location: string;
    status: string;
    date: string;
    logo?: string | null;
  }[];
  deptData: { dept: string; placed: number; fill: string }[];
  chartData: { month: string; desktop: number }[];
  chartData2: { month: string; desktop: number }[];
}

const InstituteDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination States for all 4 sections
  const [onboardedPage, setOnboardedPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [assessmentPage, setAssessmentPage] = useState(1);
  const [deptPage, setDeptPage] = useState(1);

  // Pagination state for Placement Report
  const [placementPage, setPlacementPage] = useState(1);
  const PLACEMENT_PAGE_SIZE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:1995';

        // Send all page params to backend
        const queryParams = new URLSearchParams({
            onboardedPage: onboardedPage.toString(),
            activePage: activePage.toString(),
            assessmentPage: assessmentPage.toString(),
            deptPage: deptPage.toString()
        });

        const res = await fetch(`${backendUrl}/api/v1/dashboard/institute?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        
        if (json.success) {
          setData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [onboardedPage, activePage, assessmentPage, deptPage]); // Re-fetch when any page changes

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="flex h-screen w-full items-center justify-center">Failed to load data.</div>;
  }

  // Calculate paginated placement data
  const placementList = data.placement || [];
  const placementTotalPages = Math.max(1, Math.ceil(placementList.length / PLACEMENT_PAGE_SIZE));
  const paginatedPlacement = placementList.slice(
    (placementPage - 1) * PLACEMENT_PAGE_SIZE,
    placementPage * PLACEMENT_PAGE_SIZE
  );

  // Pagination Renderer
  const renderPagination = (current: number, total: number, setPage: (p: number) => void) => {
    const pages = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push("...");
        pages.push(total);
      } else if (current >= total - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = total - 2; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(current - 1);
        pages.push(current);
        pages.push(current + 1);
        pages.push("...");
        pages.push(total);
      }
    }

    return (
      <div className="flex items-center gap-2">
        <button
            onClick={() => setPage(Math.max(1, current - 1))}
            disabled={current === 1}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <ChevronLeft size={16} className="text-gray-600" />
        </button>
        {pages.map((p, idx) => (
            typeof p === 'number' ? (
                 <button
                    key={idx}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${
                        current === p 
                        ? "bg-[#071526] text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    {p}
                </button>
            ) : (
                <span key={idx} className="text-gray-400 text-xs px-1">...</span>
            )
        ))}
        <button
            onClick={() => setPage(Math.min(total, current + 1))}
            disabled={current === total}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>
    );
  };

  return (
    <main className="w-full h-full flex flex-col gap-4">
      <DashboardCards
        score={data.score}
        score1={data.score1}
        score2={data.score2}
        score3={data.score3}
        onboardedUsers={data.onboardedUsers}
        activeUsers={data.activeUsers}
        activeAssessments={data.activeAssessments}
        departmentList={data.departmentList}
        
        // Passing Pagination Props
        counts={data.counts}
        pages={{
            onboarded: onboardedPage,
            active: activePage,
            assessment: assessmentPage,
            dept: deptPage
        }}
        setPages={{
            onboarded: setOnboardedPage,
            active: setActivePage,
            assessment: setAssessmentPage,
            dept: setDeptPage
        }}
      />

      <section className="w-full flex h-auto gap-4 items-stretch">
        {/* Active Jobs Section */}
        <Card className="w-[40%] flex flex-col bg-white h-auto">
          <CardHeader>
            <CardDescription className="font-medium text-black w-full">
              <div className="flex flex-col gap-1">
                <h1 className="text-sm text-black/70">Active Jobs</h1>
                <h1 className="text-2xl font-medium">
                  {data.jobs?.length || 0} <span className="text-sm text-black/70">Jobs</span>
                </h1>
              </div>
            </CardDescription>
            <CardAction>
              <Link href="/dashboard/marketplace-jobs">
                <div className="border border-black rounded-full p-2 hover:bg-gray-100 cursor-pointer transition-colors">
                    <ArrowUpRight size={28} />
                </div>
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="w-full flex-1">
            <div className="flex flex-col gap-1 w-full max-h-[350px] overflow-y-auto pr-2">
              {data.jobs && data.jobs.length > 0 ? (
                data.jobs.slice(0, 3).map((job, idx) => (
                  <div key={`job-card-${job.id}-${idx}`} className="flex items-center justify-between w-full border-b border-gray-100 py-4 hover:bg-gray-50 transition-colors px-2 rounded-lg">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-[#EEF1F8] flex items-center justify-center overflow-hidden border border-gray-100 relative min-w-[40px]">
                          {job.logo ? (
                            <Image 
                              src={job.logo} 
                              alt={job.name} 
                              width={40} 
                              height={40} 
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <BriefcaseBusiness size={18} className="text-[#314370]" />
                          )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h1 className="text-sm font-semibold text-gray-900 line-clamp-1">{job.role}</h1>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="truncate max-w-[100px]">{job.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><MapPin size={10}/> {job.location}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/dashboard/marketplace-jobs/${job.id}`}>
                        <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                             <ArrowUpRight size={16} className="text-gray-400" />
                        </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No active jobs found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Section */}
        <div className="w-[60%] flex flex-col">
          <StudentProfileCompletion data={data.completionData} />
        </div>
      </section>

      {/* Placement Report Section */}
      <section className="w-full bg-white rounded-xl p-8">
        <h1 className="text-lg font-medium">
          Placement Report - Department Wise
        </h1>
        <div className="w-full flex items-center justify-between mt-4 gap-6">
          <div className="w-[35%]">
            <DepartmentPlacementDonut data={data.deptData} />
          </div>

          <div className="w-[60%]">
            <div className="border bg-[#EEF1F8] rounded-lg">
              <div className="grid grid-cols-4 py-3 text-xs font-semibold">
                <div className="text-center">Company</div>
                <div className="text-center">Role</div>
                <div className="text-center">Department</div>
                <div className="text-center">Status</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-3">
              {paginatedPlacement.length > 0 ? (
                paginatedPlacement.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="grid grid-cols-4 bg-white py-3 text-xs rounded-xl border hover:shadow-sm transition-shadow"
                  >
                    <div className="text-center font-medium truncate px-1" title={p.name}>{p.name}</div>
                    <div className="text-center text-gray-600 truncate px-1" title={p.role}>{p.role}</div>
                    <div className="text-center text-gray-600 truncate px-1" title={p.instituteDepartment}>{p.instituteDepartment}</div>
                    <div className="text-center flex items-center justify-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${p.status === 'Placed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {p.status}
                        </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">No recent placements.</div>
              )}
            </div>
            
            {/* Pagination Controls for Placement */}
            {placementList.length > PLACEMENT_PAGE_SIZE && (
              <div className="flex items-center justify-end mt-4">
                 {renderPagination(placementPage, placementTotalPages, setPlacementPage)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="w-full flex gap-4">
        <div className="w-1/2">
          <ChartAreaDefault data={data.chartData} />
        </div>
        <div className="w-1/2">
          <ChartAreaDefault2 data={data.chartData2} />
        </div>
      </section>

      {/* Job Listing Table Section */}
      <section className="w-full bg-white rounded-xl p-8">
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Recent Job Postings</h2>
                <Link href="/dashboard/marketplace-jobs" className="text-sm text-[#071526] hover:underline">View All</Link>
            </div>
          <div className="border bg-[#EEF1F8] rounded-lg">
            <div className="grid grid-cols-7 py-3 text-xs font-semibold">
              <div className="text-center">Company</div>
              <div className="text-center">Role</div>
              <div className="text-center">Salary</div>
              <div className="text-center">Location</div>
              <div className="text-center">Status</div>
              <div className="text-center">Publish Date</div>
              <div className="text-center">Action</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-3">
            {data.jobs && data.jobs.length > 0 ? (
              data.jobs.map((j, idx) => (
                <div
                  key={`job-row-${j.id}-${idx}`}
                  className="grid grid-cols-7 bg-white py-3 text-xs rounded-xl border items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center font-medium truncate px-1">{j.name}</div>
                  <div className="text-center truncate px-1">{j.role}</div>
                  <div className="text-center">{j.salary}</div>
                  <div className="text-center">{j.location}</div>
                  <div className="text-center">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-medium uppercase tracking-wide">{j.status}</span>
                  </div>
                  <div className="text-center">{j.date}</div>
                  <div className="text-center">
                    <Link href={`/dashboard/marketplace-jobs/${j.id}`} className="text-[#314370] font-medium underline hover:text-[#04332c]">
                      View More
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">No active jobs found.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default InstituteDashboard;

interface DashboardCardsProps {
  score: number;
  score1: number;
  score2: number;
  score3: number;
  onboardedUsers?: any[]; 
  activeUsers?: any[];
  activeAssessments?: any[];
  departmentList?: any[];

  counts?: {
      onboarded: number;
      active: number;
      assessments: number;
      departments: number;
  };
  pages?: {
      onboarded: number;
      active: number;
      assessment: number;
      dept: number;
  };
  setPages?: {
      onboarded: (p: number) => void;
      active: (p: number) => void;
      assessment: (p: number) => void;
      dept: (p: number) => void;
  };
}

function DashboardCards({ 
  score, 
  score1, 
  score2, 
  score3, 
  onboardedUsers, 
  activeUsers, 
  activeAssessments, 
  departmentList,
  counts,
  pages,
  setPages
}: DashboardCardsProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const cards = [
    { key: "onboarded", label: "Total\nStudent Onboarded", value: score },
    { key: "activeStudents", label: "Total\nActive Students", value: score1 },
    { key: "activeAssessments", label: "Total\nActive Assessments", value: score2 },
    { key: "departments", label: "Total\nNo. of Departments", value: score3 },
  ];

  return (
    <>
      <div className="flex w-full gap-4">
        {cards.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <Card
              key={item.key}
              onClick={() => setActiveSection(isActive ? null : item.key)}
              className={`w-1/4 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border-none group 
                hover:bg-gradient-to-b from-[#314370] to-[#071526]
                ${isActive ? "bg-gradient-to-b from-[#314370] to-[#071526] ring-2 ring-offset-2 ring-[#071526]" : "bg-white"}
              `}
            >
              <CardHeader>
                <CardDescription className={`font-medium transition-colors duration-300 ${isActive ? "text-white" : "text-gray-500"} group-hover:text-white`}>
                  {item.label.split("\n")[0]}<br />{item.label.split("\n")[1]}
                </CardDescription>
                <CardTitle className={`text-5xl mt-4 font-bold tabular-nums @[250px]/card:text-3xl transition-colors duration-300 ${isActive ? "text-white" : "text-gray-900"} group-hover:text-white`}>
                  {item.value}
                </CardTitle>
                <CardAction>
                  <div className={`border border-current rounded-full p-2 transition-all duration-300 ${isActive ? "bg-white text-black rotate-90" : "text-black"} group-hover:bg-white group-hover:text-black`}>
                    <ArrowUpRight size={20} className="transform transition-transform duration-300" />
                  </div>
                </CardAction>
              </CardHeader>
            </Card>
          );
        })}
      </div>
      
      <div className="w-full transition-all duration-500 ease-in-out">
        {activeSection === "onboarded" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <OnboardingScreen 
                    data={onboardedUsers} 
                    totalCount={counts?.onboarded}
                    currentPage={pages?.onboarded}
                    onPageChange={setPages?.onboarded}
                />
            </div>
        )}
        {activeSection === "activeStudents" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <ActiveStudent 
                    data={activeUsers} 
                    totalCount={counts?.active}
                    currentPage={pages?.active}
                    onPageChange={setPages?.active}
                />
            </div>
        )}
        {activeSection === "activeAssessments" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <AssementsSection 
                    data={activeAssessments} 
                    totalCount={counts?.assessments}
                    currentPage={pages?.assessment}
                    onPageChange={setPages?.assessment}
                />
            </div>
        )}
        {activeSection === "departments" && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <DeptSection 
                    data={departmentList} 
                    totalCount={counts?.departments}
                    currentPage={pages?.dept}
                    onPageChange={setPages?.dept}
                />
            </div>
        )}
      </div>
    </>
  );
}

// ... Rest of the file (ChartAreaDefault, etc.) remains unchanged
function StudentProfileCompletion({ data }: { data: any[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  return (
    <div className="w-full h-full bg-white p-6 rounded-xl shadow-sm flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Student Profile Completion</h2>
      <div className="flex flex-col gap-12">
        {data && data.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 relative">
            <div
              className="w-full h-4 bg-[#EEF1F8] rounded-full overflow-hidden cursor-pointer"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out bg-[#9FB3C8] hover:bg-[#314370]`}
                style={{ width: `${item.value}%` }}
              />
            </div>
            <span className="text-gray-500 text-sm font-medium w-[10%] whitespace-nowrap">{item.range}</span>
            {hoverIndex === idx && (
              <div className="absolute bg-white shadow-xl p-3 rounded-xl border top-[-75px] left-[40%] z-50 animate-in fade-in zoom-in duration-200">
                <p className="text-[11px] text-gray-500">Total Students</p>
                <p className="text-xl font-semibold text-[#071526]">{item.value}</p>
                <div className="w-3 h-3 rotate-45 bg-white border-l border-b absolute bottom-[-6px] left-[50%] -translate-x-1/2"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function DepartmentPlacementDonut({ data }: { data: any[] }) {
  const totalPlaced = Array.isArray(data) ? data.reduce((acc, cur) => acc + cur.placed, 0) : 0;
  const chartData = Array.isArray(data) && data.length > 0 ? data : [{ dept: "No Data", placed: 1, fill: "#e0e0e0" }];

  return (
    <Card className="flex flex-col rounded-none shadow-none border-none">
      <CardContent className="relative flex-1 pb-0">
        <ChartContainer config={{ placed: { label: "Placed Students" } }} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="placed" 
              nameKey="dept" 
              innerRadius={70} 
              outerRadius={95} 
              strokeWidth={4} 
              cornerRadius={4} 
              paddingAngle={3}
            >
              {chartData.map((entry, index) => {
                const bluePalette = ['#071526', '#314370', '#9FB3C8', '#5A73A2', '#829BC4'];
                return (
                  <Cell key={`cell-${index}`} fill={bluePalette[index % bluePalette.length]} />
                );
              })}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h1 className="text-3xl font-bold">{totalPlaced}</h1>
          <p className="text-sm text-gray-500">Total Placed</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total Placements <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Department wise placement distribution</div>
      </CardFooter>
    </Card>
  );
}

const chartConfig2 = { desktop: { label: "Total Jobs Posted ", color: "#314370" } } satisfies ChartConfig;
export function ChartAreaDefault({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 leading-none font-medium">Monthly New Jobs</div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">Last 6 Months</div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig2}>
          <AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="desktopGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9FB3C8" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--color-desktop)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<JobsHoverTooltip />} />
            <Area dataKey="desktop" type="natural" stroke="var(--color-desktop)" fill="url(#desktopGradient2)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const chartConfig3 = { desktop: { label: "Total Canditates Placed ", color: "#C39520" } } satisfies ChartConfig;
export function ChartAreaDefault2({ data }: { data: any[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 leading-none font-medium">Monthly Placed Candidates</div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">Last 6 Months</div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig3}>
          <AreaChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDD72A" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--color-desktop)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<PlacementHoverTooltip />} />
            <Area dataKey="desktop" type="natural" stroke="var(--color-desktop)" fill="url(#desktopGradient)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
"use client";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Download, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { useParams, useRouter } from "next/navigation";

// Helper to construct base URL cleanly without double slashes
const getBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1995";
  return url.endsWith("/api/v1") ? url : `${url}/api/v1`;
};

const API_URL = getBaseUrl();

type FormattedQuestion = {
    id: any; 
    question: string;
    options: { id: any; option: string; key: string }[];
    correct: boolean;
    correctOptionId: any; 
    yourOptionId: any;    
    timeTaken: string;    
}

const page = () => {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params["assessment-id"];
  const userId = params["user-id"];

  const [pct, setPct] = useState(0);
  const [queNo, setQueNo] = useState<any>(1);
  const [questions, setQuestions] = useState<FormattedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [testName, setTestName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [error, setError] = useState("");

  const currentQuestion = questions.find((q) => q.id === queNo);

  useEffect(() => {
    const fetchReport = async () => {
        // Prevent running if params aren't ready
        if (!assessmentId || !userId) return;

        try {
            const token = localStorage.getItem("token");
            const headers = { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            };

            const res = await fetch(`${API_URL}/assessments/${assessmentId}/performance/${userId}`, { headers });
            
            const contentType = res.headers.get("content-type");
            if (!res.ok) {
                 if (contentType && contentType.includes("application/json")) {
                     const errData = await res.json();
                     throw new Error(errData.message || "Failed to fetch report");
                 }
                 throw new Error(`Failed to fetch report: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            
            if (data.success && data.result) {
                const r = data.result;
                setPct(r.obtained_percentage || 0);
                setTestName(r.test_name);

                // Extract Student Name safely
                if (r.user_id) {
                    const fullName = `${r.user_id.firstname || ''} ${r.user_id.lastname || ''}`.trim();
                    setStudentName(fullName || "Student");
                }

                if (r.mcqs && Array.isArray(r.mcqs)) {
                    const formattedQs: FormattedQuestion[] = r.mcqs.map((q: any, idx: number) => {
                        const opts: { id: any; option: string; key: string }[] = [];
                        if (Array.isArray(q.options)) {
                             const keys = ["A", "B", "C", "D"];
                             q.options.forEach((val: string, i: number) => {
                                 if (i < 4) opts.push({ id: keys[i], option: val, key: keys[i] });
                             });
                        } else if (q.options && typeof q.options === 'object') {
                            Object.entries(q.options).forEach(([key, val]) => {
                                if(val) opts.push({ id: key, option: val as string, key: key });
                            });
                        }

                        return {
                            id: idx + 1,
                            question: q.question,
                            options: opts,
                            correct: q.user_answer === q.correct_answer,
                            correctOptionId: q.correct_answer,
                            yourOptionId: q.user_answer,
                            timeTaken: `${q.time_taken_per_q || 0}s`
                        };
                    });
                    setQuestions(formattedQs);
                }
            } else {
                setError("Report data unavailable.");
            }

        } catch (error: any) {
            console.error("Error loading report:", error);
            setError(error.message || "Failed to load report.");
        } finally {
            setLoading(false);
        }
    };

    if (assessmentId && userId) {
        fetchReport();
    } else {
        // If params are missing for some reason, stop loading to show empty state/error
        const timeout = setTimeout(() => setLoading(false), 2000);
        return () => clearTimeout(timeout);
    }
  }, [assessmentId, userId]);


  if (loading) return <div className="w-full h-96 flex items-center justify-center"><Loader2 className="animate-spin text-gray-500" /></div>;
  if (error) return <div className="w-full h-96 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <main className="w-full h-full p-6 bg-[#F8F9FA] min-h-screen">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
         <span onClick={() => router.push('/dashboard')} className="cursor-pointer hover:text-gray-900 transition-colors">Dashboard</span>
         <span>/</span>
         <span onClick={() => router.push(`/dashboard/assessment/${assessmentId}`)} className="cursor-pointer hover:text-gray-900 transition-colors">Assessment</span>
         <span>/</span>
         <span className="text-[#0B5B4D] font-semibold">{studentName || "Candidate Report"}</span>
      </div>

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-lg text-[#1E1E1E] font-semibold">
          Your Assessment Performance Report For {testName}
        </h1>
        <div className="w-fit text-white flex items-center px-4 py-2 bg-[#0B5B4D] rounded-md gap-2 cursor-pointer transition-colors hover:bg-[#094d41] text-sm">
          <Download size={15} />
          <h1>Export List</h1>
        </div>
      </div>

      <div className="w-full flex flex-col md:flex-row gap-4 h-auto md:h-80 mt-4">
        {/* Left - Semicircular Progress */}
        <div className="border border-transparent md:h-full rounded-xl bg-gradient-to-b from-[#053F35] to-[#17C1A3] flex flex-col items-center justify-between p-4 w-full md:w-1/3 lg:w-1/4 shadow-sm">
          <h1 className="w-full text-white font-medium text-center">Overall Score</h1>
          <div className="w-full flex items-center justify-center flex-1">
            <SemicircularProgress percentage={pct} size={200} />
          </div>
          <div className="w-full rounded-xl bg-white/95 mt-4 p-3 shadow-sm">
            <p className="text-xs sm:text-sm text-black/70 text-center">
              {pct > 70 ? "Excellent work! Keep maintaining your pace." : "Good effort! Keep practicing to improve your score."}
            </p>
          </div>
        </div>

        {/* Right - Bar Chart */}
        <div className="flex-1 border border-gray-200 bg-white rounded-xl h-full p-4 flex flex-col shadow-sm">
          <h1 className="font-medium text-gray-800 mb-2">Time Taken Per Question (Seconds)</h1>
          <div className="w-full h-full min-h-[200px]">
            <ChartBarDefault questions={questions} queNo={queNo} />
          </div>
        </div>
      </div>

      {/* Question Feedback */}
      <div className="w-full rounded-xl border border-gray-200 mt-6 bg-white p-6 shadow-sm">
        <h1 className="font-medium text-gray-800 mb-4">Question Wise Feedback</h1>
        <div className="flex gap-2 flex-wrap mb-6">
          {questions.map((q) => (
            <button
              key={q.id}
              onClick={() => setQueNo(q.id)}
              className={`
                h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-all
                ${
                    queNo === q.id
                    ? q.correct
                        ? "bg-[#2E8D5D] text-white ring-2 ring-[#2E8D5D] ring-offset-2"
                        : "bg-[#AB0A00] text-white ring-2 ring-[#AB0A00] ring-offset-2"
                    : q.correct
                    ? "bg-[#D7FFEB] text-[#048746] hover:bg-[#C2F5DD]"
                    : "bg-[#FFE5E5] text-[#B20000] hover:bg-[#FCDCDC]"
                }
                `}
            >
              {q.id}
            </button>
          ))}
        </div>
        
        {currentQuestion ? (
          <div className="w-full bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="flex justify-between items-start gap-4">
                 <h1 className="text-lg font-medium text-gray-900">{currentQuestion.question}</h1>
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentQuestion.correct ? "bg-[#E8FFF3] text-[#2E8D5D]" : "bg-[#FFEBE6] text-[#AB0A00]"}`}>
                     {currentQuestion.correct ? "Correct" : "Incorrect"}
                 </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              {currentQuestion.options.map((option) => {
                const isCorrect = currentQuestion.correctOptionId === option.key;
                const isYourAnswer = currentQuestion.yourOptionId === option.key;
                const isWrong = isYourAnswer && !isCorrect;

                return (
                  <div
                    key={option.id}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all
                        ${isCorrect ? "bg-[#E8FFF3] border-[#048746]" : isWrong ? "bg-[#FFE5E5] border-[#B20000]" : "bg-white border-gray-200"}
                    `}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isCorrect ? "border-[#048746]" : isWrong ? "border-[#B20000]" : "border-gray-400"}`}>
                      {(isCorrect || isWrong) && (
                        <span className={`w-2.5 h-2.5 rounded-full ${isCorrect ? "bg-[#048746]" : "bg-[#B20000]"}`}></span>
                      )}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{option.option}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
            <div className="text-gray-400 py-10 text-center">Select a question to view details</div>
        )}
      </div>
    </main>
  );
};

export default page;

// Sub Components

const chartConfig = {
  desktop: { label: "timeTaken", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ChartBarDefault({ questions, queNo }: { questions: FormattedQuestion[], queNo: any }) {
  const graphData = questions.map((q) => ({
    ...q,
    timeTaken: parseInt(q.timeTaken.replace("s", "") || "0"),
  }));

  if(graphData.length === 0) return <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">No data</div>;

  return (
    <Card className="bg-transparent shadow-none border-none w-full h-full">
      <CardContent className="p-0 w-full h-full">
        <ChartContainer config={chartConfig} className="w-full h-[90%]">
          <BarChart accessibilityLayer data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DDE9E5" /><stop offset="100%" stopColor="#FFFFFF" /></linearGradient>
              <linearGradient id="wrongGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFECE7" /><stop offset="100%" stopColor="#FFFFFF" /></linearGradient>
              <linearGradient id="currCorrectGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#066841" /> <stop offset="100%" stopColor="#ffffff" /></linearGradient>
              <linearGradient id="currWrongGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#AD0F05" /> <stop offset="100%" stopColor="#Ffffff" /></linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="id" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            
            <Bar dataKey="timeTaken" radius={8}>
              {graphData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.id === queNo
                      ? entry.correct ? "url(#currCorrectGradient)" : "url(#currWrongGradient)" 
                      : entry.correct ? "url(#correctGradient)" : "url(#wrongGradient)" 
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const useCountUp = (end: number, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16); 
    const handle = setInterval(() => {
      start += increment;
      if (start >= end) { setValue(end); clearInterval(handle); } 
      else { setValue(Math.ceil(start)); }
    }, 16);
    return () => clearInterval(handle);
  }, [end, duration]);

  return value;
};

type SemicircularProgressProps = { percentage: number; size?: number; strokeWidth?: number; color?: string; bgColor?: string; showLabel?: boolean; ariaLabel?: string; };

function SemicircularProgress({ percentage, size = 200, strokeWidth = 12, color = "#FFCD71", bgColor = "#FFF7E8", showLabel = true, ariaLabel = "Progress" }: SemicircularProgressProps) {
  const pct = useCountUp(Math.max(0, Math.min(100, Math.round(percentage))));
  const dashArray = 100;
  const dashOffset = 100 - pct;

  return (
    <div role="img" aria-label={`${ariaLabel}: ${pct}%`} style={{ width: size, height: size / 2 }} className="inline-block relative">
      <svg viewBox="0 0 100 60" width={size} height={(size / 100) * 60} preserveAspectRatio="xMidYMid meet">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={bgColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={dashArray} strokeDashoffset={dashOffset} pathLength={100} style={{ transition: "stroke-dashoffset 700ms ease, stroke 300ms" }} />
        {showLabel && <text x="50" y="45" textAnchor="middle" alignmentBaseline="middle" fontSize="16" fontWeight={700} fill="#ffffff">{pct}%</text>}
      </svg>
    </div>
  );
}
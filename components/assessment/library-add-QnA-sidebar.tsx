"use client";

import React, { useEffect, useState } from "react";
import { X, MoreHorizontal, CheckCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";
import { AssessmentRow } from "@/components/assessment/assessment-row";

// Types
export type ManualQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  score: number;
  difficulty: "Easy" | "Intermediate" | "Hard";
  topic: string;
  subTopic: string;
  answerReasoning?: string;
  category?: string;
};

export type Row = {
  id: string;
  subTopic: string;
  typeOfQuestion: string;
  difficulty: string;
  numQuestions: string;
  scorePerQuestion: string;
  category?: string;
  section?: string;
};

export type AiGenerationConfig = {
  assessmentName: string;
  categories: {
    domain: boolean;
    aptitude: boolean;
  };
  domain: string;
  subDomains: string[];
  rows: Row[];
};

const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"];

interface LibraryAddSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveManual: (q: ManualQuestion) => void;
  onGenerateAI: (config: AiGenerationConfig) => Promise<void>;
  defaultTopic?: string;
  defaultSubTopic?: string;
}

export default function LibraryAddSidebar({
  isOpen,
  onClose,
  onSaveManual,
  onGenerateAI,
  defaultTopic = "",
  defaultSubTopic = "",
}: LibraryAddSidebarProps) {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [isLoading, setIsLoading] = useState(false);

  // SHARED DATA
  const [categoriesMeta, setCategoriesMeta] = useState<any>(null);

  // AI STATE (Matching real flow)
  const [aiCats, setAiCats] = useState({ domain: true, aptitude: false });
  const [aiDomain, setAiDomain] = useState("");
  const [aiSubDomains, setAiSubDomains] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([{
    id: crypto.randomUUID(),
    subTopic: "",
    typeOfQuestion: "MCQ Single Correct Answer",
    difficulty: "Medium",
    numQuestions: "5",
    scorePerQuestion: "1",
    category: "Domain based"
  }]);

  const isCombinedMode = aiCats.domain && aiCats.aptitude;
  const activeMode: "domain" | "aptitude" | "soft" = isCombinedMode ? "domain" : (aiCats.domain ? "domain" : "aptitude");
  const [domainOptions, setDomainOptions] = useState<string[]>([]);
  const [aptOptions, setAptOptions] = useState<string[]>([]);
  const questionTypes = ["MCQ Single Correct Answer"];

  // MANUAL STATE
  const emptyQuestion = (): Partial<ManualQuestion> => ({
    id: crypto.randomUUID(),
    question: "",
    options: ["", "", "", ""],
    correctOptionIndex: undefined,
    score: 10,
    difficulty: "Intermediate",
    topic: defaultTopic || "",
    subTopic: defaultSubTopic || "",
    answerReasoning: "",
  });
  const [manualQ, setManualQ] = useState<Partial<ManualQuestion>>(emptyQuestion());

  // New state for manual category selection to drive dropdowns
  const [manualCategory, setManualCategory] = useState("Domain Based");
  const [manualAvailableDomains, setManualAvailableDomains] = useState<string[]>([]);
  const [manualAvailableSubTopics, setManualAvailableSubTopics] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode("manual");
      setManualQ(emptyQuestion());
      setManualCategory("Domain Based");
      setAiCats({ domain: true, aptitude: false });
      setAiDomain("");
      setAiSubDomains([]);
      setRows([{
        id: crypto.randomUUID(),
        subTopic: "",
        typeOfQuestion: "MCQ Single Correct Answer",
        difficulty: "Medium",
        numQuestions: "5",
        scorePerQuestion: "1",
        category: "Domain based"
      }]);
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/assessments/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setCategoriesMeta(data);

        if (Array.isArray(data?.["Domain Based"])) {
          setDomainOptions(data["Domain Based"].map((d: any) => d.name));
        }
        if (Array.isArray(data?.["Aptitude Based"])) {
          setAptOptions(data["Aptitude Based"].map((d: any) => d.name));
        }
      }
    } catch (err) {
      console.error("Error loading categories", err);
    }
  };

  const getSubTopicsForDomain = (category: string, domainName: string) => {
    if (!categoriesMeta || !domainName) return [];
    const list = categoriesMeta[category] as any[];
    const found = list?.find((d: any) => d.name === domainName);
    return (found && Array.isArray(found.sub_items)) ? found.sub_items : [];
  };

  // AI Helpers
  const addSubDomain = (s: string) => {
    if (!aiSubDomains.includes(s)) setAiSubDomains(prev => [...prev, s]);
  };
  const removeSubDomain = (s: string) => {
    setAiSubDomains(prev => prev.filter(x => x !== s));
  };

  const addRow = () => {
    setRows(r => [...r, {
      id: crypto.randomUUID(),
      subTopic: "",
      typeOfQuestion: "MCQ Single Correct Answer",
      difficulty: "Medium",
      numQuestions: "5",
      scorePerQuestion: "1",
      category: isCombinedMode ? "Domain based" : (aiCats.domain ? "Domain based" : "Aptitude based")
    }]);
  };

  const updateRow = (id: string, patch: any) => setRows(r => r.map(row => row.id === id ? { ...row, ...patch } : row));
  const removeRow = (id: string) => setRows(r => r.filter(x => x.id !== id));


  // MANUAL DEPENDENCIES
  useEffect(() => {
    if (categoriesMeta) {
      const cat = manualCategory === "Domain Based" ? "Domain Based" : (manualCategory === "Aptitude Based" ? "Aptitude Based" : "Soft Skills Based");
      setManualAvailableDomains(Array.isArray(categoriesMeta[cat]) ? categoriesMeta[cat].map((d: any) => d.name) : []);
      setManualQ(prev => ({ ...prev, topic: "", subTopic: "" }));
    }
  }, [manualCategory, categoriesMeta]);

  useEffect(() => {
    if (categoriesMeta && manualQ.topic) {
      const cat = manualCategory === "Domain Based" ? "Domain Based" : (manualCategory === "Aptitude Based" ? "Aptitude Based" : "Soft Skills Based");
      setManualAvailableSubTopics(getSubTopicsForDomain(cat, manualQ.topic));
      setManualQ(prev => ({ ...prev, subTopic: "" }));
    } else {
      setManualAvailableSubTopics([]);
    }
  }, [manualQ.topic, categoriesMeta, manualCategory]);


  // MANUAL HANDLERS
  const handleManualOptionChange = (idx: number, val: string) => {
    setManualQ((s) => {
      const newOptions = [...(s.options ?? [])];
      newOptions[idx] = val;
      return { ...s, options: newOptions };
    });
  };

  const addManualOption = () => {
    setManualQ((s) => {
      const opts = [...(s.options ?? [])];
      if (opts.length >= 6) return s;
      opts.push("");
      return { ...s, options: opts };
    });
  };

  const removeManualOption = (idx: number) => {
    setManualQ((s) => {
      const opts = [...(s.options ?? [])];
      if (opts.length <= 2) return s;
      opts.splice(idx, 1);
      let newCorrect = s.correctOptionIndex;
      if (typeof newCorrect === "number") {
        if (newCorrect === idx) newCorrect = undefined;
        else if (newCorrect > idx) newCorrect = newCorrect - 1;
      }
      return { ...s, options: opts, correctOptionIndex: newCorrect };
    });
  };

  const submitManual = () => {
    const q = manualQ;
    if (!q.topic) return toast.error("Please select a Topic");
    // Subtopic might be optional for Soft Skills or if empty
    if (manualCategory !== "Soft Skills" && manualAvailableSubTopics.length > 0 && !q.subTopic) {
      return toast.error("Please select a Sub Topic");
    }

    if (!q.question?.trim()) return toast.error("Question text is required");
    if (!q.options || q.options.length < 2) return toast.error("Min 2 options required");
    if (q.options.some((opt) => !opt.trim())) return toast.error("Options cannot be empty");
    if (q.correctOptionIndex === undefined) return toast.error("Select correct answer");

    onSaveManual(q as ManualQuestion);
    onClose();
  };

  const submitAi = async () => {
    if (!aiCats.domain && !aiCats.aptitude) return toast.error("Select at least one category");
    if (!aiDomain) return toast.error("Select a Domain Topic");
    if (aiCats.domain && aiSubDomains.length === 0) return toast.error("Select at least one sub-topic");

    for (const r of rows) {
      if (!r.difficulty || !r.numQuestions || !r.scorePerQuestion) {
        return toast.error("Complete all row details");
      }
      if (isCombinedMode && r.category === "Aptitude based" && (!r.section || !r.subTopic)) {
        return toast.error("Complete Aptitude row details");
      }
    }

    setIsLoading(true);
    try {
      // Decode user ID from token
      const token = localStorage.getItem("token");
      let userId = "user";
      if (token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(window.atob(base64));
          userId = payload.id || payload._id || "user";
        } catch (e) {
          console.error("Token decode error", e);
        }
      }
      const automatedName = `Library-${userId}-${crypto.randomUUID()}`;

      await onGenerateAI({
        assessmentName: automatedName,
        categories: aiCats,
        domain: aiDomain,
        subDomains: aiSubDomains,
        rows: rows
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[45vw] min-w-[500px] bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col animate-in slide-in-from-right-5 border-l">

        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-semibold text-[#0B5B4D]">Add Questions</h2>
            <p className="text-sm text-gray-500">Add manually or generate via AI</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 py-4 border-b">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setMode("manual")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "manual" ? "bg-white text-[#0B5B4D] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode("ai")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "ai" ? "bg-white text-[#0B5B4D] shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Generate with AI
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Manual Mode */}
          {mode === "manual" && (
            <div className="space-y-6">

              {/* Category Selection */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">Category</label>
                <Select
                  value={manualCategory}
                  onValueChange={(val) => setManualCategory(val)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Domain Based">Domain Based</SelectItem>
                    <SelectItem value="Aptitude Based">Aptitude Based</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Topic / Subtopic Selectors */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Topic <span className="text-red-500">*</span></label>
                  <Select
                    value={manualQ.topic}
                    onValueChange={(val) => setManualQ(s => ({ ...s, topic: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger>
                    <SelectContent>
                      {manualAvailableDomains.length > 0 ? manualAvailableDomains.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      )) : <SelectItem value="none" disabled>No topics available</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Sub Topic</label>
                  <Select
                    value={manualQ.subTopic}
                    onValueChange={(val) => setManualQ(s => ({ ...s, subTopic: val }))}
                    disabled={manualAvailableSubTopics.length === 0}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Subtopic" /></SelectTrigger>
                    <SelectContent>
                      {manualAvailableSubTopics.length > 0 ? manualAvailableSubTopics.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      )) : <SelectItem value="none" disabled>No subtopics</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-base font-medium mb-2 block text-[#1E1E1E]">Question:</label>
                <Textarea
                  placeholder="Type your question here..."
                  value={manualQ.question}
                  onChange={(e) => setManualQ((s) => ({ ...s, question: e.target.value }))}
                  className="min-h-[100px] focus:border-[#0B5B4D] resize-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-[#1E1E1E]">Options</h3>
                  <span className="text-xs text-gray-500">Mark the correct answer</span>
                </div>
                <div className="flex flex-col gap-3">
                  {manualQ.options?.map((opt, idx) => {
                    const isSelected = manualQ.correctOptionIndex === idx;
                    return (
                      <div key={idx} className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${isSelected ? "border-[#0B5B4D] bg-[#F0FDF4]" : "border-gray-200 bg-white"}`}>
                        <div className="text-gray-300"><MoreHorizontal className="rotate-90" size={16} /></div>
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name={`manual_opt`}
                            checked={isSelected}
                            onChange={() => setManualQ((s) => ({ ...s, correctOptionIndex: idx }))}
                            className="peer w-5 h-5 cursor-pointer appearance-none border border-gray-300 rounded-full checked:border-[#0B5B4D] checked:border-4"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                          value={opt}
                          onChange={(e) => handleManualOptionChange(idx, e.target.value)}
                        />
                        {isSelected && <CheckCircle size={18} className="text-[#0B5B4D]" />}
                        <Button variant="ghost" size="icon" onClick={() => removeManualOption(idx)} className="text-gray-400 hover:text-red-500 h-8 w-8"><Trash2 size={16} /></Button>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" onClick={addManualOption} className="w-full mt-3 border-dashed text-gray-500 hover:text-[#0B5B4D] hover:border-[#0B5B4D]">
                  <Plus size={16} className="mr-2" /> Add Option
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1.5 block">Score</label>
                  <Input type="number" min={1} value={manualQ.score} onChange={(e) => setManualQ(s => ({ ...s, score: Number(e.target.value) }))} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1.5 block">Difficulty</label>
                  <Select value={manualQ.difficulty} onValueChange={(val: any) => setManualQ(s => ({ ...s, difficulty: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Answer Reasoning (Optional)</label>
                <Textarea
                  placeholder="Explanation..."
                  value={manualQ.answerReasoning}
                  onChange={(e) => setManualQ(s => ({ ...s, answerReasoning: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* AI Mode */}
          {mode === "ai" && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <label className="text-sm font-medium mb-3 block">Categories</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={aiCats.domain} onChange={() => setAiCats(p => ({ ...p, domain: !p.domain }))} className="accent-[#0B5B4D]" /> Domain Based
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={aiCats.aptitude} onChange={() => setAiCats(p => ({ ...p, aptitude: !p.aptitude }))} className="accent-[#0B5B4D]" /> Aptitude Based
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Domain Topic <span className="text-red-500">*</span></label>
                  <Select value={aiDomain} onValueChange={(v) => { setAiDomain(v); setAiSubDomains([]); }}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{(isCombinedMode || aiCats.domain ? domainOptions : aptOptions).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {(aiCats.domain || isCombinedMode) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Sub Topics (Select at least one)</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {aiSubDomains.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-green-50 text-[#0B5B4D] border border-green-200 rounded-full text-xs flex items-center gap-1">
                          {tag} <X size={12} className="cursor-pointer" onClick={() => removeSubDomain(tag)} />
                        </span>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border flex flex-wrap gap-2 max-h-[120px] overflow-y-auto">
                      {aiDomain ? getSubTopicsForDomain("Domain Based", aiDomain).map((s: string) => (
                        <button key={s} onClick={() => aiSubDomains.includes(s) ? removeSubDomain(s) : addSubDomain(s)} className={`px-3 py-1 rounded-full text-xs border ${aiSubDomains.includes(s) ? "bg-[#0B5B4D] text-white" : "bg-white text-gray-600"}`}>
                          {aiSubDomains.includes(s) ? s : `+ ${s}`}
                        </button>
                      )) : <span className="text-xs text-gray-400">Select domain to see suggestions</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Question Details</h3>
                  <Button variant="ghost" size="sm" onClick={addRow} className="text-[#0B5B4D] text-xs"><Plus size={14} className="mr-1" /> Add Set</Button>
                </div>
                {rows.map(r => (
                  <AssessmentRow
                    key={r.id}
                    row={r}
                    isCombinedMode={isCombinedMode}
                    mode={activeMode}
                    showCategory={isCombinedMode}
                    meta={{
                      questionTypes, difficulties: ["Easy", "Medium", "Hard"], aptOptions, softOptions: [], rawMeta: categoriesMeta, selectedDomain: aiDomain
                    }}
                    onUpdate={updateRow}
                    onRemove={removeRow}
                    showErrors={false}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {mode === "manual" ? (
            <Button onClick={submitManual} className="bg-[#0B5B4D] hover:bg-[#094d41]">Save Question</Button>
          ) : (
            <Button onClick={submitAi} disabled={isLoading} className="bg-[#0B5B4D] hover:bg-[#094d41]">
              {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Generate Questions
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
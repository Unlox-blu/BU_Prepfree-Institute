import React, { useEffect, useState } from "react";
import { X, MoreHorizontal, CheckCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"; 

export type Question = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  score: number;
  difficulty: "Easy" | "Intermediate" | "Hard";
  topic: string;
  subTopic: string;
  answerReasoning: string; // Mandatory now
};

const DIFFICULTY_OPTIONS = ["Easy", "Intermediate", "Hard"];

interface QuestionAnswerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  questionNumber: number;
  defaultTopic: string;
  defaultSubTopic: string;
  subTopics: string[];
  isTopicEditable: boolean;
  initialQuestion?: Question | null; // For editing
}

export default function QuestionAnswerSidebar({
  isOpen,
  onClose,
  onSave,
  questionNumber,
  defaultTopic,
  defaultSubTopic,
  subTopics,
  isTopicEditable,
  initialQuestion
}: QuestionAnswerSidebarProps) {

  // Custom ID generator for manual mode
  const generateManualId = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "prep";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const emptyQuestion = (): Partial<Question> => ({
    id: generateManualId(),
    question: "",
    options: ["", "", "", ""],
    correctOptionIndex: undefined,
    score: 10,
    difficulty: "Intermediate",
    topic: defaultTopic || "",
    subTopic: defaultSubTopic || "",
    answerReasoning: "",
  });

  const [currentQ, setCurrentQ] = useState<Partial<Question>>(emptyQuestion());

  useEffect(() => {
    if (isOpen) {
      if (initialQuestion) {
        setCurrentQ({ ...initialQuestion });
      } else {
        setCurrentQ(emptyQuestion());
      }
    }
  }, [isOpen, initialQuestion, defaultTopic, defaultSubTopic]);

  const handleOptionChange = (idx: number, val: string) => {
    setCurrentQ((s) => {
      const newOptions = [...(s.options ?? [])];
      newOptions[idx] = val;
      return { ...s, options: newOptions };
    });
  };

  const addOption = () => {
    setCurrentQ((s) => {
      const opts = [...(s.options ?? [])];
      if (opts.length >= 6) return s;
      opts.push("");
      return { ...s, options: opts };
    });
  };

  const removeOption = (idx: number) => {
    setCurrentQ((s) => {
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

  const handleSave = () => {
    const q = currentQ;
    
    if (!q.question?.trim()) return toast.error("Question text is required");
    if (!q.options || q.options.length < 2) return toast.error("At least two options are required");
    if (q.options.some((opt) => !opt.trim())) return toast.error("All options must have text");
    if (q.correctOptionIndex === undefined) return toast.error("Please select a correct answer");
    if (!q.answerReasoning?.trim()) return toast.error("Answer reasoning is mandatory");

    const final: Question = {
      id: q.id ?? generateManualId(),
      question: q.question!,
      options: q.options!,
      correctOptionIndex: q.correctOptionIndex!,
      score: q.score ?? 10,
      difficulty: (q.difficulty as Question["difficulty"]) ?? "Intermediate",
      topic: q.topic ?? defaultTopic ?? "",
      subTopic: q.subTopic ?? defaultSubTopic ?? "",
      answerReasoning: q.answerReasoning!,
    };
    onSave(final);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      <div className="fixed top-0 right-0 h-full w-[40vw] bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col animate-in slide-in-from-right-5 border-l">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-[#0B5B4D]">
            {initialQuestion ? "Edit Question" : "Add New Question"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic / Subtopic Selectors */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Topic <span className="text-red-500">*</span></label>
              {!isTopicEditable ? (
                <Input disabled value={currentQ.topic || defaultTopic || "General"} className="bg-gray-100 text-gray-500" />
              ) : (
                <Select value={currentQ.topic ?? ""} onValueChange={(val) => setCurrentQ(s => ({ ...s, topic: val }))}>
                  <SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={defaultTopic}>{defaultTopic}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Sub Topic <span className="text-red-500">*</span></label>
              <Select value={currentQ.subTopic ?? ""} onValueChange={(val) => setCurrentQ(s => ({ ...s, subTopic: val }))}>
                <SelectTrigger><SelectValue placeholder="Select Subtopic" /></SelectTrigger>
                <SelectContent>
                  {subTopics.length === 0 ? <SelectItem value="none" disabled>No subtopics</SelectItem> : subTopics.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-base font-medium mb-2 block text-[#1E1E1E]">Question {questionNumber}:</label>
            <Textarea
              placeholder="Write down your question here..."
              value={currentQ.question}
              onChange={(e) => setCurrentQ((s) => ({ ...s, question: e.target.value }))}
              className="min-h-[100px] focus:border-[#0B5B4D] resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-[#1E1E1E]">Options</h3>
              <span className="text-xs text-gray-500">Select the correct answer</span>
            </div>
            <div className="flex flex-col gap-3">
              {currentQ.options?.map((opt, idx) => {
                const isSelected = currentQ.correctOptionIndex === idx;
                return (
                  <div key={idx} className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${isSelected ? "border-[#0B5B4D] bg-[#F0FDF4] shadow-sm" : "border-gray-200 bg-white"}`}>
                    <div className="text-gray-300 cursor-grab"><MoreHorizontal className="rotate-90" size={16} /></div>
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name={`correct_opt_${currentQ.id}`}
                        checked={isSelected}
                        onChange={() => setCurrentQ((s) => ({ ...s, correctOptionIndex: idx }))}
                        className="peer w-5 h-5 cursor-pointer appearance-none border border-gray-300 rounded-full checked:border-[#0B5B4D] checked:border-4 transition-all"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-300"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                    />
                    {isSelected && <CheckCircle size={18} className="text-[#0B5B4D]" />}
                    <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500 h-8 w-8"><Trash2 size={16} /></Button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={addOption} className="flex-1 border-dashed text-gray-500 hover:text-[#0B5B4D] hover:border-[#0B5B4D]"><Plus size={16} className="mr-2"/> Add Option</Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-[#1E1E1E]">Answer Reasoning <span className="text-red-500">*</span></label>
            <Textarea
              placeholder="Explain why the correct answer is correct..."
              value={currentQ.answerReasoning || ""}
              onChange={(e) => setCurrentQ((s) => ({ ...s, answerReasoning: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Score <span className="text-red-500">*</span></label>
              <input type="number" min={0} value={currentQ.score} onChange={(e) => setCurrentQ((s) => ({ ...s, score: Number(e.target.value) }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Difficulty <span className="text-red-500">*</span></label>
              <Select value={currentQ.difficulty} onValueChange={(val) => setCurrentQ(s => ({ ...s, difficulty: val as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-[#0B5B4D] hover:bg-[#094d41]">Save Changes</Button>
        </div>
      </div>
    </>
  );
}
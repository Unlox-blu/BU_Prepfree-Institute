"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import QuestionAnswerSidebar, { Question as QType } from "@/components/assessment/question-answer-sidebar";
import { QuestionCard } from "@/components/assessment/question-card";
import { AlertModal } from "@/components/shared/alert-modal";
import { API_BASE_URL } from "@/lib/config";
import { PageLoader } from "@/components/shared/page-loader";
import { Button } from "@/components/ui/button";

type Question = QType;

export default function ManualQnaPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params["assessment-id"] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [assessmentMeta, setAssessmentMeta] = useState<any>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Alert Modal State
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; desc: string; action: () => void }>({
    title: "",
    desc: "",
    action: () => { },
  });

  const [dynamicDomain, setDynamicDomain] = useState<string>("");
  const [availableSubTopics, setAvailableSubTopics] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<any>(null);

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/assessments/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setAllCategories(json.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // FETCH DRAFT DATA
  useEffect(() => {
    if (!assessmentId || assessmentId === "undefined") {
      setIsLoading(false);
      return;
    }

    const fetchDraft = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const data = json.assessment;

          setAssessmentMeta(data);

          const dbDomain = data.domain || data.test_domain || "General";
          setDynamicDomain(dbDomain);

          if (data.mcqs && Array.isArray(data.mcqs)) {
            const mapped = data.mcqs.map((q: any) => ({
              id: q.mcq_id,
              question: q.question,
              options: Array.isArray(q.options) ? q.options : [q.options.A, q.options.B, q.options.C, q.options.D],
              correctOptionIndex: ["A", "B", "C", "D"].indexOf(q.correct_answer),
              score: q.question_score,
              difficulty: q.difficulty_level,
              topic: q.topic || dbDomain,
              subTopic: q.sub_topic,
              answerReasoning: q.answer_reasoning || ""
            }));
            setQuestions(mapped);
          }
        } else {
          toast.error("Failed to fetch assessment details.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load draft");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraft();
  }, [assessmentId]);

  // AUTO-POPULATE SUBTOPICS
  useEffect(() => {
    if (dynamicDomain && allCategories) {
      let foundSubTopics: string[] = [];
      Object.values(allCategories).forEach((domainsList: any) => {
        if (Array.isArray(domainsList)) {
          const match = domainsList.find((d: any) => d.name === dynamicDomain);
          if (match && match.sub_items) {
            foundSubTopics = match.sub_items;
          }
        }
      });
      setAvailableSubTopics(foundSubTopics);
    }
  }, [dynamicDomain, allCategories]);


  const openAddSidebar = () => {
    setEditingQuestion(null);
    setIsSidebarOpen(true);
  };

  const openEditSidebar = (q: Question) => {
    setEditingQuestion(q);
    setIsSidebarOpen(true);
  };

  const handleSidebarSave = (q: Question) => {
    const questionData = { ...q, topic: dynamicDomain };

    if (editingQuestion) {
      setQuestions((prev) => prev.map((item) => (item.id === editingQuestion.id ? questionData : item)));
      toast.success("Question updated");
    } else {
      setQuestions((prev) => [...prev, questionData]);
      toast.success("Question added");
    }
    setIsSidebarOpen(false);
    setEditingQuestion(null);
  };

  const confirmDelete = (id: string) => {
    setAlertConfig({
      title: "Delete Question",
      desc: "Are you sure you want to delete this question? This action cannot be undone.",
      action: () => {
        setQuestions((prev) => prev.filter((x) => x.id !== id));
        setAlertOpen(false);
        toast.success("Question deleted.");
      },
    });
    setAlertOpen(true);
  };

  const confirmDeleteAll = () => {
    if (questions.length === 0) return;
    setAlertConfig({
      title: "Delete All Questions",
      desc: "Are you sure you want to delete all questions? This action cannot be undone.",
      action: () => {
        setQuestions([]);
        setAlertOpen(false);
        toast.success("All questions deleted.");
      },
    });
    setAlertOpen(true);
  };

  const handleBookmark = async (q: Question) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        question: q.question,
        options: q.options,
        correct_answer: ["A", "B", "C", "D"][q.correctOptionIndex],
        difficulty: q.difficulty,
        topic: q.topic,
        sub_topic: q.subTopic,
        question_score: q.score,
        answer_reasoning: q.answerReasoning
      };

      const res = await fetch(`${API_BASE_URL}/assessments/library`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Question saved to Library");
      } else {
        toast.error("Failed to save to library");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving question");
    }
  };

  const handleSaveNext = async () => {
    if (questions.length === 0) {
      toast.warning("Please add at least one question before continuing.");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("You are not logged in.");
        setIsSaving(false);
        return;
      }

      const payload = {
        mcqs: questions.map(q => ({
          mcq_id: q.id,
          question: q.question,
          options: {
            A: q.options[0] || "-",
            B: q.options[1] || "-",
            C: q.options[2] || "-",
            D: q.options[3] || "-"
          },
          correct_answer: ["A", "B", "C", "D"][q.correctOptionIndex || 0],
          difficulty_level: q.difficulty || "Medium",
          question_score: parseInt(q.score?.toString() || "0", 10),
          answer_reasoning: q.answerReasoning || "",
          topic: dynamicDomain,
          sub_topic: q.subTopic
        }))
      };

      const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update assessment");
      }

      toast.success("Questions saved successfully");
      router.push(`/dashboard/assessment/${assessmentId}/settings`);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizeToLibrary = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");

      // Save questions first to ensure any edits are captured
      const payload = {
        mcqs: questions.map(q => ({
          mcq_id: q.id,
          question: q.question,
          options: {
            A: q.options[0] || "-",
            B: q.options[1] || "-",
            C: q.options[2] || "-",
            D: q.options[3] || "-"
          },
          correct_answer: ["A", "B", "C", "D"][q.correctOptionIndex || 0],
          difficulty_level: q.difficulty || "Medium",
          question_score: parseInt(q.score?.toString() || "0", 10),
          answer_reasoning: q.answerReasoning || "",
          topic: dynamicDomain,
          sub_topic: q.subTopic
        }))
      };

      const saveRes = await fetch(`${API_BASE_URL}/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!saveRes.ok) throw new Error("Failed to save edits before finalization");

      // 2. Finalize
      const res = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ saveToLibrary: true })
      });
      if (res.ok) {
        toast.success("Successfully saved to Library!");
        router.push("/dashboard/assessment/question-library");
      } else {
        toast.error("Failed to finalize library questions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving to library");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!assessmentId || assessmentId === "undefined") return <div className="p-10 text-center">Missing Assessment ID</div>;

  return (
    <div className="w-full min-h-screen bg-[#F1F1F1]">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-8 items-start">
        {/* Main Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {assessmentMeta?.is_ai_generated ? "AI Generated Questions" : "Assessment Questions"}
              </h1>
              <div className="text-sm text-gray-500 mt-1">
                {assessmentMeta?.test_name} • {dynamicDomain}
                {questions.length > 0 ? ` • ${questions.length} Questions` : ""}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={confirmDeleteAll}
                className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                <Trash2 size={16} />
                Delete All
              </button>

              <button
                onClick={openAddSidebar}
                className="flex items-center gap-2 bg-[#0B5B4D] text-white px-4 py-2 rounded-md text-sm hover:bg-[#094d41]"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
                  No questions yet. Click "Add Question" to start.
                </div>
              ) : (
                questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id || idx}
                    index={idx}
                    question={q.question || ""}
                    options={q.options}
                    score={q.score}
                    difficulty={q.difficulty}
                    topic={q.topic}
                    subTopic={q.subTopic}
                    showBookmark={true}
                    onBookmark={() => handleBookmark(q)}
                    onClick={() => openEditSidebar(q)}
                    actions={
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(q.id || "");
                        }}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8"
                        title="Delete question"
                      >
                        <Trash2 size={16} />
                      </Button>
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <aside className="w-[300px]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-28">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Assessment Summary</h3>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Domain</div>
                <div className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-md border">{dynamicDomain || "Not Selected"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Total Questions</div>
                <div className="text-2xl font-bold text-[#0B5B4D]">{questions.length}</div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-xs text-gray-500 mb-2">Difficulty Breakdown</div>
                <div className="space-y-2">
                  {["Easy", "Intermediate", "Hard"].map(d => {
                    const count = questions.filter(q => q.difficulty === d).length;
                    return (
                      <div key={d} className="flex justify-between text-sm">
                        <span className="text-gray-600">{d}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed right-8 bottom-8 z-30 flex gap-4">
        {assessmentMeta?.is_library_item ? (
          <button
            onClick={handleFinalizeToLibrary}
            disabled={isSaving}
            className="flex items-center gap-3 bg-[#0B5B4D] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#094d41] disabled:opacity-60 transition-transform hover:-translate-y-1"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            Save to Library
          </button>
        ) : (
          <button
            onClick={handleSaveNext}
            disabled={isSaving}
            className="flex items-center gap-3 bg-[#0B5B4D] text-white px-6 py-3 rounded-lg shadow-lg hover:bg-[#094d41] disabled:opacity-60 transition-transform hover:-translate-y-1"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            Save & Next
          </button>
        )}
      </div>

      {isSidebarOpen && (
        <QuestionAnswerSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSave={handleSidebarSave}
          questionNumber={editingQuestion ? questions.indexOf(editingQuestion) + 1 : questions.length + 1}
          defaultTopic={dynamicDomain}
          defaultSubTopic={""}
          subTopics={availableSubTopics}
          isTopicEditable={false}
          initialQuestion={editingQuestion}
        />
      )}

      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={alertConfig.action}
        title={alertConfig.title}
        description={alertConfig.desc}
      />
    </div>
  );
}
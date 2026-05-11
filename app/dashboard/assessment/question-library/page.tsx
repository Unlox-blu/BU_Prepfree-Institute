"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { QuestionCard } from "@/components/assessment/question-card";
import { AlertModal } from "@/components/shared/alert-modal";
import { toast } from "sonner";
import LibraryAddSidebar, { ManualQuestion, AiGenerationConfig } from "@/components/assessment/library-add-QnA-sidebar";

type LibraryQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  topic?: string;
  sub_topic?: string;
  question_score?: number;
  question_type?: string;
};

const PAGE_SIZE = 10;

export default function QuestionLibraryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<LibraryQuestion[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [isAddSidebarOpen, setIsAddSidebarOpen] = useState(false);

  const [filterAptTopics, setFilterAptTopics] = useState<string[]>([]);
  const [filterAptSubTopics, setFilterAptSubTopics] = useState<string[]>([]);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [filterDifficulties, setFilterDifficulties] = useState<string[]>([]);

  const [editing, setEditing] = useState<LibraryQuestion | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Alert State
  const [alertOpen, setAlertOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; desc: string; action: () => void }>({
    title: "",
    desc: "",
    action: () => { },
  });

  const fetchLibrary = async (pageNum = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/assessments/library?page=${pageNum}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = await res.json();

      const data = json.questions || [];
      const count = json.count || data.length;
      setQuestions(data as LibraryQuestion[]);
      setTotalCount(count);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary(page);
  }, [page]);

  const allTopics = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => q.topic && s.add(q.topic));
    return Array.from(s);
  }, [questions]);

  const allSubTopics = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => q.sub_topic && s.add(q.sub_topic));
    return Array.from(s);
  }, [questions]);

  const allDifficulties = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => q.difficulty && s.add(q.difficulty));
    return Array.from(s);
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (filterAptTopics.length > 0 && q.topic && !filterAptTopics.includes(q.topic)) return false;
      if (filterAptSubTopics.length > 0 && q.sub_topic && !filterAptSubTopics.includes(q.sub_topic)) return false;
      if (filterDomains.length > 0 && q.topic && !filterDomains.includes(q.topic)) return false;
      if (filterDifficulties.length > 0 && q.difficulty && !filterDifficulties.includes(q.difficulty)) return false;
      return true;
    });
  }, [questions, filterAptTopics, filterAptSubTopics, filterDomains, filterDifficulties]);

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  };

  const confirmDeleteQuestion = (id: string) => {
    setAlertConfig({
      title: "Delete Question",
      desc: "Are you sure you want to delete this question? This action cannot be undone.",
      action: async () => {
        try {
          setDeleteLoading(true);
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/assessments/library/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            setQuestions((prev) => prev.filter((p) => p.id !== id));
            setSelectedIds((s) => {
              const copy = { ...s };
              delete copy[id];
              return copy;
            });
            toast.success("Question deleted");
            setAlertOpen(false);
          } else {
            toast.error("Failed to delete");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete");
        } finally {
          setDeleteLoading(false);
        }
      }
    });
    setAlertOpen(true);
  };

  const confirmBulkDelete = () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) {
      toast.warning("Select questions to delete");
      return;
    }

    setAlertConfig({
      title: `Delete ${ids.length} Questions`,
      desc: "Are you sure you want to delete the selected questions? This action cannot be undone.",
      action: async () => {
        try {
          setDeleteLoading(true);
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/assessments/library/bulk-delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ids })
          });

          if (res.ok) {
            setQuestions((prev) => prev.filter((q) => !ids.includes(q.id)));
            setSelectedIds({});
            toast.success("Questions deleted");
            setAlertOpen(false);
          } else {
            toast.error("Failed to bulk delete");
          }
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete selected");
        } finally {
          setDeleteLoading(false);
        }
      }
    });
    setAlertOpen(true);
  };

  // Manual Mode
  const handleSaveManual = async (q: ManualQuestion) => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        question: q.question,
        options: q.options,
        correct_answer: ["A", "B", "C", "D"][q.correctOptionIndex ?? 0],
        difficulty: q.difficulty || "Intermediate",
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
        fetchLibrary(page);
        toast.success("Question added to library");
      } else {
        toast.error("Failed to add question to library");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding question");
    }
  };

  // Ai Mode
  const handleGenerateAI = async (config: AiGenerationConfig) => {
    try {
      const token = localStorage.getItem("token");

      const sets = config.rows.map(r => {
        const numQ = parseInt(r.numQuestions) || 0;
        const score = parseInt(r.scorePerQuestion) || 0;
        if (r.category === "Aptitude based") {
          return {
            topic: r.section,
            "Sub-topic": [r.subTopic],
            "Difficulty Level": r.difficulty,
            "Number of Questions": numQ,
            score_per_question: score,
          };
        } else {
          return {
            "Sub-domain": config.subDomains,
            "Difficulty Level": r.difficulty,
            "Number of Questions": numQ,
            score_per_question: score,
          };
        }
      });

      const payload = {
        creationType: "ai",
        is_library_item: true, // Signal to backend
        aiMetadata: {
          test_name: config.assessmentName,
          question_categories: [
            config.categories.domain && "Domain Based",
            config.categories.aptitude && "Aptitude Based"
          ].filter(Boolean),
          domain: config.domain,
          sets
        }
      };

      const res = await fetch(`${API_BASE_URL}/assessments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const responseData = await res.json();
        const finalId = responseData.assessment_id || responseData._id || responseData.id || responseData.data?._id;
        toast.success("Questions generated! Preview them below.");
        if (finalId) {
          router.push(`/dashboard/assessment/${finalId}/qna`);
        } else {
          fetchLibrary(1);
        }
      } else {
        const json = await res.json();
        toast.error(json.message || "Failed to generate questions");
        throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleEditSave = async (updated: LibraryQuestion) => {
    try {
      setIsSavingEdit(true);
      // Simulate save
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      setEditOpen(false);
      setEditing(null);
      toast.success("Changes saved (local)");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const openEdit = (q: LibraryQuestion) => {
    setEditing(q);
    setEditOpen(true);
  };

  const totalPages = Math.max(1, Math.ceil((totalCount || questions.length) / PAGE_SIZE));

  return (
    <div className="w-full min-h-screen bg-[#F1F1F1]">
      <div className="max-w-[1400px] mx-auto px-6 py-8 flex gap-8 items-start">

        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">

          <div className="flex items-center justify-between mt-4">
            <h2 className="text-2xl font-semibold">Your Saved Questions <span className="ml-3 inline-block bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm"> {totalCount} Saved</span></h2>

            <div className="flex items-center gap-3">
              <button
                onClick={confirmBulkDelete}
                className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>

              <button
                onClick={() => toast.info("Import feature coming soon")}
                className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Import
              </button>

              <button
                onClick={() => setIsAddSidebarOpen(true)}
                className="flex items-center gap-2 bg-[#071526] text-white px-4 py-2 rounded-md"
              >
                <Plus size={16} /> Add Question
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-5">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#071526]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-gray-400">No questions found.</div>
              ) : (
                filtered.map((q) => {
                  return (
                    <QuestionCard
                      key={q.id}
                      index={questions.indexOf(q)}
                      question={q.question}
                      score={q.question_score}
                      difficulty={q.difficulty}
                      topic={q.topic}
                      selectable={true}
                      isSelected={!!selectedIds[q.id]}
                      onSelect={() => toggleSelect(q.id)}
                      onClick={() => openEdit(q)} // Clicking card triggers edit
                      actions={
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteQuestion(q.id);
                          }}
                          className="text-red-500 p-2 rounded-md hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      }
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">Pages {page} of {totalPages}</div>

            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 border rounded-md">‹</button>
              <div className="px-3 py-2 bg-[#071526] text-white rounded-md">{page}</div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 border rounded-md">›</button>
            </div>
          </div>
        </div>

        <div className="w-[320px]">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-medium">Filter</div>
              <button
                onClick={() => {
                  setFilterAptTopics([]);
                  setFilterAptSubTopics([]);
                  setFilterDomains([]);
                  setFilterDifficulties([]);
                }}
                className="text-green-600 text-sm"
              >
                Clear Filter
              </button>
            </div>

            <Accordion label="Aptitude Topic">
              <div className="space-y-2 py-2">
                {allTopics.length === 0 ? (
                  <div className="text-sm text-gray-400">No topics</div>
                ) : allTopics.map((t) => (
                  <label key={t} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filterAptTopics.includes(t)}
                      onChange={() => {
                        setFilterAptTopics((prev) => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
                      }}
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </Accordion>

            <Accordion label="Aptitude Sub Topic">
              <div className="space-y-2 py-2">
                {allSubTopics.length === 0 ? (
                  <div className="text-sm text-gray-400">No subtopics</div>
                ) : allSubTopics.map((s) => (
                  <label key={s} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filterAptSubTopics.includes(s)}
                      onChange={() => {
                        setFilterAptSubTopics((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
                      }}
                    />
                    <span className="text-sm">{s}</span>
                  </label>
                ))}
              </div>
            </Accordion>

            <Accordion label="Domain">
              <div className="space-y-2 py-2">
                {allTopics.length === 0 ? (
                  <div className="text-sm text-gray-400">No domains</div>
                ) : allTopics.map((d) => (
                  <label key={d} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filterDomains.includes(d)}
                      onChange={() => {
                        setFilterDomains((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
                      }}
                    />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </Accordion>

            <Accordion label="Difficulty">
              <div className="space-y-2 py-2">
                {allDifficulties.length === 0 ? (
                  <div className="text-sm text-gray-400">No difficulties</div>
                ) : allDifficulties.map((d) => (
                  <label key={d} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={filterDifficulties.includes(d)}
                      onChange={() => {
                        setFilterDifficulties((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
                      }}
                    />
                    <span className="text-sm">{d}</span>
                  </label>
                ))}
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      {isAddSidebarOpen && (
        <LibraryAddSidebar
          isOpen={isAddSidebarOpen}
          onClose={() => setIsAddSidebarOpen(false)}
          onSaveManual={handleSaveManual}
          onGenerateAI={handleGenerateAI}
          defaultTopic={filterDomains[0] || ""}
        />
      )}

      {editOpen && editing && (
        <EditDrawer
          question={editing}
          onClose={() => { setEditOpen(false); setEditing(null); }}
          onSave={(u) => handleEditSave(u)}
          saving={isSavingEdit}
        />
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={alertConfig.action}
        title={alertConfig.title}
        description={alertConfig.desc}
        loading={deleteLoading}
      />
    </div>
  );
}

function Accordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <div className="font-medium">{label}</div>
        <div className="text-gray-400">{open ? "˄" : "˅"}</div>
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

function EditDrawer({
  question,
  onClose,
  onSave,
  saving,
}: {
  question: LibraryQuestion;
  onClose: () => void;
  onSave: (q: LibraryQuestion) => Promise<void> | void;
  saving?: boolean;
}) {
  const [local, setLocal] = useState<LibraryQuestion>(question);

  useEffect(() => {
    setLocal(question);
  }, [question]);

  const setOpt = (idx: number, val: string) => {
    const opts = [...(local.options || [])];
    opts[idx] = val;
    setLocal({ ...local, options: opts });
  };

  const setCorrectByIndex = (idx: number) => {
    const label = ["A", "B", "C", "D"][idx] || "A";
    setLocal({ ...local, correct_answer: label });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[520px] bg-white shadow-2xl z-50 overflow-auto animate-in slide-in-from-right-5 border-l">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Edit Question</div>
          <div className="text-sm text-gray-500 mt-1">{local.topic ?? ""} • {local.question_type ?? "MCQ"} • Single Correct Answer</div>
        </div>
        <button onClick={onClose} className="p-2 rounded hover:bg-gray-50"><X size={20} /></button>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Question:</div>
          <textarea
            value={local.question}
            onChange={(e) => setLocal({ ...local, question: e.target.value })}
            className="w-full border rounded p-3 min-h-[80px]"
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-medium">Choices</div>
        </div>

        <div className="space-y-3">
          {(local.options || ["", "", "", ""]).map((opt, i) => {
            const isCorrect = local.correct_answer === (["A", "B", "C", "D"][i] || "A");
            return (
              <div key={i} className={`flex items-center gap-3 border rounded p-2 ${isCorrect ? "border-green-200 bg-green-50" : "bg-white"}`}>
                <div className="cursor-move">⋮⋮</div>
                <input
                  type="radio"
                  checked={isCorrect}
                  onChange={() => setCorrectByIndex(i)}
                />
                <input
                  value={opt}
                  onChange={(e) => setOpt(i, e.target.value)}
                  className="flex-1 border-b focus:outline-none p-2"
                />
                <button onClick={() => {
                  const opts = [...(local.options || [])];
                  opts.splice(i, 1);
                  setLocal({ ...local, options: opts });
                }} className="text-gray-400 px-2">✕</button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 border rounded p-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Score*</div>
              <input type="number" value={local.question_score ?? ""} onChange={(e) => setLocal({ ...local, question_score: Number(e.target.value) })} className="w-full border rounded p-2" />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Difficulty*</div>
              <select value={local.difficulty || ""} onChange={(e) => setLocal({ ...local, difficulty: e.target.value })} className="w-full border rounded p-2">
                <option value="">Select</option>
                <option value="Easy">Easy</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Topic</div>
              <input value={local.topic ?? ""} onChange={(e) => setLocal({ ...local, topic: e.target.value })} className="w-full border rounded p-2" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2 border rounded-md">Cancel</button>
          <button
            onClick={() => onSave(local)}
            disabled={saving}
            className="px-5 py-2 bg-[#071526] text-white rounded-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
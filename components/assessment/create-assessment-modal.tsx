"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/config";
import { AssessmentRow } from "@/components/assessment/assessment-row";

type Row = {
  id: string;
  subTopic: string;
  typeOfQuestion: string;
  difficulty: string;
  numQuestions: string;
  scorePerQuestion: string;
  category?: string; 
  section?: string;
};

export default function CreateAssessmentModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [assessmentName, setAssessmentName] = useState("");
  const [categories, setCategories] = useState({
    domain: false,
    aptitude: false,
    soft: false,
  });

  const isCombinedMode = categories.domain && categories.aptitude;

  const [selectedDomain, setSelectedDomain] = useState(""); // Single modes
  const [domainSelection, setDomainSelection] = useState(""); // Combined: Domain Topic
  const [selectedSubDomains, setSelectedSubDomains] = useState<string[]>([]);

  const [method, setMethod] = useState<"ai" | "manual" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [rows, setRows] = useState<Row[]>([
    {
      id: crypto.randomUUID(),
      subTopic: "",
      typeOfQuestion: "",
      difficulty: "",
      numQuestions: "",
      scorePerQuestion: "",
      category: "Domain based",
    },
  ]);

  const [rawMeta, setRawMeta] = useState<any>(null);
  const [domainOptions, setDomainOptions] = useState<string[]>([]);
  const [aptOptions, setAptOptions] = useState<string[]>([]);
  const [softOptions, setSoftOptions] = useState<string[]>([]);

  const questionTypes = ["MCQ Single Correct Answer"];
  const difficulties = ["Easy", "Medium", "Hard"];

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/assessments/categories`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const json = await res.json();
        const data = json?.data || json;
        if (!mounted) return;
        setRawMeta(data);

        if (Array.isArray(data?.["Domain Based"])) {
          setDomainOptions(data["Domain Based"].map((d: any) => d.name));
        }
        if (Array.isArray(data?.["Aptitude Based"])) {
          setAptOptions(data["Aptitude Based"].map((d: any) => d.name));
        }
        if (Array.isArray(data?.["Soft Skills Based"])) {
          setSoftOptions(data["Soft Skills Based"].map((d: any) => d.name));
        }
      } catch (err) {
        console.error("Load categories err:", err);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  const suggestionsForDomain = (domainName: string): string[] => {
    if (!rawMeta || !domainName) return [];
    const list = rawMeta["Domain Based"] as any[] | undefined;
    if (!Array.isArray(list)) return [];
    const found = list.find(
      (d: any) =>
        String(d.name).toLowerCase() === String(domainName).toLowerCase()
    );
    if (!found) return [];
    return Array.isArray(found.sub_items) ? found.sub_items : [];
  };

  const addSubDomain = (s: string) => {
    if (!selectedSubDomains.includes(s))
      setSelectedSubDomains((prev) => [...prev, s]);
  };

  const removeSub = (s: string) => {
    setSelectedSubDomains((prev) => prev.filter((x) => x !== s));
  };

  const addRow = () => {
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        subTopic: "",
        typeOfQuestion: "",
        difficulty: "",
        numQuestions: "",
        scorePerQuestion: "",
        category: isCombinedMode
          ? "Domain based"
          : categories.domain
          ? "Domain based"
          : categories.aptitude
          ? "Aptitude based"
          : undefined,
        section: "",
      },
    ]);
    setTimeout(
      () =>
        contentRef.current &&
        (contentRef.current.scrollTop = contentRef.current.scrollHeight),
      80
    );
  };

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows((r) =>
      r.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );

  const removeRow = (id: string) =>
    setRows((r) => r.filter((x) => x.id !== id));

  const handleCategoryChange = (which: "domain" | "aptitude" | "soft") => {
    setCategories((prev) => {
      if (which === "soft")
        return { domain: false, aptitude: false, soft: !prev.soft };
      return { ...prev, [which]: !prev[which], soft: false };
    });
    setSelectedDomain("");
    setDomainSelection("");
    setSelectedSubDomains([]);
    setRows([
      {
        id: crypto.randomUUID(),
        subTopic: "",
        typeOfQuestion: "",
        difficulty: "",
        numQuestions: "",
        scorePerQuestion: "",
        category:
          which === "domain"
            ? "Domain based"
            : which === "aptitude"
            ? "Aptitude based"
            : "Domain based",
      },
    ]);
  };

  useEffect(() => {
    if (!method || method !== "ai") return;
    if (isCombinedMode) return;

    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        category: categories.domain
          ? "Domain based"
          : categories.aptitude
          ? "Aptitude based"
          : undefined, // soft skills no category
      }))
    );
  }, [categories, isCombinedMode, method]);

  // Map UI State to Backend Payload for AI
  const buildPayload = () => {
    const sets: any[] = [];

    // Combined Mode
    if (isCombinedMode) {
      rows.forEach((r) => {
        const numQ = parseInt(r.numQuestions) || 0;
        const score = parseInt(r.scorePerQuestion) || 0;

        if (!r.difficulty || numQ === 0 || score === 0) return;

        if (r.category === "Aptitude based") {
          // Aptitude Logic: topic + Sub-topic
          if (r.section && r.subTopic) {
            sets.push({
              topic: r.section,
              "Sub-topic": [r.subTopic],
              "Difficulty Level": r.difficulty,
              "Number of Questions": numQ,
              score_per_question: score,
            });
          }
        } else {
          // Domain Logic: Sub-domain from global selection
          if (domainSelection && selectedSubDomains.length > 0) {
            sets.push({
              "Sub-domain": selectedSubDomains,
              "Difficulty Level": r.difficulty,
              "Number of Questions": numQ,
              score_per_question: score,
            });
          }
        }
      });
      return sets;
    }

    // Single Modes (Domain / Aptitude / Soft)
    const setsLegacy: any[] = [];

    const pushSetLegacy = (topic: string, subItems: string[], row: Row) => {
      const numQ = parseInt(row.numQuestions) || 0;
      const score = parseInt(row.scorePerQuestion) || 0;
      if (!numQ || !score || !row.difficulty) return;
      setsLegacy.push({
        topic: topic,
        "Sub-topic": subItems,
        "Sub-domain": subItems,
        "Difficulty Level": row.difficulty,
        "Number of Questions": numQ,
        score_per_question: score,
      });
    };

    if (categories.domain) {
      rows.forEach((r) => pushSetLegacy(selectedDomain, selectedSubDomains, r));
    }

    if (categories.aptitude || categories.soft) {
      rows.forEach((r) =>
        r.subTopic ? pushSetLegacy(selectedDomain, [r.subTopic], r) : null
      );
    }

    return setsLegacy;
  };

  const handleSubmit = async () => {
    try {
      setSubmitted(true);

      const isDomainActive = categories.domain;
      const isAptActive = categories.aptitude;
      const isSoftActive = categories.soft;

      // Assessment name
      if (!assessmentName.trim()) {
        toast.error("Assessment Name is required.");
        return;
      }

      // Category selection
      if (!isDomainActive && !isAptActive && !isSoftActive) {
        toast.error("Please select at least one question category.");
        return;
      }

      if (method === null) {
        toast.error("Please select a method (AI or Manual).");
        return;
      }

      const mainDomain = isCombinedMode ? domainSelection : selectedDomain;

      // AI MODE
      if (method === "ai") {
        // Domain / Section validation
        if (isCombinedMode) {
          if (!domainSelection) {
            toast.error("Please select a Domain Topic.");
            return;
          }
        } else {
          if ((isDomainActive || isAptActive || isSoftActive) && !mainDomain) {
            if (isDomainActive) {
              toast.error("Please select an Assessment Domain.");
            } else if (isAptActive) {
              toast.error("Please select a Section.");
            } else if (isSoftActive) {
              toast.error("Please select a Section.");
            } else {
              toast.error("Please select a Domain/Section.");
            }
            return;
          }
        }

        // Sub-topics validation for Domain-based flows
        if (isDomainActive && !isCombinedMode && selectedSubDomains.length === 0) {
          toast.error("Please select at least one Sub Topic.");
          return;
        }

        if (isCombinedMode) {
          const hasDomainRow = rows.some((r) => r.category === "Domain based");
          if (hasDomainRow && selectedSubDomains.length === 0) {
            toast.error(
              "Please select at least one Domain Sub-topic from the top section."
            );
            return;
          }
        }

        // Row-level validation
        const isRowDisabled = (_row: Row) => {
          return false;
        };

        for (const r of rows) {
          if (!isRowDisabled(r)) {
            if (!r.typeOfQuestion) {
              toast.error("Please select Type of questions for all rows.");
              return;
            }
            if (!r.difficulty) {
              toast.error("Please select Difficulty level for all rows.");
              return;
            }
            if (!r.numQuestions) {
              toast.error("Please enter No. of questions for all rows.");
              return;
            }
            if (!r.scorePerQuestion) {
              toast.error("Please enter Score per question for all rows.");
              return;
            }

            // Combined Aptitude-based rows -> need Section + Sub Topic
            if (
              isCombinedMode &&
              r.category === "Aptitude based" &&
              (!r.section || !r.subTopic)
            ) {
              toast.error(
                "Please select Section and Sub Topic for all Aptitude based rows."
              );
              return;
            }
          }
        }

        const selectedOptions = [
          isDomainActive && "Domain Based",
          isAptActive && "Aptitude Based",
          isSoftActive && "Soft Skills",
        ].filter(Boolean) as string[];

        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You are not logged in.");
          return;
        }

        const sets = buildPayload();
        if (!sets.length) {
          toast.error("Please configure at least one question set.");
          return;
        }

        // Payload
        const payload: any = {
          creationType: "ai",
          aiMetadata: {
            test_name: assessmentName,
            question_categories: selectedOptions,
            domain: mainDomain,
            sets,
          },
        };

        setIsLoading(true);

        const res = await fetch(`${API_BASE_URL}/assessments/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const responseData = await res.json();

        if (!res.ok) {
          console.error("API Error:", responseData);
          const msg =
            responseData.errors && Array.isArray(responseData.errors)
              ? responseData.errors.map((e: any) => e.message).join(", ")
              : responseData.message || "Validation failed from server.";
          throw new Error(msg);
        }

        const finalId =
          responseData.assessment_id ||
          responseData._id ||
          responseData.id ||
          responseData.data?._id;

        toast.success("Assessment with QnA generated successfully!");
        if (onSuccess) onSuccess();
        onClose();
        if (finalId) {
          router.push(`/dashboard/assessment/${finalId}/qna`);
        }
        return;
      }

      // MANUAL MODE
      if (!mainDomain) {
        toast.error("Please select a Domain/Section.");
        return;
      }

      if (isCombinedMode && selectedSubDomains.length === 0) {
        toast.error("Please select at least one Domain Sub-topic.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in.");
        return;
      }

      const selectedOptions = [
        isDomainActive && "Domain Based",
        isAptActive && "Aptitude Based",
        isSoftActive && "Soft Skills",
      ].filter(Boolean) as string[];

      const payload: any = {
        test_name: assessmentName,
        test_categories: selectedOptions,
        domain: mainDomain,
        creationType: "manual",
      };

      if ((isCombinedMode || categories.domain) && selectedSubDomains.length) {
        payload.test_subtopics = selectedSubDomains;
      }

      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/assessments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        console.error("API Error:", responseData);
        const msg =
          responseData.errors && Array.isArray(responseData.errors)
            ? responseData.errors.map((e: any) => e.message).join(", ")
            : responseData.message || "Creation failed";
        throw new Error(msg);
      }

      const finalId =
        responseData.assessment_id ||
        responseData._id ||
        responseData.id ||
        responseData.data?._id;

      toast.success(
        "Assessment generated successfully! You can now add QnA manually."
      );
      if (onSuccess) onSuccess();
      onClose();
      if (finalId) {
        router.push(`/dashboard/assessment/${finalId}/qna`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error generating assessment.");
    } finally {
      setIsLoading(false);
    }
  };

  const isAnyCategorySelected =
    categories.domain || categories.aptitude || categories.soft;

  const activeMode: "domain" | "aptitude" | "soft" =
    isCombinedMode
      ? "domain"
      : categories.domain
      ? "domain"
      : categories.aptitude
      ? "aptitude"
      : categories.soft
      ? "soft"
      : "domain";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
      <div className="bg-white w-[55%] max-w-[1200px] h-auto max-h-[90vh] rounded-2xl relative shadow-xl overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 hover:bg-gray-100 rounded-full cursor-pointer"
        >
          <X size={22} />
        </button>

        <div ref={contentRef} className="w-full overflow-y-auto p-8 flex-1">
          <div className="px-1 pb-4">
            <h1 className="text-3xl font-semibold">Create New Assessment</h1>
            <p className="text-gray-600 mt-2 max-w-[900px]">
              Build assessments using AI or manually. Choose domains, topics,
              and question difficulty with ease.
            </p>

            {/* Assessment Name */}
            <div className="mt-6">
              <label className="block font-medium">Assessment Name</label>
              <Input
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="e.g., Data Analyst Assessment"
                className={`mt-2 w-full ${
                  submitted && !assessmentName ? "border-red-500" : ""
                }`}
              />
            </div>

            {/* Category selection */}
            <div className="mt-6">
              <label className="font-medium block">
                Which category of questions do you want to include?
              </label>
              <p className="text-gray-500 text-sm mt-1">
                (You can create using both types)
              </p>
              <div className="flex items-center gap-8 mt-4">
                {(["domain", "aptitude", "soft"] as const).map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-3 cursor-pointer capitalize"
                  >
                    <input
                      type="checkbox"
                      checked={categories[cat]}
                      onChange={() => handleCategoryChange(cat)}
                      disabled={
                        cat === "soft"
                          ? categories.domain || categories.aptitude
                          : categories.soft
                      }
                      className="accent-[#071526] w-4 h-4"
                    />
                    <span>
                      {cat === "soft" ? "Soft Skills" : `${cat} Based`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Method Selection */}
            {isAnyCategorySelected && (
              <div className="mt-6">
                <label className="font-medium block">
                  How would you like to add questions?
                </label>
                <div className="flex gap-6 mt-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method-main"
                      checked={method === "ai"}
                      onChange={() => {
                        setMethod("ai");
                        setRows([
                          {
                            id: crypto.randomUUID(),
                            subTopic: "",
                            typeOfQuestion: "",
                            difficulty: "",
                            numQuestions: "",
                            scorePerQuestion: "",
                            category: isCombinedMode
                              ? "Domain based"
                              : categories.domain
                              ? "Domain based"
                              : categories.aptitude
                              ? "Aptitude based"
                              : undefined,
                          },
                        ]);
                      }}
                      className="accent-[#071526]"
                    />
                    <span>Use AI</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="method-main"
                      checked={method === "manual"}
                      onChange={() => {
                        setMethod("manual");
                        setRows([]);
                      }}
                      className="accent-[#071526]"
                    />
                    <span>Manually</span>
                  </label>
                </div>
              </div>
            )}

            {/* Dynamic Forms */}
            {isAnyCategorySelected && method && (
              <div className="mt-6 border-t pt-6">
                {/* Domain / Section select */}
                <div>
                  <label className="font-medium block mb-2">
                    {isCombinedMode ? "Domain Topic" : "Assessment Domain"}
                    <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={isCombinedMode ? domainSelection : selectedDomain}
                    onValueChange={(val) => {
                      if (isCombinedMode) setDomainSelection(val);
                      else setSelectedDomain(val);
                      setSelectedSubDomains([]);
                    }}
                  >
                    <SelectTrigger className="h-11 bg-white w-full">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(isCombinedMode
                        ? domainOptions
                        : categories.domain
                        ? domainOptions
                        : categories.aptitude
                        ? aptOptions
                        : softOptions
                      ).map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Topics (Domain Only or Combined) */}
                {(categories.domain || isCombinedMode) && (
                  <div className="mt-4">
                    <label className="font-medium block">
                      Sub Topic <span className="text-red-600">*</span>
                    </label>
                    <div className="mt-2 border rounded-md p-3 min-h-[48px] bg-white flex flex-wrap gap-2">
                      {selectedSubDomains.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border border-[#071526] bg-green-50 text-[#071526]"
                        >
                          {tag}
                          <button
                            onClick={() => removeSub(tag)}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {selectedSubDomains.length === 0 && (
                        <span className="text-gray-400 text-sm py-1">
                          Select sub-topics...
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Add atleast 1 topic to make more precise and targeted
                      assessments
                    </p>

                    <div className="border rounded-md p-4 min-h-[120px] bg-gray-50 mt-3">
                      {(isCombinedMode ? domainSelection : selectedDomain) && (
                        <p className="text-gray-500 text-sm mb-3">
                          Suggestions Based on your domain
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {(isCombinedMode ? domainSelection : selectedDomain) ? (
                          suggestionsForDomain(
                            isCombinedMode ? domainSelection : selectedDomain
                          ).map((s) => {
                            const selected = selectedSubDomains.includes(s);
                            return (
                              <button
                                key={s}
                                onClick={() =>
                                  selected ? removeSub(s) : addSubDomain(s)
                                }
                                className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                                  selected
                                    ? "bg-[#071526] text-white border-[#071526]"
                                    : "bg-white text-[#071526] border-[#9ed6c6] hover:bg-green-50"
                                }`}
                              >
                                {selected ? s : `+ ${s}`}
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-gray-500 text-sm">
                            Select a domain to see suggestions
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Configuration Rows */}
                {method === "ai" && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-1">
                      Add Category-wise question details
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Configure difficulty and count for AI generation.
                    </p>

                    <div className="space-y-4">
                      {rows.map((r) => (
                        <AssessmentRow
                          key={r.id}
                          row={r}
                          isCombinedMode={isCombinedMode}
                          mode={activeMode}
                          showCategory={isCombinedMode} 
                          meta={{
                            questionTypes,
                            difficulties,
                            aptOptions,
                            softOptions,
                            rawMeta,
                            selectedDomain,
                          }}
                          onUpdate={updateRow}
                          onRemove={removeRow}
                          showErrors={submitted}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual mode configuration */}
                {method === "manual" && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      Type of Question
                    </h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={true}
                        readOnly
                        className="peer h-4 w-4 accent-[#071526]"
                      />
                      <span>MCQ Single Correct Answer</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {isAnyCategorySelected && method && (
          <div className="w-full bg-white border-t px-6 py-4 flex items-center justify-between z-30 shrink-0">
            {method === "ai" ? (
              <button
                onClick={() => setRows([])}
                className="text-red-600 flex items-center gap-2 font-medium hover:underline text-sm"
              >
                <Trash2 size={18} /> Delete all questons
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-4">
              {method === "ai" && (
                <button
                  onClick={addRow}
                  className="px-5 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Add Question
                </button>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-[#071526] text-white rounded-md text-sm font-medium hover:bg-[#094d41] transition-colors"
              >
                {isLoading && (
                  <Loader2 className="animate-spin mr-2" size={16} />
                )}
                {method === "ai" ? "Generate Question" : "Generate Question"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

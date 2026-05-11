"use client";

import React from "react";
import { Trash2 } from "lucide-react";

type Props = {
  row: any;
  isCombinedMode: boolean;

  mode: "domain" | "aptitude" | "soft";
  showCategory: boolean;

  meta: {
    questionTypes: string[];
    difficulties: string[];
    aptOptions: string[];
    softOptions: string[];
    rawMeta: any;
    selectedDomain: string;
  };

  onUpdate: (id: string, patch: any) => void;
  onRemove: (id: string) => void;
  showErrors: boolean;
};

export const AssessmentRow = ({
  row,
  isCombinedMode,
  mode,
  showCategory,
  meta,
  onUpdate,
  onRemove,
  showErrors,
}: Props) => {
  const {
    questionTypes,
    difficulties,
    aptOptions,
    softOptions,
    rawMeta,
    selectedDomain,
  } = meta;

  const handleChange = (patch: any) => {
    onUpdate(row.id, patch);
  };

  const isAptitudeCombinedRow =
    isCombinedMode && row.category === "Aptitude based";

  const currentAptSubtopics = (() => {
    if (isAptitudeCombinedRow && row.section) {
      return (
        rawMeta?.["Aptitude Based"]?.find(
          (sec: any) => sec.name === row.section
        )?.sub_items || []
      );
    }
    return [];
  })();

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5 shadow-sm space-y-5">
      
      {showCategory && isCombinedMode && (
        <div className="flex justify-between items-start mb-2">
          <div className="w-1/3">
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Category of question <span className="text-red-500">*</span>
            </label>

            <select
              value={row.category}
              onChange={(e) =>
                handleChange({
                  category: e.target.value,
                  section: "",
                  subTopic: "",
                })
              }
              className="w-full border rounded-md p-2 text-sm bg-white"
            >
              <option value="Domain based">Domain based</option>
              <option value="Aptitude based">Aptitude based</option>
            </select>
          </div>

          <button
            onClick={() => onRemove(row.id)}
            className="p-2 border rounded hover:bg-red-50 text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {isAptitudeCombinedRow && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Section <span className="text-red-500">*</span>
            </label>

            <select
              value={row.section || ""}
              onChange={(e) =>
                handleChange({ section: e.target.value, subTopic: "" })
              }
              className={`border rounded-md p-2 text-sm bg-white w-full ${
                showErrors && !row.section ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {aptOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Sub Topic <span className="text-red-500">*</span>
            </label>

            <select
              value={row.subTopic}
              onChange={(e) => handleChange({ subTopic: e.target.value })}
              disabled={!row.section}
              className={`border rounded-md p-2 text-sm bg-white w-full ${
                showErrors && !row.subTopic ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>
              {currentAptSubtopics.map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {!isCombinedMode && (mode === "aptitude" || mode === "soft") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              Sub Topic <span className="text-red-500">*</span>
            </label>

            <select
              value={row.subTopic}
              onChange={(e) => handleChange({ subTopic: e.target.value })}
              className={`border rounded-md p-2 text-sm bg-white w-full ${
                showErrors && !row.subTopic ? "border-red-500" : ""
              }`}
            >
              <option value="">Select</option>

              {(rawMeta?.[
                mode === "aptitude"
                  ? "Aptitude Based"
                  : "Soft Skills Based"
              ]?.find((sec: any) => sec.name === selectedDomain)?.sub_items ||
                []
              ).map((s: string) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4 items-start">
        
        <div className="min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Type of questions <span className="text-red-500">*</span>
          </label>

          <select
            value={row.typeOfQuestion}
            onChange={(e) => handleChange({ typeOfQuestion: e.target.value })}
            className={`w-full border rounded-md p-2 text-sm bg-white ${
              showErrors && !row.typeOfQuestion ? "border-red-500" : ""
            }`}
          >
            <option value="">Select</option>
            {questionTypes.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Difficulty level <span className="text-red-500">*</span>
          </label>

          <select
            value={row.difficulty}
            onChange={(e) => handleChange({ difficulty: e.target.value })}
            className={`w-full border rounded-md p-2 text-sm bg-white ${
              showErrors && !row.difficulty ? "border-red-500" : ""
            }`}
          >
            <option value="">Select</option>
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            No. of questions <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            value={row.numQuestions}
            onChange={(e) => handleChange({ numQuestions: e.target.value })}
            className={`w-full border rounded-md p-2 text-sm ${
              showErrors && !row.numQuestions ? "border-red-500" : ""
            }`}
            placeholder="Write here"
          />
        </div>

        <div className="min-w-0">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">
            Score per question <span className="text-red-500">*</span>
          </label>

          <input
            type="number"
            value={row.scorePerQuestion}
            onChange={(e) =>
              handleChange({ scorePerQuestion: e.target.value })
            }
            className={`w-full border rounded-md p-2 text-sm ${
              showErrors && !row.scorePerQuestion ? "border-red-500" : ""
            }`}
            placeholder="Write here"
          />
        </div>

        <div className="flex items-center justify-end">
          {!isCombinedMode && (
            <button
              onClick={() => onRemove(row.id)}
              className="p-2 border rounded hover:bg-red-50 text-red-500"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

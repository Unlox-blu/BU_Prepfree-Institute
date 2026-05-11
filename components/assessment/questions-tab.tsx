import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function QuestionsTab({ questions }: { questions: any[] }) {
  if (!questions || questions.length === 0) {
    return <div className="bg-white p-10 rounded-xl text-center text-gray-500 border border-gray-200">No questions found.</div>;
  }

  return (
    <div className="mt-6 space-y-4">
      {questions.map((q, index) => (
        <Card key={q.mcq_id || index} className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{index + 1}</span>
                <h3 className="text-base font-medium text-gray-900 mt-0.5">{q.question}</h3>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-100">{q.difficulty_level || "Medium"}</Badge>
                <Badge variant="outline" className="text-xs">{q.question_score} Marks</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-9">
              {["A", "B", "C", "D"].map((optKey) => {
                const isCorrect = q.correct_answer === optKey;
                let optionText = "";
                if (Array.isArray(q.options)) {
                  optionText = q.options[["A", "B", "C", "D"].indexOf(optKey)] || "";
                } else if (q.options && typeof q.options === "object") {
                  optionText = q.options[optKey] || "";
                }
                return (
                  <div key={optKey} className={`relative p-3 rounded-lg border text-sm flex items-center gap-3 ${isCorrect ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}`}>
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${isCorrect ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>{optKey}</span>
                    <span className={isCorrect ? "font-medium text-gray-900" : "text-gray-600"}>{optionText}</span>
                    {isCorrect && <CheckCircle2 className="absolute right-3 text-green-600" size={16} />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
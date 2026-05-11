import { Badge } from "@/components/ui/badge";
import { Bookmark, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  index: number;
  question: string;
  options?: string[]; 
  score?: number;
  difficulty?: string;
  topic?: string;
  subTopic?: string;
  actions?: React.ReactNode;
  selectable?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
  onClick?: () => void;
  showBookmark?: boolean;
  onBookmark?: () => void;
}

export function QuestionCard({
  index,
  question,
  score,
  difficulty,
  topic,
  subTopic,
  actions,
  selectable,
  onSelect,
  isSelected,
  onClick,
  showBookmark = false,
  onBookmark
}: QuestionCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-3 transition-all duration-200",
        onClick ? "cursor-pointer hover:border-[#071526] hover:shadow-md group" : ""
      )}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-start gap-3 w-full">
          {selectable && (
             <input 
               type="checkbox" 
               checked={isSelected} 
               onChange={(e) => {
                 e.stopPropagation();
                 onSelect?.();
               }} 
               className="mt-1 shrink-0 cursor-pointer" 
             />
          )}
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-semibold shrink-0 group-hover:bg-[#EEF1F8] group-hover:text-[#071526] transition-colors">
            {index + 1}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="text-gray-800">
              <span className="font-medium text-gray-500 mr-2">Q:</span>
              <span className="text-base font-medium text-gray-900 leading-relaxed">
                {question || <em className="text-gray-400">No question text</em>}
              </span>
            </div>
            
            <div className="flex gap-2 items-center mt-3 flex-wrap">
              {score !== undefined && (
                <Badge variant="secondary" className="bg-gray-50 border text-gray-600 font-normal">
                  {score} Marks
                </Badge>
              )}
              {difficulty && (
                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-normal">
                  {difficulty}
                </Badge>
              )}
              {topic && (
                <Badge variant="outline" className="text-gray-600 bg-white font-normal">
                  {topic}
                </Badge>
              )}
              {subTopic && (
                <Badge variant="outline" className="text-gray-500 bg-gray-50 border-gray-200 font-normal">
                  {subTopic}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {showBookmark && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-[#071526] hover:bg-[#EEF1F8]"
              onClick={onBookmark}
              title="Save to Library"
            >
              <Bookmark size={18} />
            </Button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
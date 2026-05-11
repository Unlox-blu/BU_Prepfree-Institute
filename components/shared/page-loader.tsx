import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#071526]" size={32} />
    </div>
  );
}
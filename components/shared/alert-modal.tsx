"use client";
import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  variant?: "danger" | "default";
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#0B5B4D] hover:bg-[#094d41] text-white"
            }
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {variant === "danger" ? "Delete" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
};
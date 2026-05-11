"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Plus, X, Pencil, Pen } from "lucide-react";
import fileIcon from "@/public/images/profile/fileIcon.png";

interface FormData {
  skills: string[];
}

const SkillsSection = ({ data }: { data: FormData }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E1E1E] font-bold text-lg">Skills</h1>
      </div>

      {/* ---- STATE 3: Display ---- */}
      {data.skills.length > 0 && (
        <div className="flex flex-wrap gap-3 bg-white p-5 rounded-xl">
          {data.skills.map((skill, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-[#E7FEEE] text-black font-medium text-sm px-4 py-2 rounded-full"
            >
              <span>{skill}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsSection;

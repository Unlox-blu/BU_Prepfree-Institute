"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash, Camera, Delete, Pen } from "lucide-react";
import expIcon from "@/public/images/profile/expIcon.png";

interface Experience {
  id: number;
  media?: any;
  name: string;
  title: string;
  type: string;
  location: string;
  desc: string;
  startDate: string;
  endDate: string;
  currWorking: boolean;
}

interface FormData {
  experience: Experience[];
}

const ExperienceSection = ({
  data,
}: {
  data: FormData;
}) => {

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E1E1E] font-bold text-lg">Experience</h1>
      </div>

      {/* Cards */}
      {data.experience.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.experience.map((exp, idx) => (
            <div
              key={exp.id}
              className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-[#EDEDED] rounded-sm flex items-center justify-center">
                  {exp.media ? (
                    <Image src={exp.media} alt="experience" />
                  ) : (
                    <Image src={expIcon} alt="experience" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-md font-semibold text-[#1E1E1E]">
                    {exp.title}
                  </h2>
                  <p className="text-sm text-[#0B5B4D] font-semibold">
                    {exp.name}
                    <span className="text-xs text-[#616161] ml-2">
                      {exp.type}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-[#000000]/50">
                    {exp.startDate} -{" "}
                    {exp.currWorking ? "Present" : exp.endDate}
                  </p>
                  <p className="text-xs font-medium text-[#000000]/50">
                    {exp.location}
                  </p>
                  <p className="text-xs mt-1 font-medium text-[#000000]/50">
                    {exp.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;

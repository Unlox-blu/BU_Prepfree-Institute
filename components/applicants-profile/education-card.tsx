"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash, Camera, Pen } from "lucide-react";
import eduIcon from "@/public/images/profile/eduIcon.png";

interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  currWorking: boolean;
  activities: string;
  desc: string;
}

interface FormData {
  education: Education[];
}

const EducationSection = ({ data }: { data: FormData }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#0a0a14] font-bold text-lg">Education</h1>
      </div>

      {/* Cards */}
      {data.education.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.education.map((edu, idx) => (
            <div
              key={edu.id}
              className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-[#EDEDED] rounded-sm flex items-center justify-center">
                  <Image src={eduIcon} alt="experience" />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-md font-semibold text-[#0a0a14]">
                    {edu.school}
                  </h2>
                  <p className="text-sm font-semibold text-[#333]">
                    {edu.degree}:{edu.field}
                  </p>
                  <p className="text-xs font-medium text-[#777]">
                    {edu.startDate} -{" "}
                    {edu.currWorking ? "Present" : edu.endDate}
                  </p>
                  {edu.activities && (
                    <>
                      <p className="text-xs font-semibold mt-1">
                        Activities and societies
                      </p>
                      <p className="text-[10px] leading-[12px] font-medium text-[#777]">
                        {edu.activities}
                      </p>
                    </>
                  )}
                  {edu.activities && (
                    <>
                      <p className="text-xs font-semibold mt-1">Description</p>
                      <p className="text-[10px] leading-[12px] font-medium text-[#777]">
                        {edu.desc}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationSection;

"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash, Camera, Pen } from "lucide-react";
import projIcon from "@/public/images/profile/projectsIcon.png";

interface Projects {
  id: number;
  name: string;
  desc: string;
  media: any;
  startDate: string;
  endDate: string;
  currWorking: boolean;
}

interface FormData {
  projects: Projects[];
}

const ProjectsSection = ({
  data,
}: {
  data: FormData;
}) => {

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E1E1E] font-bold text-lg">Projects</h1>
      </div>

      {/* Cards */}
      {data.projects.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.projects.map((proj, idx) => (
            <div
              key={proj.id}
              className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-[#EDEDED] rounded-sm flex items-center justify-center">
                  <Image src={projIcon} alt="experience" />
                </div>
                <div className="flex flex-col gap-1 w-[75%]">
                  <h2 className="text-md font-semibold text-[#1E1E1E]">
                    {proj.name}
                  </h2>
                  <p className="text-sm text-black/50 font-medium">{proj.desc}</p>
                  <p className="text-sm text-black font-medium">
                    {proj.startDate} -{" "}
                    {proj.currWorking ? "Present" : proj.endDate}
                  </p>
                  {proj.media && (
                    <div className="bg-[#F8F8F8] rounded-md mt-1 w-[160px] h-[90px] flex items-center justify-center">
                      <img
                        src={proj.media}
                        alt="media"
                        className="w-full h-full object-cover"
                      />
                    </div>
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

export default ProjectsSection;

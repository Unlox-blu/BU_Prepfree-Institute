"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash, Camera, Pen } from "lucide-react";
import certIcon from "@/public/images/profile/certIcon.png";

interface Certification {
  id: number;
  name: string;
  org: string;
  credId: string;
  credUrl: string;
  startDate: string;
  endDate: string;
  media: any;
}

interface FormData {
  certification: Certification[];
}

const CertificationSection = ({ data }: { data: FormData }) => {
  return (
    <div className="w-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-[#1E1E1E] font-bold text-lg">Certification</h1>
      </div>

      {/* Cards */}
      {data.certification.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.certification.map((cert, idx) => (
            <div
              key={cert.id}
              className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-[#EDEDED] rounded-sm flex items-center justify-center">
                  <Image src={certIcon} alt="experience" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-semibold text-[#1E1E1E]">
                    {cert.name}
                  </h2>
                  <p className="text-sm font-medium text-[#777]">{cert.org}</p>
                  <p className="text-sm text-[#555]">{cert.credId}</p>
                  <p className="text-sm text-[#777] font-medium">
                    <span className="font-semibold text-black">
                      Certificate Duration:{" "}
                    </span>
                    {cert.startDate} - {cert.endDate}
                  </p>
                  <p className="text-sm text-[#0B5B4D] font-medium">
                    {cert.credUrl}
                  </p>
                  {cert.media && (
                    <div className="bg-[#F8F8F8] rounded-md mt-1 w-[160px] h-[90px] flex items-center justify-center">
                      <img
                        src={cert.media}
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

export default CertificationSection;

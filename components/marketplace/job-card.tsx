"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, MapPin, User, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface Job {
  id: string;
  uuid: string;
  comName: string;
  jobTitle: string;
  domain: string;
  compLogo: any;
  location: string;
  salary: string;
  range: string;
  jobType: string;
  isHidden: boolean;
  applicationCount: number;
  href: string;
}

interface JobCardProps {
  job: Job;
  onToggle: (uuid: string, currentStatus: boolean) => void;
}

export function JobCard({ job, onToggle }: JobCardProps) {
  return (
    <div className="row-span-1 col-span-1 px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm relative group">
      <div className="flex items-center justify-between py-2">
        <div className="flex gap-2">
          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center p-2 overflow-hidden relative">
            <Image
              src={job.compLogo}
              alt="company logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1
              className="text-gray-900 text-md font-medium truncate max-w-[120px]"
              title={job.comName}
            >
              {job.comName}
            </h1>
            <p className="text-gray-500 text-sm capitalize">{job.domain}</p>
          </div>
        </div>
        <div className="w-fit px-2 py-1 flex items-center justify-center gap-1 bg-[#E7F6EA] text-[#0B5B4D] rounded-full font-medium">
          <Users size={12} />
          <h1 className="text-xs">{job.applicationCount} Applied</h1>
        </div>
      </div>

      <div className="w-full flex">
        <h1 className="font-medium truncate capitalize text-sm">
          {job.jobTitle}
        </h1>
      </div>

      <div className="grid grid-cols-2 py-4 gap-6 text-black/67">
        <div className="flex gap-1 items-center">
          <MapPin size={16} />
          <p className="text-sm truncate">{job.location}</p>
        </div>
        <div className="flex gap-1 justify-end">
          <p className="text-sm font-semibold text-[#0B5B4D]">{job.salary}</p>
        </div>
        <div className="flex gap-1 items-center">
          <User size={16} />
          <p className="text-sm">{job.range}</p>
        </div>
        <div className="flex gap-1 items-center justify-end">
          <Briefcase size={16} />
          <p className="text-sm capitalize">{job.jobType}</p>
        </div>
      </div>

      <div className="border-t border-black/8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={!job.isHidden}
            onCheckedChange={() => onToggle(job.uuid, job.isHidden)}
            className="data-[state=checked]:bg-[#0B5B4D]"
          />
          <span className="text-xs text-gray-500 font-medium uppercase">
            {!job.isHidden ? "Live" : "Hidden"}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/marketplace-jobs/job-applicants-list?jobId=${job.uuid}`}
            className="px-4 py-1.5 border-2 border-[#0B5B4D] cursor-pointer font-medium rounded-md text-[#0B5B4D] text-xs flex items-center hover:bg-[#0B5B4D]/10"
          >
            View List
          </Link>
          <Link
            href={job.href}
            className="px-4 py-1.5 border-2 rounded-md cursor-pointer flex gap-2 font-medium items-center bg-[#0B5B4D] border-[#0B5B4D] text-white text-xs hover:bg-[#094d41]"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
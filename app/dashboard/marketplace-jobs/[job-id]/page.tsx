"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import compLogo from "@/public/images/compLogo.png";
import { Mail, MapPin, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface JobDetails {
  id: string;
  title: string;
  comName: string;
  domain: string;
  compLogo: any;
  location: string;
  salary: string;
  range: string;
  jobType: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  aboutCompany: string;
  email: string;
  isApplied: boolean;
  isSaved: boolean;
  applicationStatus: string | null;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1`;

const Page = () => {
  const params = useParams();
  const rawJobId = params?.["job-id"];

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractedJobId = Array.isArray(rawJobId)
      ? rawJobId[0]
      : rawJobId;

    if (!extractedJobId) return;

    const fetchJobDetails = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const response = await fetch(`${API_BASE_URL}/jobs/${extractedJobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success && data.job) {
          const apiJob = data.job;
          const jobMeta = data.job;

          setJob({
            id: apiJob.uuid,
            title: apiJob.job_title || "Job Title",
            comName: apiJob.org?.org_name || "Company Name",
            domain: apiJob.post_type || "N/A",
            compLogo: apiJob.org?.org_logo || compLogo,
            location: apiJob.org?.org_city || "N/A",
            salary: `${apiJob.min_fixed_ctc} - ${apiJob.max_fixed_ctc}`,
            range: apiJob.job_mode || "N/A",
            jobType: apiJob.job_type || "N/A",
            description: apiJob.description || "No description available.",
            responsibilities: apiJob.perks || ["Not provided"],
            skills: apiJob.skills || [],
            aboutCompany:
              apiJob.org?.org_description ||
              "No company description available.",
            email: apiJob.contact_number || "N/A",
            isApplied: jobMeta.isApplied,
            isSaved: jobMeta.isSaved,
            applicationStatus: jobMeta.applicationStatus,
          });
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [rawJobId]); // 3. Updated dependency

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold text-gray-500">Job not found</h1>
      </div>
    );
  }

  return (
    <main className="w-full py-2 flex flex-col gap-4">
      <section className="w-full h-[230px] border border-black/20 rounded-lg overflow-hidden bg-white">
        <div className="w-full h-[40%] bg-gradient-to-r from-[#DEE2E0] via-[#9FB3C8]/30 to-[#9FB3C8]/7 relative"></div>
        <div className="flex items-end justify-between h-[60%] px-10 pb-4">
          <div className="flex flex-col gap-0 z-10">
            <div className="bg-white h-24 w-24 border border-black/20 rounded-lg flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center p-2 relative overflow-hidden">
                <Image
                  src={job.compLogo}
                  alt="company logo"
                  className="w-full h-full object-contain"
                  width={50}
                  height={50}
                />
              </div>
            </div>
            <h1 className="text-lg text-[#18191C] font-bold mt-2">{job.title}</h1>
            <p className="text-md text-[#18191C] font-medium">{job.comName}</p>
            <div className="flex gap-1 items-center">
              <MapPin size={15} className="text-[#767F8C]" />
              <p className="text-sm text-[#767F8C]">{job.location}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full flex gap-4">
        <div className="w-[70%] flex flex-col gap-4">
          <div className="w-full rounded-lg border border-black/20 p-8 h-full bg-white">
            <h1 className="text-lg text-[#18191C] font-bold">About the Job Role</h1>
            <p className="text-md text-[#18191C] mt-3 whitespace-pre-wrap">{job.description}</p>

            <h1 className="text-lg text-[#18191C] font-bold mt-6">Responsibilities</h1>
            <ul className="list-disc pl-6 mt-3">
              {job.responsibilities.map((res, idx) => (
                <li key={idx} className="text-[#18191C] mb-1">{res}</li>
              ))}
            </ul>

            <h1 className="text-lg text-[#18191C] font-bold mt-6">Skills</h1>
            <div className="flex flex-wrap w-full gap-4 mt-2">
              {job.skills.map((item, idx) => (
                <div key={idx} className="bg-[#EEF1F8] rounded-full px-4 py-2">
                  <h1 className="text-sm">{item}</h1>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-full flex items-center justify-between rounded-lg border border-black/20 p-8 bg-white">
            <div className="w-[80%]">
              <h1 className="text-lg text-[#18191C] font-bold">About the Company</h1>
              <p className="text-md text-[#18191C] mt-3">{job.aboutCompany}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white h-24 w-24 border border-black/20 rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center p-2 relative overflow-hidden">
                  <Image
                    src={job.compLogo}
                    alt="company logo"
                    className="w-full h-full object-contain"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
              <h1 className="text-sm text-[#18191C] font-bold mt-4">{job.comName}</h1>
              <p className="text-xs text-[#767F8C]">{job.domain}</p>
            </div>
          </div>
        </div>

        <div className="w-[30%] flex flex-col gap-4">
          <div className="w-full rounded-lg border border-black/20 p-8 h-auto bg-white">
            <h1 className="text-lg text-[#18191C] font-bold">{job.salary}</h1>
            <p className="text-black/71 text-md">Avg Salary</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
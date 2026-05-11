"use client";
import React, { useState, useEffect } from "react";
import compLogo from "@/public/images/compLogo.png";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE_URL } from "@/lib/config";
import { PageLoader } from "@/components/shared/page-loader";
import { JobCard, Job } from "@/components/marketplace/job-card";
import { FilterPopup } from "@/components/marketplace/filter-popup";
import { ListFilter } from "lucide-react";

const Page = () => {
  const [tabName, setTabName] = useState("All Jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");

        // Parallel Fetch: Get All Jobs AND Applied Counts separately
        const [jobsRes, appliedRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs/institute/jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/jobs/institute/applied-jobs`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const jobsData = await jobsRes.json();
        const appliedData = await appliedRes.json();

        // Create a Map for quick lookup of application counts
        const countMap = new Map();
        if (appliedData.success && Array.isArray(appliedData.jobs)) {
          appliedData.jobs.forEach((j: any) => {
            countMap.set(j.job_uuid, j.applicationCount);
          });
        }

        if (jobsData.success) {
          const mappedJobs: Job[] = jobsData.jobs.map((job: any) => ({
            id: job._id || job.id,
            uuid: job._id || job.id,
            comName: job.org?.org_name || "N/A",
            compLogo: job.org?.org_logo || compLogo,
            jobTitle: job.job_title || "Job Role",
            domain: job.post_type || "N/A",
            location: job.org?.org_city || "Remote",
            salary: job.min_fixed_ctc && job.max_fixed_ctc
              ? `${(job.min_fixed_ctc / 1000).toFixed(0)}k-${(job.max_fixed_ctc / 1000).toFixed(0)}k`
              : "Competitive",
            range: job.min_exp || "0 Yrs",
            jobType: job.job_type || "Full-Time",
            isHidden: job.isHiddenForInstitute || false,
            applicationCount: countMap.get(job._id || job.id) || 0,

            href: `/dashboard/marketplace-jobs/${job._id || job.id}`,
          }));
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleToggle = async (job_uuid: string, currentHiddenStatus: boolean) => {
    const newHiddenStatus = !currentHiddenStatus;

    // Optimistic Update
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.uuid === job_uuid ? { ...job, isHidden: newHiddenStatus } : job
      )
    );

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/jobs/institute/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_uuid: job_uuid,
        }),
      });
    } catch (error) {
      console.error("Error toggling job visibility:", error);
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.uuid === job_uuid ? { ...job, isHidden: currentHiddenStatus } : job
        )
      );
    }
  };

  // Filter Counts Logic
  const jobTypeCounts = jobs.reduce((acc: any, job: Job) => {
    acc[job.jobType] = (acc[job.jobType] || 0) + 1;
    return acc;
  }, {});

  const jobRoleCounts = jobs.reduce((acc: any, job: Job) => {
    acc[job.domain] = (acc[job.domain] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="w-full flex h-full overflow-hidden bg-gray-50/50">
      {/* flex-1 min-w-0 ensures proper shrinking */}
      <div className="flex-1 min-w-0 h-screen flex flex-col px-6">

        <div className="flex justify-between items-center py-6 border-b border-gray-200 mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            {tabName} <span className="text-gray-400 text-lg font-normal ml-2">({jobs.length})</span>
          </h1>

          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterOpen ? "bg-[#E7FEEE] text-[#0B5B4D]" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
          >
            <ListFilter size={16} />
            {filterOpen ? "Close Filters" : "Filter Jobs"}
          </button>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <section
            className={`w-full grid gap-4 h-full pb-32 overflow-y-auto transition-all duration-300 ease-in-out scrollbar-hide ${filterOpen
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
              : "grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
              }`}
          >
            {jobs.map((job, idx) => (
              <JobCard key={`job-${job.id || job.uuid}-${idx}`} job={job} onToggle={handleToggle} />
            ))}

            {jobs.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-sm">Try checking back later</p>
              </div>
            )}
          </section>
        )}
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-screen border-l border-gray-200 bg-white z-20 shadow-xl overflow-hidden"
          >
            <div className="w-[360px] h-full">
              <FilterPopup
                setFilterOpen={setFilterOpen}
                companies={jobs}
                jobTypeCounts={jobTypeCounts}
                jobRoleCounts={jobRoleCounts}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Page;
"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { PageLoader } from "@/components/shared/page-loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface Applicant {
  _id: string;
  applicant: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
  };
  status: string;
  createdAt: string;
}

const JobApplicantsListContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/jobs/organization/jobs/${jobId}/applicants`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (data.success) {
          setApplicants(Array.isArray(data.applications) ? data.applications : []);
        } else {
          setApplicants([]);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setApplicants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 w-full h-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Job Applicants List</h1>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {applicants.length > 0 ? (
              applicants.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {app.applicant?.firstname} {app.applicant?.lastname}
                    </span>
                  </TableCell>

                  <TableCell>{app.applicant?.email}</TableCell>
                  <TableCell>{app.applicant?.phone_number || "N/A"}</TableCell>

                  <TableCell>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <span className="capitalize px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {app.status}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/database/profile?id=${app.applicant._id}`}
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        View Profile <ExternalLink size={14} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No applicants found for this job.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const JobApplicantsListPage = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <JobApplicantsListContent />
    </Suspense>
  );
};

export default JobApplicantsListPage;
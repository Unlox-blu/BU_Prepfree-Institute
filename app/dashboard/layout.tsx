// path: temp/app/dashboard/layout.tsx

"use client";

import "@/app/globals.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from "react";
import { Bell, Search, Settings } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/config";
import Image from "next/image";
import logo from "@/public/images/BU_Prepfree_logo.svg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Convert pathname ("/dashboard/users/profile") -> ["dashboard", "users", "profile"]
  const segments = pathname.split("/").filter(Boolean);

  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbNames, setBreadcrumbNames] = useState<
    Record<string, string>
  >({});

  // ✅ Fix: Dismiss ONLY the "login-success" toast when dashboard mounts
  useEffect(() => {
    toast.dismiss("login-success");
  }, []);

  useEffect(() => {
    const fetchBreadcrumbDetails = async () => {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const assessmentIndex = segments.indexOf("assessment");
      if (assessmentIndex !== -1 && segments.length > assessmentIndex + 1) {
        const id = segments[assessmentIndex + 1];
        if (!breadcrumbNames[id] && id !== "create" && id !== "question-library") {
          try {
            const res = await fetch(`${API_BASE_URL}/assessments/${id}`, { headers });
            if (res.ok) {
              const json = await res.json();
              if (json.assessment?.test_name) {
                setBreadcrumbNames((prev) => ({ ...prev, [id]: json.assessment.test_name }));
              }
            }
          } catch (e) { console.error(e); }
        }
      }

      const mockIndex = segments.indexOf("mock-interview");
      if (mockIndex !== -1) {

        if (segments.length > mockIndex + 1) {
          const userId = segments[mockIndex + 1];
          const isId = userId.length > 20 && userId !== "interview-result-analysis";

          if (isId && !breadcrumbNames[userId]) {
            try {
              const res = await fetch(`${API_BASE_URL}/interview/institute/candidate/${userId}`, { headers });
              if (res.ok) {
                const json = await res.json();
                if (json.candidateName) {
                  setBreadcrumbNames((prev) => ({ ...prev, [userId]: json.candidateName }));
                }
              }
            } catch (e) { console.error(e); }
          }
        }

        if (segments.length > mockIndex + 2) {
          const interviewId = segments[mockIndex + 2];
          const isId = interviewId.length > 20 && interviewId !== "interview-result-analysis";

          if (isId && !breadcrumbNames[interviewId]) {
            try {
              const res = await fetch(`${API_BASE_URL}/interview/institute/performance/${interviewId}`, { headers });
              if (res.ok) {
                const json = await res.json();
                if (json.interviewTitle) {
                  setBreadcrumbNames((prev) => ({ ...prev, [interviewId]: json.interviewTitle }));
                }
              }
            } catch (e) { console.error(e); }
          }
        }
      }
    };

    fetchBreadcrumbDetails();
  }, [pathname]); // Re-run when path changes

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden w-screen">
        {/* Fixed Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <SidebarInset className="flex flex-col gap-0 flex-1 bg-[#071526]">
          {/* Fixed Header */}
          <header className="w-full h-auto flex flex-col items-start gap-2 px-4 py-2 bg-[#F1F1F1] rounded-tl-[15px] z-10">
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-2 flex-1">
                <SidebarTrigger className="-ml-1 bg-[#314370] text-[#f2f2f2] py-5 px-6 hover:bg-[#071526] hover:text-[#f2f2f2] hover:opacity-100 hover:shadow-none cursor-pointer" />
              </div>

              <div className="flex-1 flex justify-center">
                <Image src={logo} alt="BU Prepfree" height={32} className="h-10 w-auto" priority />
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="bg-[#314370] text-[#f2f2f2] px-4 py-3 cursor-pointer rounded-md">
                  <Bell size={18} />
                </div>
              </div>
            </div>

            {/* Dynamic Breadcrumb */}
            <div className="flex items-center justify-between w-full border-b border-black py-3 px-2">
              <Breadcrumb>
                <BreadcrumbList>
                  {segments.map((segment, index) => {
                    const href = "/" + segments.slice(0, index + 1).join("/");
                    const isLast = index === segments.length - 1;

                    // 1. Check if this segment is a known ID in our state
                    // 2. Otherwise decode and format normally
                    const displayName =
                      breadcrumbNames[segment] ||
                      decodeURIComponent(segment)
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());

                    return (
                      <React.Fragment key={href}>
                        <BreadcrumbItem>
                          {!isLast ? (
                            <BreadcrumbLink asChild>
                              <Link href={href}>{displayName}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="font-semibold">
                              {displayName}
                            </BreadcrumbPage>
                          )}
                        </BreadcrumbItem>

                        {/* ✅ Separator should be outside the <li> */}
                        {!isLast && (
                          <BreadcrumbSeparator className="text-black font-semibold" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
              <div id="breadcrumb-actions" className="flex items-center gap-2" />
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 w-full overflow-auto rounded-bl-[15px] bg-[#F1F1F1] px-4">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import SkillsSection from "@/components/profile/skillsCard";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { Phone, UserRound } from "lucide-react";
import Image from "next/image";
import eduIcon from "@/public/images/profile/eduIcon.png";
import projIcon from "@/public/images/profile/projectsIcon.png";
import expIcon from "@/public/images/profile/expIcon.png";
import certIcon from "@/public/images/profile/certIcon.png";

const ProfilePage = () => {
  const params = useSearchParams();
  const id = params.get("id");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        // Updated Endpoint to match existing Institute Routes
        const res = await fetch(`${API_BASE_URL}/institute/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to fetch user");

        setUser(json.user); // ⬅ direct user assignment
      } catch (error) {
        console.error("ERROR fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <main className="w-full h-auto flex gap-4">
      <div className="w-[60%] flex flex-col gap-4 mb-10">
        <h1 className="text-[#0a0a14] font-bold text-lg">
          {user.firstname} {user.lastname}'s Profile
        </h1>
        {/* Banner + Profile Card */}
        <div className="w-full min-h-[300px] rounded-lg bg-white">
          <div className="w-full h-36 bg-gray-200 rounded-lg overflow-hidden">
            {user?.profileInfo?.bannerImageUrl ? (
              <img
                src={user.profileInfo.bannerImageUrl}
                alt="Banner"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">
                No banner uploaded
              </div>
            )}
          </div>

          <div className="flex items-end justify-between h-auto px-5 pb-5 relative pt-8">
            <div className="flex flex-col gap-0 w-full">
              <div className="bg-white h-40 w-40 border border-black/20 rounded-lg flex items-center justify-center absolute left-5 -top-32 overflow-hidden">
                {user?.profileInfo?.profileImageUrl ? (
                  <img
                    src={user.profileInfo.profileImageUrl}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <UserRound className="w-3/4 h-auto text-white" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between w-[95%] mt-3">
                <h1 className="text-lg text-[#0a0a14] font-bold">
                  {user.firstname} {user.lastname}
                </h1>

                <div className="flex gap-1 items-center">
                  <Phone size={15} />
                  <p className="text-md font-medium text-[#0a0a14]">
                    {user.country_code}
                    {user.phone_number}
                  </p>
                </div>
              </div>

              <p className="text-md text-[#7F7F7F] font-medium">
                {user?.profileInfo?.profileHeadline || "Headline"}
              </p>

              <p className="text-md text-[#071526] font-medium underline">
                {user.email}
              </p>

              <p className="text-md text-black/60">
                {user?.profileInfo?.summary || "Intro"}
              </p>
            </div>
          </div>
        </div>
        {/* Sections - pass user directly */}
        {/* Cards */}
        <h1 className="text-[#0a0a14] font-bold text-lg">Experience</h1>
        {user?.experience && user.experience.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user.experience.map((exp: any, idx: number) => (
              <div
                key={idx}
                className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border"
              >
                <div className="flex gap-4 w-full">
                  {/* Logo / Placeholder */}
                  <div className="w-20 h-20 bg-[#EDEDED] rounded-md flex items-center justify-center overflow-hidden">
                    {exp?.jobImageUrl ? (
                      <Image
                        src={exp.jobImageUrl}
                        alt="experience"
                        width={80}
                        height={80}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <Image
                        src={expIcon}
                        alt="experience placeholder"
                        width={40}
                        height={40}
                        className="opacity-60"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-1 w-[85%]">
                    <h2 className="text-md font-semibold text-[#0a0a14]">
                      {exp?.title || "Title not provided"}
                    </h2>

                    <p className="text-sm text-[#071526] font-semibold">
                      {exp?.company || "Company"}{" "}
                      <span className="text-xs text-[#616161] ml-2">
                        {exp?.jobType || ""}
                      </span>
                    </p>

                    <p className="text-sm font-medium text-[#000000]/50">
                      {exp?.startDate ? formatDate(exp.startDate) : "--"} -{" "}
                      {exp?.currentlyWorkHere
                        ? "Present"
                        : exp?.endDate
                        ? formatDate(exp.endDate)
                        : "--"}
                    </p>

                    {exp?.location && (
                      <p className="text-xs font-medium text-[#000000]/50">
                        {exp.location}
                      </p>
                    )}

                    {exp?.description && (
                      <p className="text-xs mt-1 font-medium text-[#000000]/50 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h1 className="text-sm text-[#6b6b6b]">No experience added yet</h1>
        )}

        <h1 className="text-[#0a0a14] font-bold text-lg">Education</h1>
        {user?.education && user.education.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user.education.map((edu: any, idx: number) => (
              <div
                key={idx}
                className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
              >
                <div className="flex gap-4 w-full">
                  {/* Image */}
                  <div className="w-20 h-20 bg-[#EDEDED] rounded-md flex items-center justify-center overflow-hidden">
                    {edu?.educationImageUrl ? (
                      <Image
                        src={edu.educationImageUrl}
                        alt="education"
                        width={80}
                        height={80}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <Image
                        src={eduIcon}
                        alt="education placeholder"
                        width={40}
                        height={40}
                        className="opacity-60"
                      />
                    )}
                  </div>

                  {/* Education Info */}
                  <div className="flex flex-col gap-1 w-[85%]">
                    <h2 className="text-md font-semibold text-[#0a0a14]">
                      {edu?.institution || "Institution not provided"}
                    </h2>

                    {(edu?.degree || edu?.fieldOfStudy) && (
                      <p className="text-sm font-semibold text-[#333]">
                        {edu?.degree || ""}{" "}
                        {edu?.fieldOfStudy && `— ${edu.fieldOfStudy}`}
                      </p>
                    )}

                    {(edu?.startDate || edu?.endDate) && (
                      <p className="text-sm font-medium text-black/50">
                        {edu?.startDate ? formatDate(edu.startDate) : "--"} –
                        {edu?.endDate ? formatDate(edu.endDate) : "Present"}
                      </p>
                    )}

                    {edu?.activitiesAndSocieties && (
                      <>
                        <p className="text-xs font-semibold mt-1">
                          Activities & Societies
                        </p>
                        <p className="text-[11px] leading-[14px] text-[#777] whitespace-pre-line">
                          {edu.activitiesAndSocieties}
                        </p>
                      </>
                    )}

                    {edu?.description && (
                      <>
                        <p className="text-xs font-semibold mt-1">
                          Description
                        </p>
                        <p className="text-[11px] leading-[14px] text-[#777] whitespace-pre-line">
                          {edu.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No education added yet</p>
        )}

        <h1 className="text-[#0a0a14] font-bold text-lg">Projects</h1>
        {user?.projects && user.projects.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user.projects.map((proj: any, idx: number) => (
              <div
                key={idx}
                className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
              >
                <div className="flex gap-4 w-full">
                  {/* Project Image */}
                  <div className="w-20 h-20 bg-[#EDEDED] rounded-md flex items-center justify-center overflow-hidden">
                    {proj?.projectImageUrl ? (
                      <Image
                        src={proj.projectImageUrl}
                        alt="project"
                        width={80}
                        height={80}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <Image
                        src={projIcon}
                        alt="project placeholder"
                        width={40}
                        height={40}
                        className="opacity-60"
                      />
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="flex flex-col gap-1 w-[80%]">
                    <h2 className="text-md font-semibold text-[#0a0a14]">
                      {proj?.title || "Untitled Project"}
                    </h2>

                    {proj?.description && (
                      <p className="text-sm text-black/60 font-medium whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}

                    {(proj?.startDate || proj?.endDate) && (
                      <p className="text-sm text-black font-medium">
                        {proj?.startDate ? formatDate(proj.startDate) : "--"} -{" "}
                        {proj?.endDate ? formatDate(proj.endDate) : "Present"}
                      </p>
                    )}

                    {/* Media Preview */}
                    {proj?.media?.length > 0 && proj.media[0]?.url && (
                      <div className="bg-[#F8F8F8] rounded-md mt-2 w-[180px] h-[120px] overflow-hidden">
                        <img
                          src={proj.media[0].url}
                          alt="project media"
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* Links */}
                    {(proj?.liveUrl || proj?.githubUrl) && (
                      <div className="flex gap-3 mt-2">
                        {proj?.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#071526] underline font-semibold"
                          >
                            Live Demo
                          </a>
                        )}
                        {proj?.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#071526] underline font-semibold"
                          >
                            GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No projects added yet</p>
        )}

        <h1 className="text-[#0a0a14] font-bold text-lg">Job Preferences</h1>
        <div className="w-full h-auto rounded-lg overflow-hidden bg-white p-5 flex flex-col gap-2">
          <Row
            label="Job Roles"
            value={user?.jobPreference?.jobRoles?.join(", ") || "-"}
          />
          <Row
            label="Open For"
            value={
              user?.jobPreference?.openFor?.length > 0
                ? user.jobPreference.openFor.join(", ")
                : "-"
            }
          />

          <Row
            label="Expected CTC"
            value={user?.jobPreference?.expectedCTC || "-"}
          />

          <Row
            label="Industry"
            value={user?.jobPreference?.industry?.join(", ") || "-"}
          />

          <Row
            label="Preferred Location"
            value={user?.jobPreference?.preferedLocation?.join(", ") || "-"}
          />

          <Row
            label="Willing to Relocate"
            value={user?.jobPreference?.willingToRelocate ? "Yes" : "No"}
          />
        </div>

        <h1 className="text-[#0a0a14] font-bold text-lg">Certification</h1>
        {user?.certifications?.length > 0 ? (
          <div className="flex flex-col gap-3">
            {user?.certifications?.map((cert: any, idx: any) => (
              <div
                key={idx}
                className="w-full bg-white rounded-lg p-4 flex justify-between items-start shadow-sm border border-gray-100"
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-[#EDEDED] rounded-sm flex items-center justify-center overflow-hidden">
                    <Image
                      src={certIcon}
                      alt="certificate icon"
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-sm font-semibold text-[#0a0a14]">
                      {cert.title}
                    </h2>

                    <p className="text-sm text-[#777]">{cert.issuer}</p>

                    {cert.credentialId && (
                      <p className="text-sm text-[#555]">{cert.credentialId}</p>
                    )}

                    <p className="text-sm text-[#777] font-medium">
                      <span className="font-semibold text-black">
                        Certificate Duration:
                      </span>{" "}
                      {formatDate(cert.startDate)} - {formatDate(cert.endDate)}
                    </p>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#071526] hover:underline max-w-[220px] truncate"
                        title={cert.credentialUrl}
                      >
                        {cert.credentialUrl}
                      </a>
                    )}

                    {cert.media?.length > 0 && (
                      <div className="flex gap-3 flex-wrap mt-2">
                        {cert.media.map((m: any, index: any) => (
                          <div
                            key={index}
                            className="bg-[#F8F8F8] rounded-md w-[160px] h-[90px] flex items-center justify-center overflow-hidden"
                          >
                            <img
                              src={m.url}
                              alt={m.name}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No Certification added yet</p>
        )}

        <h1 className="text-[#0a0a14] font-bold text-lg">Skills</h1>
        {user?.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-3 bg-white p-5 rounded-xl">
            {user?.skills?.map((skill: any, idx: number) => (
              <div
                key={idx}
                className="bg-[#EEF1F8] text-black font-medium text-sm px-4 py-2 rounded-full"
              >
                {skill.name}
              </div>
            ))}
          </div>
        ):(
          <p className="text-sm text-gray-500">No Skills added yet</p>
        )}
      </div>
    </main>
  );
};

export default ProfilePage;

const Row = ({ label, value }: any) => (
  <div className="w-full flex items-center">
    <p className="w-[30%]">{label}:</p>
    <p className="w-[30%] text-center font-medium">{value}</p>
  </div>
);
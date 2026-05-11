"use client";

import { useEffect, useRef, useState } from "react";
import {
  GalleryVerticalEnd,
  Linkedin,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import Image from "next/image";

const colorPalatte = ["#1a2540", "#7d47b2", "#2b98de", "#102a73", "#7d7d7d"];

interface ResumeTemplateTwoProps {
  resumeData: {
    image?: any;
    education: any[];
    Languages: any[];
    skills: any[];
    profile?: string;
    experience: any[];
    projects: any[];
    certifications: any[];
    type: string;
    isPreview?: boolean;
  };
  colorIndex?: number;
  containerWidth: any;
}

const ResumeTemplateTwo: React.FC<ResumeTemplateTwoProps> = ({
  resumeData,
  colorIndex = 0,
  containerWidth,
}) => {
  const primaryColor = colorPalatte[colorIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseWidth, setBaseWidth] = useState(700);
  const [scale, setScale] = useState(1);

  // 🧩 Auto scaling logic
  useEffect(() => {
    const resizeHandler = () => {
      if (containerRef.current) {
        const actualBaseWidth = containerRef.current?.offsetWidth;
        setBaseWidth(actualBaseWidth);
        const newScale = Math.min(containerWidth / baseWidth, 1);
        setScale(newScale);
      }
    };

    const observer = new ResizeObserver(resizeHandler);
    if (containerRef.current?.parentElement)
      observer.observe(containerRef.current.parentElement);

    resizeHandler(); // initial call
    return () => observer.disconnect();
  }, [containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        transform: containerWidth > 0 ? `scale(${scale})` : "none",
        transformOrigin: "top left",
        width: containerWidth > 0 ? `${baseWidth}px` : "auto",
        height: "auto",
      }}
    >
      <div className="flex flex-col items-center p-4 bg-white shadow-xl">
        <div className="w-full flex flex-col items-center">
          <h1 className="text-xl font-medium">Name</h1>
          <h1 className="text-lg font-medium">Role</h1>
          <div
            className="h-1 w-full"
            style={{ backgroundColor: primaryColor }}
          ></div>
        </div>
        <div className="w-full grid grid-cols-4 gap-2 mt-1">
          <ContactItem
            icon={<Mail className="w-4 h-4" />}
            label="mail"
            color={primaryColor}
          />
          <ContactItem
            icon={<Phone className="w-4 h-4" />}
            label="phone"
            color={primaryColor}
          />
          <ContactItem
            icon={<Linkedin className="w-4 h-4" />}
            label="linkedin"
            color={primaryColor}
          />
          <ContactItem
            icon={<GalleryVerticalEnd className="w-4 h-4" />}
            label="portfolio"
            color={primaryColor}
          />
        </div>
        <SectionMain title="PROFILE" color={primaryColor}>
          {resumeData.profile ? (
            <p className="text-xs mt-2 text-justify">{resumeData.profile}</p>
          ) : (
            <Empty label="No profile added yet." />
          )}
        </SectionMain>
        {/* EDUCATION */}
        <SectionMain title="EDUCATION" color={primaryColor}>
          {resumeData.education.length ? (
            resumeData.education.map((edu, idx) => (
              <div key={idx} className="w-full flex flex-col mt-1 gap-1">
                <h1 className="text-xs font-bold">{edu.schoolName}</h1>
                <h1 className="text-xs font-bold">
                  {edu.startDate} - {edu.endDate}
                </h1>
                <h1 className="text-xs">
                  {edu.degree} - {edu.fieldOfStudy}
                </h1>
              </div>
            ))
          ) : (
            <Empty label="No education added yet." />
          )}
        </SectionMain>
        {/* SKILLS */}
        <SectionMain title="SKILLS" color={primaryColor}>
          <div className="flex gap-2 items-center w-full">
            <h1 className="text-xs font-medium">Technical Skills:</h1>
            {resumeData.skills.length ? (
              resumeData.skills.map((skill, idx) => (
                <h1 key={idx} className="text-xs">
                  {skill.skill},
                </h1>
              ))
            ) : (
              <Empty label="No skills added yet." />
            )}
          </div>
          <div className="flex gap-2 items-center w-full">
            <h1 className="text-xs font-medium">Languages:</h1>
            {resumeData.Languages.length ? (
              resumeData.Languages.map((lang, idx) => (
                <h1 key={idx} className="text-xs">
                  {lang.language}
                </h1>
              ))
            ) : (
              <Empty label="No languages added yet." />
            )}
          </div>
        </SectionMain>
        {/* EXPERIENCE */}
        <SectionMain title="WORK EXPERIENCE" color={primaryColor}>
          {resumeData.experience.length ? (
            resumeData.experience.map((exp, idx) => (
              <div key={idx} className="w-full flex flex-col mt-1 gap-1">
                <div className="flex justify-between">
                  <h1 className="text-xs font-bold">{exp.companyName}</h1>
                  <h1 className="text-[10px]">
                    {exp.startDate} - {exp.endDate}
                  </h1>
                </div>
                <h1 className="text-xs italic font-medium">{exp.role}</h1>
                <p className="text-xs text-justify">{exp.description}</p>
              </div>
            ))
          ) : (
            <Empty label="No experience added yet." />
          )}
        </SectionMain>
        {/* PROJECTS */}
        <SectionMain title="PROJECTS" color={primaryColor}>
          {resumeData.projects.length ? (
            resumeData.projects.map((proj, idx) => (
              <div key={idx} className="w-full flex flex-col mt-1 gap-1">
                <div className="flex justify-between">
                  <h1 className="text-xs font-bold">{proj.title}</h1>
                  <h1 className="text-xs">
                    {proj.role}-{proj.type}
                  </h1>
                </div>
                <h1 className="text-xs italic">{proj.tools}</h1>
                <p className="text-xs text-justify">{proj.desc}</p>
                <a className="text-xs underline">{proj.link}</a>
              </div>
            ))
          ) : (
            <Empty label="No projects added yet." />
          )}
        </SectionMain>
        {/* CERTIFICATIONS */}
        <SectionMain title="CERTIFICATION" color={primaryColor}>
          {resumeData.certifications.length ? (
            resumeData.certifications.map((cert, idx) => (
              <div key={idx} className="w-full flex flex-col mt-1 gap-1">
                <div className="flex justify-between">
                  <h1 className="text-xs font-bold">{cert.title}</h1>
                  <h1 className="text-xs">{cert.date}</h1>
                </div>
                <h1 className="text-xs italic">{cert.issuer}</h1>
                <p className="text-xs text-justify">{cert.description}</p>
              </div>
            ))
          ) : (
            <Empty label="No certification added yet." />
          )}
        </SectionMain>
      </div>
    </div>
  );
};

/* 🔹 Helpers */
const ContactItem = ({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}) => (
  <div className="flex items-center justify-center gap-1">
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center"
      style={{ color: color }}
    >
      {icon}
    </div>
    <h1 className="text-xs">{label}</h1>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <>
    <h1 className="w-full text-md mt-4 font-medium border-b border-white">
      {title}
    </h1>
    {children}
  </>
);

const SectionMain = ({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) => (
  <>
    <h1
      className="w-full text-md mt-2 font-medium border-b text-center"
      style={{ borderColor: color, color }}
    >
      {title}
    </h1>
    {children}
  </>
);

const Empty = ({ label }: { label: string }) => (
  <h1 className="text-xs italic">{label}</h1>
);

export default ResumeTemplateTwo;

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

const colorPalatte = ["#006666", "#7d47b2", "#2b98de", "#102a73", "#7d7d7d"];

interface ResumeTemplateOneProps {
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

const ResumeTemplateFour: React.FC<ResumeTemplateOneProps> = ({
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
        height: "500px",
      }}
    >
      <div className="grid grid-cols-12 bg-white shadow-lg">
        <div
          className="col-span-12 p-4 text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="w-full">
            <h1 className="text-5xl font-medium">Name</h1>
            <h1 className="text-xl font-medium">Role</h1>
            <div
              className="h-1 w-1/4"
              style={{ backgroundColor: primaryColor }}
            ></div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="col-span-8 flex flex-col items-center p-4">
          <SectionMain title="PROFILE" color={primaryColor}>
            {resumeData.profile ? (
              <p className="text-xs mt-2 text-justify">{resumeData.profile}</p>
            ) : (
              <Empty label="No profile added yet." />
            )}
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
        {/* LEFT SECTION */}
        <div
          className="col-span-4 flex flex-col items-center p-2 text-black bg-gray-100"
          //   style={{ backgroundColor: primaryColor }}
        >
          {/* IMAGE */}
          <div className="w-full h-48 flex items-center justify-center overflow-hidden bg-gray-300 mt-4">
            {resumeData.image ? (
              <img
                src={resumeData.image}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserRound
                className="w-2/3 h-auto text-white"
                fill="white"
                strokeWidth={0}
              />
            )}
          </div>

          {/* CONTACT */}
          <h1
            className="w-full text-md mt-2 font-medium border-b border-gray-400"
            style={{ color: primaryColor }}
          >
            CONTACT
          </h1>
          <div className="w-full flex flex-col gap-1 items-start mt-1">
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

          {/* EDUCATION */}
          <Section title="EDUCATION" color={primaryColor}>
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
          </Section>

          {/* LANGUAGES */}
          <Section title="LANGUAGES" color={primaryColor}>
            {resumeData.Languages.length ? (
              resumeData.Languages.map((lang, idx) => (
                <li
                  key={idx}
                  className="text-xs font-medium list-disc list-inside w-full"
                >
                  {lang.language}
                </li>
              ))
            ) : (
              <Empty label="No languages added yet." />
            )}
          </Section>

          {/* SKILLS */}
          <Section title="SKILLS" color={primaryColor}>
            {resumeData.skills.length ? (
              resumeData.skills.map((skill, idx) => (
                <li
                  key={idx}
                  className="text-xs font-medium list-disc list-inside w-full"
                >
                  {skill.skill}
                </li>
              ))
            ) : (
              <Empty label="No skills added yet." />
            )}
          </Section>
        </div>
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
  <div className="flex items-center gap-1">
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
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) => (
  <>
    <h1
      className="w-full text-md mt-2 font-medium border-b border-gray-400"
      style={{ color: color }}
    >
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
      className="w-full text-md mt-2 font-medium border-b"
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

export default ResumeTemplateFour;

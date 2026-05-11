import React from "react";
import ResumeTemplateOne from "./resume-template-one";
import ResumeTemplateTwo from "./resume-template-two";
import ResumeTemplateThree from "./resume-template-three";
import ResumeTemplateFour from "./resume-template-four";

const RenderResume = ({
  templateId,
  resumeData,
  colorIndex,
  containerWidth,
}: any) => {
  switch (templateId) {
    case "1":
      return (
        <ResumeTemplateOne
          resumeData={resumeData}
          colorIndex={colorIndex}
          containerWidth={containerWidth}
        />
      );
    case "2":
      return (
        <ResumeTemplateTwo
          resumeData={resumeData}
          colorIndex={colorIndex}
          containerWidth={containerWidth}
        />
      );
    case "3":
      return (
        <ResumeTemplateThree
          resumeData={resumeData}
          colorIndex={colorIndex}
          containerWidth={containerWidth}
        />
      );
    case "4":
      return (
        <ResumeTemplateFour
          resumeData={resumeData}
          colorIndex={colorIndex}
          containerWidth={containerWidth}
        />
      );
    default:
      return (
        <ResumeTemplateOne
          resumeData={resumeData}
          colorIndex={colorIndex}
          containerWidth={containerWidth}
        />
      );
  }
};

export default RenderResume;

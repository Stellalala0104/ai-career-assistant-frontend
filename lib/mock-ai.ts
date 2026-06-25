type MockResumeInput = {
  resumeText: string;
};

type MockMatchInput = {
  resumeText: string;
  jobDescription: string;
};

type MockRewriteInput = {
  bullet: string;
  tone: string;
};

type MockCoverLetterInput = {
  resumeText: string;
  jobDescription: string;
  companyName: string;
  roleTitle: string;
};

type MockInterviewInput = {
  resumeText: string;
  jobDescription: string;
};

export function mockParseResume({ resumeText }: MockResumeInput) {
  const lowerResume = resumeText.toLowerCase();

  const skills = [
    lowerResume.includes("react") ? "React" : null,
    lowerResume.includes("typescript") ? "TypeScript" : null,
    lowerResume.includes("next") ? "Next.js" : null,
    lowerResume.includes("api") ? "API Integration" : null,
    lowerResume.includes("dashboard") ? "Dashboard UI" : null,
    lowerResume.includes("frontend") ? "Frontend Development" : null,
  ].filter(Boolean) as string[];

  return {
    name: "Detected Candidate",
    summary:
      "Frontend-focused candidate with experience in React, TypeScript, component-based UI development, and AI product workflows.",
    skills:
      skills.length > 0
        ? skills
        : [
            "React",
            "TypeScript",
            "Next.js",
            "Frontend Architecture",
            "Responsive UI",
            "User Workflow Design",
          ],
    experience:
      "Frontend-focused candidate with experience in React, TypeScript, component-based UI development, and AI product workflows.",
    projects: [
      "Built reusable frontend components for an AI career assistant.",
      "Designed user flows for resume parsing, job matching, bullet rewriting, and interview preparation.",
      "Implemented loading states and interactive AI-style feedback sections.",
    ],
    experienceHighlights: [
      "Built reusable frontend components for an AI career assistant.",
      "Designed user flows for resume parsing, job matching, bullet rewriting, and interview preparation.",
      "Implemented loading states and interactive AI-style feedback sections.",
    ],
  };
}

export function mockGenerateMatchReport({
  resumeText,
  jobDescription,
}: MockMatchInput) {
  const combinedText = `${resumeText} ${jobDescription}`.toLowerCase();

  const hasReact = combinedText.includes("react");
  const hasTypeScript =
    combinedText.includes("typescript") || combinedText.includes("type script");
  const hasApi = combinedText.includes("api");
  const hasTesting = combinedText.includes("test");
  const hasAccessibility =
    combinedText.includes("accessibility") || combinedText.includes("a11y");

  const score =
    70 +
    Number(hasReact) * 4 +
    Number(hasTypeScript) * 4 +
    Number(hasApi) * 3 +
    Number(hasTesting) * 2 +
    Number(hasAccessibility) * 2;

  return {
    score: Math.min(score, 92),
    level: "Strong Match",
    summary:
      "Your resume aligns well with the frontend-focused requirements in this job description.",
    matchedSkills: [
      "React",
      "TypeScript",
      "Component Design",
      "User Interface Development",
      "Responsive Layout",
    ],
    missingSkills: [
      "Testing Library",
      "Accessibility Auditing",
      "Production API Integration",
    ],
    suggestions: [
      "Add more measurable frontend impact, such as performance improvements or user adoption.",
      "Mention specific API integration experience if relevant.",
      "Highlight collaboration with designers, product managers, or backend engineers.",
    ],
  };
}

export function mockRewriteBullet({ bullet, tone }: MockRewriteInput) {
  const normalizedTone = tone || "ATS-friendly";

  return `Developed a ${normalizedTone.toLowerCase()} frontend workflow for an AI career assistant, transforming "${bullet.slice(
    0,
    80
  )}${
    bullet.length > 80 ? "..." : ""
  }" into structured, role-specific career guidance using React, TypeScript, and reusable UI components.`;
}

export function mockGenerateCoverLetter({
  companyName,
  roleTitle,
}: MockCoverLetterInput) {
  const company = companyName.trim() || "your company";
  const role = roleTitle.trim() || "Frontend Developer";

  return `Dear Hiring Manager,

I am excited to apply for the ${role} role at ${company}. My background in React, TypeScript, and frontend product development has prepared me to build user-focused, reliable, and scalable interfaces.

In my AI Career Assistant project, I developed interactive workflows for resume parsing, job description matching, bullet rewriting, cover letter generation, and interview preparation. This gave me practical experience designing component-based interfaces, managing frontend state, and creating AI-style user experiences.

I am particularly interested in this opportunity because the role aligns with my strengths in frontend engineering, product thinking, and building tools that help users make better decisions.

Thank you for your time and consideration.

Kind regards,
Your Name`;
}

export function mockGenerateInterviewQuestions({
  jobDescription,
}: MockInterviewInput) {
  const isFrontendRole = jobDescription.toLowerCase().includes("frontend");

  if (isFrontendRole) {
    return [
      "Can you describe a frontend project where you had to manage complex component state?",
      "How would you structure a reusable card component system in React?",
      "How do you approach responsive design across desktop and mobile layouts?",
      "Tell me about a time you improved the user experience of an existing feature.",
      "How would you connect a frontend form to an API endpoint and handle loading or error states?",
    ];
  }

  return [
    "Tell me about a project that best demonstrates your technical strengths.",
    "How do you approach learning a new technology under time pressure?",
    "Describe a time you had to explain a technical decision to a non-technical stakeholder.",
    "How would you debug a feature that works locally but fails in production?",
    "What would you improve in your most recent project if you had more time?",
  ];
}
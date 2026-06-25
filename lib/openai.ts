import OpenAI from "openai";
import type {
  InterviewQuestion,
  MatchReport,
  ParsedResumeSummary,
} from "@/types/career";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ParseResumeInput = {
  resumeText: string;
};

type GenerateMatchReportInput = {
  resumeText: string;
  jobDescription: string;
};

type RewriteBulletInput = {
  bullet: string;
  tone: string;
};

type GenerateCoverLetterInput = {
  resumeText: string;
  jobDescription: string;
  companyName: string;
  roleTitle: string;
};

type GenerateInterviewQuestionsInput = {
  resumeText: string;
  jobDescription: string;
};

function assertOpenAIKey() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local and restart the dev server."
    );
  }
}

function parseJsonResponse<T>(text: string, errorMessage: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(errorMessage);
  }
}

function clampScore(value: unknown, fallback: number) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(100, Math.max(0, Math.round(numberValue)));
}

function normalizeString(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function normalizeStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const cleaned = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : fallback;
}

export async function parseResumeWithAI({
  resumeText,
}: ParseResumeInput): Promise<ParsedResumeSummary> {
  assertOpenAIKey();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert resume parser. Extract only information that is explicitly supported by the resume. Do not invent employers, degrees, projects, metrics, skills, or experience.",
      },
      {
        role: "user",
        content: `Parse this resume and return ONLY valid JSON.

Resume:
${resumeText}

Return this exact JSON shape:
{
  "name": string,
  "summary": string,
  "skills": string[],
  "experience": string,
  "projects": string[]
}

Rules:
- name: use the candidate name if visible; otherwise use "Candidate".
- summary: 1 concise sentence describing the candidate based only on the resume.
- skills: 5 to 12 concrete skills explicitly found or clearly implied by the resume.
- experience: 1 to 2 concise sentences summarising relevant work or academic experience.
- projects: 2 to 5 project or achievement highlights.
- Do not include markdown.
- Do not include explanation outside JSON.
- Do not invent information.`,
      },
    ],
    max_output_tokens: 800,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty resume parsing response.");
  }

  const parsed = parseJsonResponse<Partial<ParsedResumeSummary>>(
    text,
    "OpenAI returned invalid JSON for resume parsing."
  );

  return {
    name: normalizeString(parsed.name, "Candidate"),
    summary: normalizeString(parsed.summary),
    skills: normalizeStringArray(parsed.skills),
    experience: normalizeString(parsed.experience, parsed.summary || ""),
    projects: normalizeStringArray(parsed.projects),
  };
}

export async function generateMatchReportWithAI({
  resumeText,
  jobDescription,
}: GenerateMatchReportInput): Promise<MatchReport> {
  assertOpenAIKey();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert career assistant and ATS resume analyst. Compare a candidate resume against a target job description. Be practical, honest, and specific. Do not invent experience, degrees, employers, certifications, or metrics that are not supported by the resume.",
      },
      {
        role: "user",
        content: `Analyze the resume against the job description and return ONLY valid JSON.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return this exact JSON shape:
{
  "overallScore": number,
  "skillsScore": number,
  "experienceScore": number,
  "keywordScore": number,
  "strengths": string[],
  "gaps": string[],
  "keywords": string[]
}

Scoring rules:
- Scores must be integers from 0 to 100.
- overallScore should reflect the candidate's overall fit for this specific job.
- skillsScore should focus on technical and role-specific skills.
- experienceScore should focus on years, projects, domain relevance, and responsibility level.
- keywordScore should focus on ATS keyword overlap.

Content rules:
- strengths: 3 to 5 concise strengths from the resume that match the job.
- gaps: 3 to 5 missing or weak areas compared with the job description.
- keywords: 5 to 10 important matched or recommended ATS keywords.
- Do not include markdown.
- Do not include explanation outside JSON.
- Do not invent fake achievements.`,
      },
    ],
    max_output_tokens: 900,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty match report.");
  }

  const parsed = parseJsonResponse<Partial<MatchReport>>(
    text,
    "OpenAI returned invalid JSON for the match report."
  );

  return {
    overallScore: clampScore(parsed.overallScore, 0),
    skillsScore: clampScore(parsed.skillsScore, 0),
    experienceScore: clampScore(parsed.experienceScore, 0),
    keywordScore: clampScore(parsed.keywordScore, 0),
    strengths: normalizeStringArray(parsed.strengths),
    gaps: normalizeStringArray(parsed.gaps),
    keywords: normalizeStringArray(parsed.keywords),
  };
}

export async function rewriteBulletWithAI({
  bullet,
  tone,
}: RewriteBulletInput) {
  assertOpenAIKey();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert resume editor. Rewrite resume bullets for job applications. Be concise, professional, ATS-friendly, and do not invent fake metrics.",
      },
      {
        role: "user",
        content: `Rewrite this resume bullet in a ${tone} tone.

Original bullet:
${bullet}

Requirements:
- Return only one rewritten bullet.
- Keep it under 35 words.
- Start with a strong action verb.
- Preserve the original meaning.
- Do not add fake numbers, fake company names, or fake achievements.`,
      },
    ],
    max_output_tokens: 150,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty rewritten bullet.");
  }

  return text;
}

export async function generateCoverLetterWithAI({
  resumeText,
  jobDescription,
  companyName,
  roleTitle,
}: GenerateCoverLetterInput) {
  assertOpenAIKey();

  const company = companyName.trim() || "the company";
  const role = roleTitle.trim() || "the role";

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert career writing assistant. Write concise, tailored cover letters. Do not invent experience, degrees, employers, achievements, or metrics.",
      },
      {
        role: "user",
        content: `Write a tailored cover letter using only the resume and job description.

Company:
${company}

Role:
${role}

Resume:
${resumeText}

Job Description:
${jobDescription}

Requirements:
- Return only the cover letter text.
- Use a professional but natural tone.
- Keep it around 180 to 260 words.
- Mention the company and role where appropriate.
- Do not invent fake achievements, employers, or metrics.
- Do not use placeholders like [Your Name].`,
      },
    ],
    max_output_tokens: 700,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty cover letter.");
  }

  return text;
}

export async function generateInterviewQuestionsWithAI({
  resumeText,
  jobDescription,
}: GenerateInterviewQuestionsInput): Promise<InterviewQuestion[]> {
  assertOpenAIKey();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert interview coach. Generate practical interview questions based on the resume and job description. Do not invent candidate experience.",
      },
      {
        role: "user",
        content: `Generate interview preparation questions and return ONLY valid JSON.

Resume:
${resumeText}

Job Description:
${jobDescription}

Return this exact JSON shape:
{
  "interviewQuestions": [
    {
      "type": string,
      "question": string,
      "hint": string
    }
  ]
}

Rules:
- Return 5 to 7 questions.
- Include a mix of technical, behavioral, project deep dive, and role-specific questions.
- Each hint should tell the candidate how to answer using their real resume experience.
- Do not include markdown.
- Do not include explanation outside JSON.`,
      },
    ],
    max_output_tokens: 900,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty interview question response.");
  }

  const parsed = parseJsonResponse<{ interviewQuestions?: unknown }>(
    text,
    "OpenAI returned invalid JSON for interview questions."
  );

  if (!Array.isArray(parsed.interviewQuestions)) {
    return [];
  }

  return parsed.interviewQuestions
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const question = item as Partial<InterviewQuestion>;

      return {
        type: normalizeString(question.type, "General"),
        question: normalizeString(question.question),
        hint: normalizeString(question.hint),
      };
    })
    .filter(
      (item): item is InterviewQuestion =>
        Boolean(item && item.question && item.hint)
    );
}
export type ParsedResumeSummary = {
  name: string;
  summary?: string;
  skills: string[];
  experience: string;
  projects: string[];
};

export type MatchReport = {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  keywordScore: number;
  strengths: string[];
  gaps: string[];
  keywords: string[];
};

export type InterviewQuestion = {
  type: "Technical" | "Behavioral" | "Project Deep Dive" | "Frontend" | string;
  question: string;
  hint: string;
};

export type CareerAction =
  | "parse-resume"
  | "match-jd"
  | "rewrite-bullet"
  | "generate-cover-letter"
  | "generate-interview-questions";

export type CareerRequestBody = {
  action: CareerAction;
  resumeText?: string;
  jobDescription?: string;
  companyName?: string;
  roleTitle?: string;
  bullet?: string;
  tone?: string;
};

export type ParsedResumeApiResponse = {
  parsedResume: ParsedResumeSummary;
};

export type MatchReportApiResponse = {
  matchReport: MatchReport;
};

export type RewriteBulletApiResponse = {
  rewrittenBullet: string;
};

export type CoverLetterApiResponse = {
  coverLetter: string;
};

export type InterviewPrepApiResponse = {
  interviewQuestions: InterviewQuestion[];
};

export type CareerApiErrorResponse = {
  error: string;
};
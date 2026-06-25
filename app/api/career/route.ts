import { rewriteBulletWithAI } from "@/lib/openai";
import { NextResponse } from "next/server";
import {
  mockGenerateCoverLetter,
  mockGenerateInterviewQuestions,
  mockGenerateMatchReport,
  mockParseResume,
  mockRewriteBullet,
} from "@/lib/mock-ai";

type CareerAction =
  | "parse-resume"
  | "match-jd"
  | "rewrite-bullet"
  | "generate-cover-letter"
  | "generate-interview-questions";

type CareerRequestBody = {
  action: CareerAction;
  resumeText?: string;
  jobDescription?: string;
  companyName?: string;
  roleTitle?: string;
  bullet?: string;
  tone?: string;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CareerRequestBody;

    const {
      action,
      resumeText = "",
      jobDescription = "",
      companyName = "",
      roleTitle = "",
      bullet = "",
      tone = "ATS-friendly",
    } = body;

    await delay(1000);

    if (!action) {
      return createError("Action is required.");
    }

    if (action === "parse-resume") {
      if (!resumeText.trim()) {
        return createError("Resume text is required.");
      }

      const parsedResume = mockParseResume({ resumeText });

      return NextResponse.json({
        parsedResume,
      });
    }

    if (action === "match-jd") {
      if (!resumeText.trim() || !jobDescription.trim()) {
        return createError("Resume text and job description are required.");
      }

      const matchReport = mockGenerateMatchReport({
        resumeText,
        jobDescription,
      });

      return NextResponse.json({
        matchReport,
      });
    }

    if (action === "rewrite-bullet") {
       if (!bullet.trim()) {
    return createError("A resume bullet is required.");
  }

    const rewrittenBullet = await rewriteBulletWithAI({
    bullet,
    tone,
  });

  return NextResponse.json({
    rewrittenBullet,
  });
}

    if (action === "generate-cover-letter") {
      if (!resumeText.trim() || !jobDescription.trim()) {
        return createError("Resume text and job description are required.");
      }

      const coverLetter = mockGenerateCoverLetter({
        resumeText,
        jobDescription,
        companyName,
        roleTitle,
      });

      return NextResponse.json({
        coverLetter,
      });
    }

    if (action === "generate-interview-questions") {
      if (!jobDescription.trim()) {
        return createError("Job description is required.");
      }

      const interviewQuestions = mockGenerateInterviewQuestions({
        resumeText,
        jobDescription,
      });

      return NextResponse.json({
        interviewQuestions,
      });
    }

    return createError("Invalid action.");
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong while processing the request." },
      { status: 500 }
    );
  }
}
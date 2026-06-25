import { NextResponse } from "next/server";
import {
  generateCoverLetterWithAI,
  generateInterviewQuestionsWithAI,
  generateMatchReportWithAI,
  parseResumeWithAI,
  rewriteBulletWithAI,
} from "@/lib/openai";
import type { CareerRequestBody } from "@/types/career";

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

    if (!action) {
      return createError("Action is required.");
    }

    if (action === "parse-resume") {
      if (!resumeText.trim()) {
        return createError("Resume text is required.");
      }

      const parsedResume = await parseResumeWithAI({
        resumeText,
      });

      return NextResponse.json({
        parsedResume,
      });
    }

    if (action === "match-jd") {
      if (!resumeText.trim() || !jobDescription.trim()) {
        return createError("Resume text and job description are required.");
      }

      const matchReport = await generateMatchReportWithAI({
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

      const coverLetter = await generateCoverLetterWithAI({
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
      if (!resumeText.trim() || !jobDescription.trim()) {
        return createError("Resume text and job description are required.");
      }

      const interviewQuestions = await generateInterviewQuestionsWithAI({
        resumeText,
        jobDescription,
      });

      return NextResponse.json({
        interviewQuestions,
      });
    }

    return createError("Invalid action.");
  } catch (error) {
    console.error("Career API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while processing the request.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
"use client";

import { useState } from "react";
import type {
  CareerApiErrorResponse,
  InterviewPrepApiResponse,
  InterviewQuestion,
} from "@/types/career";

type InterviewPrepCardProps = {
  resumeText: string;
  jobDescription: string;
  questions: InterviewQuestion[];
  copiedItem: string | null;
  isResumeParsed: boolean;
  hasResumeText: boolean;
  onInterviewQuestionsChange: (questions: InterviewQuestion[]) => void;
  onCopy: (text: string, item: string) => void;
  getQuestionsAsText: () => string;
};

export function InterviewPrepCard({
  resumeText,
  jobDescription,
  questions,
  copiedItem,
  isResumeParsed,
  hasResumeText,
  onInterviewQuestionsChange,
  onCopy,
  getQuestionsAsText,
}: InterviewPrepCardProps) {
  const [isPreparingInterview, setIsPreparingInterview] = useState(false);
  const [error, setError] = useState("");

  const hasJobDescription = jobDescription.trim().length > 20;

  const canPrepareInterview =
    isResumeParsed && resumeText.trim().length > 20 && hasJobDescription;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isPreparingInterview) {
      return "Generating role-specific interview questions...";
    }

    if (!hasResumeText) {
      return "Paste your resume text before generating interview prep.";
    }

    if (!isResumeParsed) {
      return "Parse your resume first so the assistant can reference your experience.";
    }

    if (!hasJobDescription) {
      return "Paste a job description so the questions can match the target role.";
    }

    return "";
  }

  function normalizeInterviewQuestions(
    rawQuestions: InterviewQuestion[]
  ): InterviewQuestion[] {
    return rawQuestions
      .map((item) => ({
        type: item.type?.trim() || "General",
        question: item.question?.trim() || "",
        hint:
          item.hint?.trim() ||
          "Use a specific example from your resume and connect it to the target role.",
      }))
      .filter((item) => item.question.length > 0);
  }

  async function handleGenerateInterviewPrep() {
    if (!canPrepareInterview || isPreparingInterview) return;

    setIsPreparingInterview(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate-interview-questions",
          resumeText,
          jobDescription,
        }),
      });

      const data = (await response.json()) as
        | InterviewPrepApiResponse
        | CareerApiErrorResponse;

      if (!response.ok) {
        const message =
          "error" in data
            ? data.error
            : "Failed to generate interview questions.";
        throw new Error(message);
      }

      if (!("interviewQuestions" in data)) {
        throw new Error("The API did not return interview questions.");
      }

      if (!Array.isArray(data.interviewQuestions)) {
        throw new Error("Interview questions returned in an invalid format.");
      }

      const formattedQuestions = normalizeInterviewQuestions(
        data.interviewQuestions
      );

      if (formattedQuestions.length === 0) {
        throw new Error("No valid interview questions were generated.");
      }

      onInterviewQuestionsChange(formattedQuestions);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "We couldn't generate interview prep. Please check your resume and job description, then try again.";

      setError(message);
    } finally {
      setIsPreparingInterview(false);
    }
  }

  return (
    <article id="interview" className="card">
      <p className="step">Step 5</p>
      <h3>Interview Prep</h3>
      <p className="card-desc">
        Generate interview questions and answer hints from resume and JD.
      </p>

      <button
        className={isPreparingInterview ? "button loading" : "button"}
        disabled={!canPrepareInterview || isPreparingInterview}
        onClick={handleGenerateInterviewPrep}
      >
        {isPreparingInterview ? "Preparing..." : "Generate Interview Prep"}
      </button>

      {disabledReason && !canPrepareInterview && (
        <div className="disabled-explanation">
          <strong>Before you can generate interview prep</strong>
          <p>{disabledReason}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Interview prep failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isPreparingInterview && (
        <div className="skeleton-box" aria-label="Generating interview prep">
          <div className="skeleton-question-card">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
          </div>

          <div className="skeleton-question-card">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
          </div>
        </div>
      )}

      {questions.length === 0 &&
        !isPreparingInterview &&
        !error &&
        !canPrepareInterview && (
          <div className="empty-state">
            <strong>No interview questions yet</strong>
            <p>
              Parse your resume and paste a job description to generate
              role-specific technical and behavioral questions.
            </p>
          </div>
        )}

      {questions.length === 0 &&
        !isPreparingInterview &&
        !error &&
        canPrepareInterview && (
          <div className="empty-state">
            <strong>Ready to prepare</strong>
            <p>
              Click Generate Interview Prep to create practice questions and
              answer hints based on your resume and target role.
            </p>
          </div>
        )}

      {questions.length > 0 && !isPreparingInterview && (
        <div className="result-header question-header">
          <h4>Generated Questions</h4>
          <button
            className="small-button"
            type="button"
            onClick={() => onCopy(getQuestionsAsText(), "interview")}
          >
            {copiedItem === "interview" ? "Copied!" : "Copy All"}
          </button>
        </div>
      )}

      {!isPreparingInterview && (
        <div className="question-list">
          {questions.map((q, index) => (
            <div className="question-card" key={`${q.question}-${index}`}>
              <span>{q.type}</span>
              <h4>{q.question}</h4>
              <p>{q.hint}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
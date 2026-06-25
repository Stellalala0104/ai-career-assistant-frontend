"use client";

import { useState } from "react";
import type {
  CareerApiErrorResponse,
  CoverLetterApiResponse,
} from "@/types/career";

type CoverLetterCardProps = {
  resumeText: string;
  jobDescription: string;
  company: string;
  role: string;
  coverLetter: string;
  copiedItem: string | null;
  isResumeParsed: boolean;
  hasResumeText: boolean;
  onCompanyChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onCoverLetterChange: (value: string) => void;
  onCopy: (text: string, item: string) => void;
};

export function CoverLetterCard({
  resumeText,
  jobDescription,
  company,
  role,
  coverLetter,
  copiedItem,
  isResumeParsed,
  hasResumeText,
  onCompanyChange,
  onRoleChange,
  onCoverLetterChange,
  onCopy,
}: CoverLetterCardProps) {
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [error, setError] = useState("");

  const hasJobDescription = jobDescription.trim().length > 20;

  const canGenerateLetter =
    isResumeParsed && resumeText.trim().length > 20 && hasJobDescription;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isGeneratingLetter) {
      return "Generating a tailored cover letter from your resume and job description...";
    }

    if (!hasResumeText) {
      return "Paste your resume text before generating a cover letter.";
    }

    if (!isResumeParsed) {
      return "Parse your resume first so the assistant can use your background.";
    }

    if (!hasJobDescription) {
      return "Paste a job description so the cover letter can be targeted.";
    }

    return "";
  }

  async function handleGenerateCoverLetter() {
    if (!canGenerateLetter || isGeneratingLetter) return;

    setIsGeneratingLetter(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate-cover-letter",
          resumeText,
          jobDescription,
          companyName: company,
          roleTitle: role,
        }),
      });

      const data = (await response.json()) as
        | CoverLetterApiResponse
        | CareerApiErrorResponse;

      if (!response.ok) {
        const message =
          "error" in data ? data.error : "Failed to generate cover letter.";
        throw new Error(message);
      }

      if (!("coverLetter" in data) || !data.coverLetter.trim()) {
        throw new Error("The API did not return a cover letter.");
      }

      onCoverLetterChange(data.coverLetter);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "We couldn't generate the cover letter. Please check your resume and job description, then try again.";

      setError(message);
    } finally {
      setIsGeneratingLetter(false);
    }
  }

  return (
    <article id="cover" className="card">
      <p className="step">Step 4</p>
      <h3>Cover Letter Generator</h3>
      <p className="card-desc">
        Generate a targeted cover letter from resume and JD context.
      </p>

      <input
        className="input"
        value={company}
        onChange={(e) => {
          setError("");
          onCompanyChange(e.target.value);
        }}
        placeholder="Company name"
        disabled={isGeneratingLetter}
      />

      <input
        className="input"
        value={role}
        onChange={(e) => {
          setError("");
          onRoleChange(e.target.value);
        }}
        placeholder="Role title"
        disabled={isGeneratingLetter}
      />

      <button
        className={
          isGeneratingLetter ? "button loading" : "button"
        }
        disabled={!canGenerateLetter || isGeneratingLetter}
        onClick={handleGenerateCoverLetter}
      >
        {isGeneratingLetter ? "Generating..." : "Generate Cover Letter"}
      </button>

      {disabledReason && !canGenerateLetter && (
        <div className="disabled-explanation">
          <strong>Before you can generate a cover letter</strong>
          <p>{disabledReason}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Cover letter generation failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isGeneratingLetter && (
        <div className="skeleton-box" aria-label="Generating cover letter">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
        </div>
      )}

      {!coverLetter && !isGeneratingLetter && !error && !canGenerateLetter && (
        <div className="empty-state">
          <strong>No cover letter generated yet</strong>
          <p>
            Parse your resume and paste a job description to generate a targeted
            cover letter.
          </p>
        </div>
      )}

      {!coverLetter && !isGeneratingLetter && !error && canGenerateLetter && (
        <div className="empty-state">
          <strong>Ready to generate</strong>
          <p>
            Add a company name and role title if you want a more personalized
            cover letter, then click Generate Cover Letter.
          </p>
        </div>
      )}

      {coverLetter && !isGeneratingLetter && (
        <div className="result-box">
          <div className="result-header">
            <h4>Generated Cover Letter</h4>
            <button
              className="small-button"
              type="button"
              onClick={() => onCopy(coverLetter, "cover")}
            >
              {copiedItem === "cover" ? "Copied!" : "Copy"}
            </button>
          </div>

          <textarea
            className="textarea letter"
            value={coverLetter}
            onChange={(e) => onCoverLetterChange(e.target.value)}
          />
        </div>
      )}
    </article>
  );
}
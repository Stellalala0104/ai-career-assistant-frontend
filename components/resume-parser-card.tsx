"use client";

import { useState } from "react";
import type {
  CareerApiErrorResponse,
  ParsedResumeApiResponse,
  ParsedResumeSummary,
} from "@/types/career";

type ResumeParserCardProps = {
  resumeText: string;
  parsedSummary: ParsedResumeSummary | null;
  onResumeTextChange: (value: string) => void;
  onFileSelected: (fileName: string) => void;
  onParsedSummaryChange: (summary: ParsedResumeSummary) => void;
};

export function ResumeParserCard({
  resumeText,
  parsedSummary,
  onResumeTextChange,
  onFileSelected,
  onParsedSummaryChange,
}: ResumeParserCardProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");

  const hasResumeText = resumeText.trim().length > 0;
  const canParse = resumeText.trim().length > 20;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isParsing) {
      return "Parsing your resume and extracting key career information...";
    }

    if (!hasResumeText) {
      return "Paste your resume text or upload a file to begin.";
    }

    if (!canParse) {
      return "Add at least 20 characters of resume text before parsing.";
    }

    return "";
  }

  async function handleParseResume() {
    if (!canParse || isParsing) return;

    setIsParsing(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "parse-resume",
          resumeText,
        }),
      });

      const data = (await response.json()) as
        | ParsedResumeApiResponse
        | CareerApiErrorResponse;

      if (!response.ok) {
        const message =
          "error" in data ? data.error : "Failed to parse resume.";
        throw new Error(message);
      }

      if (!("parsedResume" in data) || !data.parsedResume) {
        throw new Error("The API did not return a parsed resume.");
      }

      const parsedResume = data.parsedResume;

      const formattedSummary: ParsedResumeSummary = {
        name: parsedResume.name || "Candidate",
        summary: parsedResume.summary || "",
        skills: Array.isArray(parsedResume.skills)
          ? parsedResume.skills.filter(Boolean)
          : [],
        experience:
          parsedResume.experience ||
          parsedResume.summary ||
          "No experience summary was extracted.",
        projects: Array.isArray(parsedResume.projects)
          ? parsedResume.projects.filter(Boolean)
          : [],
      };

      onParsedSummaryChange(formattedSummary);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "We couldn't parse your resume. Please check the pasted text and try again.";

      setError(message);
    } finally {
      setIsParsing(false);
    }
  }

  return (
    <article id="resume" className="card">
      <div className="card-header">
        <div>
          <p className="step">Step 1</p>
          <h3>Resume Upload & Parsing</h3>
        </div>
        <span className="badge">Core</span>
      </div>

      <label className="upload-box">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          disabled={isParsing}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setError("");
              onFileSelected(file.name);
            }
          }}
        />
        <span className="upload-icon">↑</span>
        <strong>Upload PDF / DOCX / TXT</strong>
        <small>
          File upload is accepted by the frontend. Paste the extracted resume
          text below before parsing.
        </small>
      </label>

      <textarea
        className="textarea"
        value={resumeText}
        onChange={(e) => {
          setError("");
          onResumeTextChange(e.target.value);
        }}
        placeholder="Paste resume text here..."
        disabled={isParsing}
      />

      <button
        className={
          isParsing ? "button primary-button loading" : "button primary-button"
        }
        disabled={!canParse || isParsing}
        onClick={handleParseResume}
      >
        {isParsing ? "Parsing..." : "Parse Resume"}
      </button>

      {disabledReason && !canParse && (
        <div className="disabled-explanation">
          <strong>Before you can parse this resume</strong>
          <p>{disabledReason}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Resume parsing failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isParsing && (
        <div className="skeleton-box" aria-label="Parsing resume">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
          <div className="skeleton-tag-row">
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
            <div className="skeleton-tag" />
            <div className="skeleton-tag wide" />
          </div>
        </div>
      )}

      {!parsedSummary && !isParsing && !error && !hasResumeText && (
        <div className="empty-state">
          <strong>No resume parsed yet</strong>
          <p>
            Upload a resume file or paste resume text to start extracting skills,
            experience, and project highlights.
          </p>
        </div>
      )}

      {!parsedSummary && !isParsing && !error && hasResumeText && canParse && (
        <div className="empty-state">
          <strong>Resume text is ready</strong>
          <p>
            Click Parse Resume to generate a structured preview of skills,
            experience, and projects.
          </p>
        </div>
      )}

      {parsedSummary && !isParsing && (
        <div className="result-box">
          <h4>Parsed Resume Preview</h4>

          {parsedSummary.skills.length > 0 && (
            <div className="tag-row">
              {parsedSummary.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          )}

          {parsedSummary.summary && (
            <p>
              <strong>Summary:</strong> {parsedSummary.summary}
            </p>
          )}

          <p>
            <strong>Experience:</strong> {parsedSummary.experience}
          </p>

          {parsedSummary.projects.length > 0 && (
            <p>
              <strong>Projects:</strong> {parsedSummary.projects.join(", ")}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
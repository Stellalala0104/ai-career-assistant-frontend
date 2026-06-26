"use client";

import { useState } from "react";
import type {
  CareerApiErrorResponse,
  ExtractResumeApiResponse,
  ParsedResumeApiResponse,
  ParsedResumeSummary,
} from "@/types/career";

type ResumeParserCardProps = {
  resumeText: string;
  parsedSummary: ParsedResumeSummary | null;
  onResumeTextChange: (value: string) => void;
  onParsedSummaryChange: (summary: ParsedResumeSummary) => void;
};

const SUPPORTED_FILE_TYPES = [".txt", ".pdf", ".docx"];

export function ResumeParserCard({
  resumeText,
  parsedSummary,
  onResumeTextChange,
  onParsedSummaryChange,
}: ResumeParserCardProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const hasResumeText = resumeText.trim().length > 0;
  const canParse = resumeText.trim().length > 20;
  const isBusy = isParsing || isExtractingFile;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isExtractingFile) {
      return "Extracting text from your uploaded resume file...";
    }

    if (isParsing) {
      return "Parsing your resume and extracting key career information...";
    }

    if (!hasResumeText) {
      return "Upload a TXT, PDF, or DOCX resume, or paste resume text manually.";
    }

    if (!canParse) {
      return "Add at least 20 characters of resume text before parsing.";
    }

    return "";
  }

  function isSupportedFile(file: File) {
    const lowerName = file.name.toLowerCase();

    return SUPPORTED_FILE_TYPES.some((extension) =>
      lowerName.endsWith(extension)
    );
  }

  async function handleFileSelected(file: File) {
    setError("");
    setUploadedFileName(file.name);

    if (!isSupportedFile(file)) {
      setError("Unsupported file type. Please upload a TXT, PDF, or DOCX file.");
      return;
    }

    setIsExtractingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as
        | ExtractResumeApiResponse
        | CareerApiErrorResponse;

      if (!response.ok) {
        const message =
          "error" in data ? data.error : "Failed to extract resume text.";

        setError(message);
        return;
      }

      if (!("text" in data) || !data.text.trim()) {
        setError("No readable text was extracted from this file.");
        return;
      }

      onResumeTextChange(data.text);
      setUploadedFileName(data.fileName);
    } catch {
      setError(
        "We couldn't extract text from this file. Please try another file or paste the resume text manually."
      );
    } finally {
      setIsExtractingFile(false);
    }
  }

  async function handleParseResume() {
    if (!canParse || isBusy) return;

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

        setError(message);
        return;
      }

      if (!("parsedResume" in data) || !data.parsedResume) {
        setError("The API did not return a parsed resume.");
        return;
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
    } catch {
      setError(
        "We couldn't parse your resume. Please check the extracted text and try again."
      );
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
          accept=".txt,.pdf,.docx"
          disabled={isBusy}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handleFileSelected(file);
            }

            e.target.value = "";
          }}
        />
        <span className="upload-icon">↑</span>
        <strong>
          {isExtractingFile
            ? "Extracting resume text..."
            : "Upload TXT / PDF / DOCX"}
        </strong>
        <small>
          The app will extract text first. Review or edit the extracted text
          below, then click Parse Resume.
        </small>
      </label>

      {uploadedFileName && (
        <div className="disabled-explanation">
          <strong>Selected file</strong>
          <p>{uploadedFileName}</p>
        </div>
      )}

      <textarea
        className="textarea"
        value={resumeText}
        onChange={(e) => {
          setError("");
          onResumeTextChange(e.target.value);
        }}
        placeholder="Upload a resume file or paste resume text here..."
        disabled={isBusy}
      />

      <button
        className={
          isParsing ? "button primary-button loading" : "button primary-button"
        }
        disabled={!canParse || isBusy}
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
          <strong>Resume processing failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isExtractingFile && (
        <div className="skeleton-box" aria-label="Extracting resume text">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
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

      {!parsedSummary && !isBusy && !error && !hasResumeText && (
        <div className="empty-state">
          <strong>No resume text yet</strong>
          <p>
            Upload a TXT, PDF, or DOCX resume to extract text, or paste resume
            text manually.
          </p>
        </div>
      )}

      {!parsedSummary && !isBusy && !error && hasResumeText && canParse && (
        <div className="empty-state">
          <strong>Resume text is ready</strong>
          <p>
            Review the extracted text, then click Parse Resume to generate a
            structured preview of skills, experience, and projects.
          </p>
        </div>
      )}

      {parsedSummary && !isBusy && (
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
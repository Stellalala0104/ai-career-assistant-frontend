"use client";

import { useState } from "react";
import type { MatchReport } from "../types/career";
import { ScoreCard } from "@/components/score-card";

type JDMatchCardProps = {
  resumeText: string;
  jobDescription: string;
  matchReport: MatchReport | null;
  isResumeParsed: boolean;
  hasResumeText: boolean;
  onJobDescriptionChange: (value: string) => void;
  onMatchReportChange: (report: MatchReport) => void;
};

export function JDMatchCard({
  resumeText,
  jobDescription,
  matchReport,
  isResumeParsed,
  hasResumeText,
  onJobDescriptionChange,
  onMatchReportChange,
}: JDMatchCardProps) {
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState("");

  const hasJobDescription = jobDescription.trim().length > 20;

  const canAnalyze =
    isResumeParsed && resumeText.trim().length > 20 && hasJobDescription;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isMatching) {
      return "Analyzing your resume and job description...";
    }

    if (!hasResumeText) {
      return "Paste your resume text first, then parse it before running JD Match.";
    }

    if (!isResumeParsed) {
      return "Parse your resume first before generating a match report.";
    }

    if (!hasJobDescription) {
      return "Paste a job description with at least 20 characters to unlock JD Match.";
    }

    return "";
  }

  async function handleGenerateMatch() {
    if (!canAnalyze || isMatching) return;

    setIsMatching(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "match-jd",
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate match report.");
      }

      const apiReport = data.matchReport;

      const formattedReport: MatchReport = {
        overallScore: apiReport.overallScore ?? apiReport.score ?? 82,
        skillsScore: apiReport.skillsScore ?? 84,
        experienceScore: apiReport.experienceScore ?? 78,
        keywordScore: apiReport.keywordScore ?? 86,
        strengths:
          apiReport.strengths ??
          apiReport.matchedSkills ??
          [
            "Strong frontend foundation",
            "Relevant React and TypeScript experience",
          ],
        gaps:
          apiReport.gaps ??
          apiReport.missingSkills ??
          [
            "Add more measurable impact",
            "Mention testing or accessibility experience",
          ],
        keywords:
          apiReport.keywords ??
          apiReport.matchedSkills ??
          ["React", "TypeScript", "Next.js", "Frontend"],
      };

      onMatchReportChange(formattedReport);
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't generate the match report. Please check your resume and job description, then try again."
      );
    } finally {
      setIsMatching(false);
    }
  }

  return (
    <article id="match" className="card">
      <div className="card-header">
        <div>
          <p className="step">Step 2</p>
          <h3>JD Match Score</h3>
        </div>
        <span className="badge primary">High Value</span>
      </div>

      <textarea
        className="textarea tall"
        value={jobDescription}
        onChange={(e) => {
          setError("");
          onJobDescriptionChange(e.target.value);
        }}
        placeholder="Paste target job description here..."
        disabled={isMatching}
      />

      <button
        className={
          isMatching ? "button primary-button loading" : "button primary-button"
        }
        disabled={!canAnalyze || isMatching}
        onClick={handleGenerateMatch}
      >
        {isMatching ? "Analyzing..." : "Generate Match Report"}
      </button>

      {disabledReason && !canAnalyze && (
        <div className="disabled-explanation">
          <strong>Before you can generate a match report</strong>
          <p>{disabledReason}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Match report failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isMatching && (
        <div className="skeleton-box" aria-label="Generating match report">
          <div className="skeleton-score-grid">
            <div className="skeleton-score-card" />
            <div className="skeleton-score-card" />
            <div className="skeleton-score-card" />
            <div className="skeleton-score-card" />
          </div>

          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
        </div>
      )}

      {!matchReport && !isMatching && !error && canAnalyze && (
        <div className="empty-state">
          <strong>No match report yet</strong>
          <p>
            Your resume and job description are ready. Click Generate Match
            Report to calculate fit, strengths, gaps, and relevant keywords.
          </p>
        </div>
      )}

      {!matchReport && !isMatching && !error && !canAnalyze && (
        <div className="empty-state">
          <strong>JD Match is waiting for inputs</strong>
          <p>
            Parse your resume first, then paste a target job description to
            unlock the match score.
          </p>
        </div>
      )}

      {matchReport && !isMatching && (
        <div className="result-box">
          <div className="score-grid">
            <ScoreCard label="Overall" value={matchReport.overallScore} />
            <ScoreCard label="Skills" value={matchReport.skillsScore} />
            <ScoreCard label="Experience" value={matchReport.experienceScore} />
            <ScoreCard label="Keywords" value={matchReport.keywordScore} />
          </div>

          <div className="split-list">
            <div>
              <h4>Strengths</h4>
              <ul>
                {matchReport.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Skill Gaps</h4>
              <ul>
                {matchReport.gaps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="tag-row">
            {matchReport.keywords.map((keyword) => (
              <span className="tag" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
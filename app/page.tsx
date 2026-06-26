"use client";

import { useState } from "react";
import { BulletRewriterCard } from "@/components/bullet-rewriter-card";
import { CoverLetterCard } from "@/components/cover-letter-card";
import { HeroSection } from "@/components/hero-section";
import { InterviewPrepCard } from "@/components/interview-prep-card";
import { JDMatchCard } from "@/components/jd-match-card";
import { ResumeParserCard } from "@/components/resume-parser-card";
import { Sidebar } from "@/components/sidebar";

import { bulletTones } from "@/lib/sample-data";
import type {
  InterviewQuestion,
  MatchReport,
  ParsedResumeSummary,
} from "@/types/career";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [bullet, setBullet] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [activeTone, setActiveTone] = useState("ATS-friendly");

  const [parsedSummary, setParsedSummary] =
    useState<ParsedResumeSummary | null>(null);
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);
  const [rewrittenBullet, setRewrittenBullet] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const isResumeParsed = parsedSummary !== null;
  const hasResumeText = resumeText.trim().length > 20;

  async function copyToClipboard(text: string, item: string) {
    if (!text.trim()) return;

    await navigator.clipboard.writeText(text);
    setCopiedItem(item);

    setTimeout(() => {
      setCopiedItem(null);
    }, 1500);
  }

  function resetResumeDependentResults() {
    setParsedSummary(null);
    setMatchReport(null);
    setCoverLetter("");
    setQuestions([]);
  }

  function resetJobDependentResults() {
    setMatchReport(null);
    setCoverLetter("");
    setQuestions([]);
  }

  function resetCoverLetterOnly() {
    setCoverLetter("");
  }

  function handleResumeTextChange(value: string) {
    setResumeText(value);
    resetResumeDependentResults();
  }

  function getInterviewQuestionsAsText() {
    return questions
      .map(
        (q, index) => `${index + 1}. [${q.type}] ${q.question}
Hint: ${q.hint}`
      )
      .join("\n\n");
  }

  return (
    <main className="app-shell">
      <Sidebar
        resumeStatus={
          isResumeParsed ? "Parsed" : resumeText ? "Ready" : "Pending"
        }
        jdStatus={jobDescription ? "Ready" : "Pending"}
        matchStatus={matchReport ? `${matchReport.overallScore}%` : "Not run"}
      />

      <section className="main-content">
        <HeroSection matchScore={matchReport?.overallScore} />

        <section className="grid two-columns">
          <ResumeParserCard
            resumeText={resumeText}
            parsedSummary={parsedSummary}
            onResumeTextChange={handleResumeTextChange}
            onParsedSummaryChange={setParsedSummary}
          />

          <JDMatchCard
            resumeText={resumeText}
            jobDescription={jobDescription}
            matchReport={matchReport}
            isResumeParsed={isResumeParsed}
            hasResumeText={hasResumeText}
            onJobDescriptionChange={(value) => {
              setJobDescription(value);
              resetJobDependentResults();
            }}
            onMatchReportChange={setMatchReport}
          />
        </section>

        <section className="grid three-columns">
          <BulletRewriterCard
            bullet={bullet}
            activeTone={activeTone}
            rewrittenBullet={rewrittenBullet}
            copiedItem={copiedItem}
            tones={bulletTones}
            onBulletChange={(value) => {
              setBullet(value);
              setRewrittenBullet("");
            }}
            onToneChange={(tone) => {
              setActiveTone(tone);
              setRewrittenBullet("");
            }}
            onRewrittenBulletChange={setRewrittenBullet}
            onCopy={copyToClipboard}
          />

          <CoverLetterCard
            resumeText={resumeText}
            jobDescription={jobDescription}
            company={company}
            role={role}
            coverLetter={coverLetter}
            copiedItem={copiedItem}
            isResumeParsed={isResumeParsed}
            hasResumeText={hasResumeText}
            onCompanyChange={(value) => {
              setCompany(value);
              resetCoverLetterOnly();
            }}
            onRoleChange={(value) => {
              setRole(value);
              resetCoverLetterOnly();
            }}
            onCoverLetterChange={setCoverLetter}
            onCopy={copyToClipboard}
          />

          <InterviewPrepCard
            resumeText={resumeText}
            jobDescription={jobDescription}
            questions={questions}
            copiedItem={copiedItem}
            isResumeParsed={isResumeParsed}
            hasResumeText={hasResumeText}
            onInterviewQuestionsChange={setQuestions}
            onCopy={copyToClipboard}
            getQuestionsAsText={getInterviewQuestionsAsText}
          />
        </section>
      </section>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import type {
  CareerApiErrorResponse,
  CareerChatApiResponse,
  CareerChatMessage,
  MatchReport,
  ParsedResumeSummary,
} from "@/types/career";

type ChatAssistantCardProps = {
  resumeText: string;
  jobDescription: string;
  parsedSummary: ParsedResumeSummary | null;
  matchReport: MatchReport | null;
};

const starterQuestions = [
  "How can I improve my resume for this job?",
  "Which skills should I highlight first?",
  "What interview questions should I prepare for?",
];

export function ChatAssistantCard({
  resumeText,
  jobDescription,
  parsedSummary,
  matchReport,
}: ChatAssistantCardProps) {
  const [messages, setMessages] = useState<CareerChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");

  const hasResumeContext = resumeText.trim().length > 20;
  const hasJobContext = jobDescription.trim().length > 20;
  const hasMatchContext = matchReport !== null;
  const hasAnyContext = hasResumeContext || hasJobContext || hasMatchContext;
  const canAsk = question.trim().length > 2 && hasAnyContext && !isAsking;

  useEffect(() => {
    setMessages([]);
    setError("");
  }, [resumeText, jobDescription, matchReport]);

  function getDisabledReason() {
    if (isAsking) {
      return "Career Coach is thinking...";
    }

    if (!hasAnyContext) {
      return "Upload or paste your resume first. Adding a job description will make the answer more specific.";
    }

    if (question.trim().length <= 2) {
      return "Ask a short career question to start the conversation.";
    }

    return "";
  }

  async function handleAsk(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();

    if (finalQuestion.length <= 2 || !hasAnyContext || isAsking) return;

    const userMessage: CareerChatMessage = {
      role: "user",
      content: finalQuestion,
    };

    const previousMessages = messages;

    setMessages([...previousMessages, userMessage]);
    setQuestion("");
    setIsAsking(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "career-chat",
          question: finalQuestion,
          messages: previousMessages,
          resumeText,
          jobDescription,
          parsedSummary,
          matchReport,
        }),
      });

      const data = (await response.json()) as
        | CareerChatApiResponse
        | CareerApiErrorResponse;

      if (!response.ok) {
        const message =
          "error" in data ? data.error : "Failed to generate chat response.";
        throw new Error(message);
      }

      if (!("answer" in data) || !data.answer.trim()) {
        throw new Error("The API did not return a chat answer.");
      }

      const assistantMessage: CareerChatMessage = {
        role: "assistant",
        content: data.answer,
      };

      setMessages([...previousMessages, userMessage, assistantMessage]);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error
          ? err.message
          : "Career Coach could not answer this question. Please try again.";

      setError(message);
      setMessages(previousMessages);
      setQuestion(finalQuestion);
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <article id="coach" className="card">
      <div className="card-header">
        <div>
          <p className="step">Step 6</p>
          <h3>Ask AI Career Coach</h3>
        </div>
        <span className="badge primary">Chat</span>
      </div>

      <p>
        Ask follow-up questions about your resume, job fit, skill gaps, bullet
        points, cover letter, or interview preparation.
      </p>

      <div className="tag-row">
        {starterQuestions.map((item) => (
          <button
            key={item}
            type="button"
            className="tag"
            disabled={!hasAnyContext || isAsking}
            onClick={() => {
              void handleAsk(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="result-box">
        {messages.length === 0 && !isAsking ? (
          <div className="empty-state">
            <strong>No conversation yet</strong>
            <p>
              Add your resume and job description, then ask the coach what to
              improve next.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`}>
              <h4>{message.role === "user" ? "You" : "AI Career Coach"}</h4>
              <p>{message.content}</p>
            </div>
          ))
        )}

        {isAsking && (
          <div className="skeleton-box" aria-label="Generating chat response">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
          </div>
        )}
      </div>

      <textarea
        className="textarea"
        value={question}
        onChange={(e) => {
          setError("");
          setQuestion(e.target.value);
        }}
        placeholder="Ask something like: How should I tailor my resume for this data analyst role?"
        disabled={isAsking}
      />

      <button
        className={
          isAsking ? "button primary-button loading" : "button primary-button"
        }
        disabled={!canAsk}
        onClick={() => {
          void handleAsk();
        }}
      >
        {isAsking ? "Thinking..." : "Ask Career Coach"}
      </button>

      {getDisabledReason() && !canAsk && (
        <div className="disabled-explanation">
          <strong>Before you can ask Career Coach</strong>
          <p>{getDisabledReason()}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Career Coach failed</strong>
          <p>{error}</p>
        </div>
      )}
    </article>
  );
}
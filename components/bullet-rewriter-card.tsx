"use client";

import { useState } from "react";

type BulletRewriterCardProps = {
  bullet: string;
  activeTone: string;
  rewrittenBullet: string;
  copiedItem: string | null;
  tones: string[];
  onBulletChange: (value: string) => void;
  onToneChange: (tone: string) => void;
  onRewrittenBulletChange: (bullet: string) => void;
  onCopy: (text: string, item: string) => void;
};

export function BulletRewriterCard({
  bullet,
  activeTone,
  rewrittenBullet,
  copiedItem,
  tones,
  onBulletChange,
  onToneChange,
  onRewrittenBulletChange,
  onCopy,
}: BulletRewriterCardProps) {
  const [isRewriting, setIsRewriting] = useState(false);
  const [error, setError] = useState("");

  const hasBullet = bullet.trim().length > 0;
  const canRewrite = bullet.trim().length > 10;

  const disabledReason = getDisabledReason();

  function getDisabledReason() {
    if (isRewriting) {
      return "Rewriting your resume bullet with the selected tone...";
    }

    if (!hasBullet) {
      return "Paste one resume bullet to begin rewriting.";
    }

    if (!canRewrite) {
      return "Add a slightly longer bullet so the assistant has enough context to rewrite it.";
    }

    return "";
  }

  async function handleRewriteBullet() {
    if (!canRewrite || isRewriting) return;

    setIsRewriting(true);
    setError("");

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "rewrite-bullet",
          bullet,
          tone: activeTone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rewrite bullet.");
      }

      onRewrittenBulletChange(data.rewrittenBullet);
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't rewrite this bullet. Please check the text and try again."
      );
    } finally {
      setIsRewriting(false);
    }
  }

  return (
    <article id="rewrite" className="card">
      <p className="step">Step 3</p>
      <h3>Bullet Rewriter</h3>
      <p className="card-desc">Rewrite resume bullets for stronger impact.</p>

      <textarea
        className="textarea"
        value={bullet}
        onChange={(e) => {
          setError("");
          onBulletChange(e.target.value);
        }}
        placeholder="Paste a resume bullet here..."
        disabled={isRewriting}
      />

      <div className="chip-row">
        {tones.map((tone) => (
          <button
            key={tone}
            className={tone === activeTone ? "chip selected" : "chip"}
            onClick={() => {
              setError("");
              onToneChange(tone);
            }}
            disabled={isRewriting}
          >
            {tone}
          </button>
        ))}
      </div>

      <button
        className={isRewriting ? "button loading" : "button"}
        disabled={!canRewrite || isRewriting}
        onClick={handleRewriteBullet}
      >
        {isRewriting ? "Rewriting..." : "Rewrite Bullet"}
      </button>

      {disabledReason && !canRewrite && (
        <div className="disabled-explanation">
          <strong>Before you can rewrite this bullet</strong>
          <p>{disabledReason}</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <strong>Bullet rewrite failed</strong>
          <p>{error}</p>
        </div>
      )}

      {isRewriting && (
        <div className="skeleton-box" aria-label="Rewriting bullet">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line medium" />
        </div>
      )}

      {!rewrittenBullet && !isRewriting && !error && !hasBullet && (
        <div className="empty-state">
          <strong>No bullet rewritten yet</strong>
          <p>
            Paste a resume bullet, choose a tone, and generate a stronger
            version for your application.
          </p>
        </div>
      )}

      {!rewrittenBullet && !isRewriting && !error && hasBullet && canRewrite && (
        <div className="empty-state">
          <strong>Bullet is ready to rewrite</strong>
          <p>
            Choose a tone such as ATS-friendly, quantified, concise, or
            leadership-focused, then click Rewrite Bullet.
          </p>
        </div>
      )}

      {rewrittenBullet && !isRewriting && (
        <div className="result-box compact">
          <div className="result-header">
            <h4>Suggested Version</h4>
            <button
              className="small-button"
              onClick={() => onCopy(rewrittenBullet, "bullet")}
            >
              {copiedItem === "bullet" ? "Copied!" : "Copy"}
            </button>
          </div>

          <p>{rewrittenBullet}</p>
        </div>
      )}
    </article>
  );
}
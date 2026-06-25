type HeroSectionProps = {
  matchScore?: number;
};

export function HeroSection({ matchScore }: HeroSectionProps) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Frontend MVP Template</p>
        <h2>Optimize resumes for every job application.</h2>
        <p className="hero-text">
          Upload or paste a resume, compare it with a job description, rewrite bullet points,
          generate a tailored cover letter, and prepare interview questions in one workflow.
        </p>
      </div>

      <div className="hero-panel">
        <p className="panel-label">Current Match Score</p>
        <div className="score-ring">
          <span>{matchScore ?? "--"}%</span>
        </div>
        <p className="muted">Based on resume and JD alignment</p>
      </div>
    </header>
  );
}

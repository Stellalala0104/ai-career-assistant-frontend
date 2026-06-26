type SidebarProps = {
  resumeStatus: string;
  jdStatus: string;
  matchStatus: string;
};

export function Sidebar({ resumeStatus, jdStatus, matchStatus }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">CP</div>
        <div>
          <p className="eyebrow">AI Career Assistant</p>
          <h1>CareerPilot AI</h1>
        </div>
      </div>

      <nav className="nav-list">
        <a href="#resume" className="nav-item active">
          Resume Parser
        </a>
        <a href="#match" className="nav-item">
          JD Match
        </a>
        <a href="#rewrite" className="nav-item">
          Bullet Rewriter
        </a>
        <a href="#cover" className="nav-item">
          Cover Letter
        </a>
        <a href="#interview" className="nav-item">
          Interview Prep
        </a>
        <a href="#coach" className="nav-item">
          AI Career Coach
        </a>
      </nav>

      <div className="sidebar-card">
        <p className="sidebar-card-title">MVP Progress</p>

        <div className="progress-list">
          <span>Resume</span>
          <strong>{resumeStatus}</strong>
        </div>

        <div className="progress-list">
          <span>JD</span>
          <strong>{jdStatus}</strong>
        </div>

        <div className="progress-list">
          <span>Match</span>
          <strong>{matchStatus}</strong>
        </div>
      </div>
    </aside>
  );
}
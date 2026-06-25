type ScoreCardProps = {
  label: string;
  value: number;
};

export function ScoreCard({ label, value }: ScoreCardProps) {
  return (
    <div className="score-card">
      <span>{label}</span>
      <strong>{value}%</strong>

      <div className="meter">
        <div style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ScoreBar({
  label,
  score,
  color,
  maxScore = 100,
}: {
  label: string;
  score: number;
  color: "hype" | "proof" | "rank";
  maxScore?: number;
}) {
  const colorMap = {
    hype: "bg-hype",
    proof: "bg-proof",
    rank: "bg-accent",
  };
  const pct = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorMap[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right">{score}</span>
    </div>
  );
}

export function ScoreCard({
  rankScore,
  hypeScore,
  proofScore,
  compact = false,
}: {
  rankScore: number;
  hypeScore: number;
  proofScore: number;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted">Rank <strong className="text-foreground">{rankScore}</strong></span>
        <span className="text-hype">H {hypeScore}</span>
        <span className="text-proof">P {proofScore}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <ScoreBar label="Rank" score={rankScore} color="rank" />
      <ScoreBar label="Hype" score={hypeScore} color="hype" />
      <ScoreBar label="Proof" score={proofScore} color="proof" />
    </div>
  );
}

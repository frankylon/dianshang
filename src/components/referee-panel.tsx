import { Shield, AlertTriangle, FileCheck, RotateCcw, MessageSquareWarning, Scale, Info } from "lucide-react";
import { DivBadge } from "./div-badge";
import { ScoreCard } from "./score-bar";
import { getVarStatusLabel } from "@/lib/utils";

interface RefereePanelProps {
  leagueStatus: {
    div: number;
    rankScore: number;
    hypeScore: number;
    proofScore: number;
    evidenceCount: number;
    returnRate: number;
    complaintRate: number;
    varStatus: string;
  };
  hasSponsor?: boolean;
  compact?: boolean;
}

export function RefereePanel({ leagueStatus, hasSponsor = false, compact = false }: RefereePanelProps) {
  const varStatusClass = {
    clear: "text-success",
    under_review: "text-warning",
    verified: "text-accent",
    sanctioned: "text-danger",
  }[leagueStatus.varStatus] || "text-muted";

  if (compact) {
    return (
      <div className="bg-gray-50 border border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="w-4 h-4 text-muted" />
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Referee Panel</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DivBadge div={leagueStatus.div} size="sm" />
          <ScoreCard rankScore={leagueStatus.rankScore} hypeScore={leagueStatus.hypeScore} proofScore={leagueStatus.proofScore} compact />
          <span className="text-xs text-muted">{leagueStatus.evidenceCount} evidence</span>
          <span className="text-xs text-muted">Return {(leagueStatus.returnRate * 100).toFixed(1)}%</span>
          <span className={`text-xs font-medium ${varStatusClass}`}>
            {getVarStatusLabel(leagueStatus.varStatus)}
          </span>
        </div>
        {hasSponsor && (
          <p className="text-xs text-muted mt-2 italic flex items-center gap-1">
            <Info className="w-3 h-3" />
            Sponsorship does not affect ranking
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-2 border-border rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Scale className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-sm">Referee Panel</h3>
        <span className="text-xs text-muted ml-auto">Platform-managed · Cannot be modified</span>
      </div>

      {/* Div */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">Division</span>
        <DivBadge div={leagueStatus.div} size="md" />
      </div>

      {/* Scores */}
      <div>
        <span className="text-sm text-muted mb-2 block">Rank Score (30% Hype + 70% Proof)</span>
        <ScoreCard rankScore={leagueStatus.rankScore} hypeScore={leagueStatus.hypeScore} proofScore={leagueStatus.proofScore} />
      </div>

      {/* Evidence count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted flex items-center gap-1">
          <FileCheck className="w-4 h-4" /> Evidence Posts
        </span>
        <span className="font-medium">{leagueStatus.evidenceCount}</span>
      </div>

      {/* Fulfillment metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 text-xs text-muted mb-1">
            <RotateCcw className="w-3 h-3" /> Return Rate
          </div>
          <span className={`font-medium text-sm ${leagueStatus.returnRate > 0.05 ? "text-danger" : "text-success"}`}>
            {(leagueStatus.returnRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className="bg-white rounded-lg p-2 border border-border">
          <div className="flex items-center gap-1 text-xs text-muted mb-1">
            <MessageSquareWarning className="w-3 h-3" /> Complaint Rate
          </div>
          <span className={`font-medium text-sm ${leagueStatus.complaintRate > 0.03 ? "text-danger" : "text-success"}`}>
            {(leagueStatus.complaintRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* VAR Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" /> VAR Status
        </span>
        <span className={`font-medium text-sm ${varStatusClass}`}>
          {getVarStatusLabel(leagueStatus.varStatus)}
        </span>
      </div>

      {/* Sponsor disclaimer */}
      {hasSponsor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>This brand has active sponsorship on the platform. Sponsorship affects display and conversion only — it does NOT influence rankings or scores.</span>
        </div>
      )}

      {/* Platform rules link */}
      <div className="text-center pt-2 border-t border-border">
        <a href="/rules" className="text-xs text-accent hover:underline">
          Platform Rules & After-Sales Policy →
        </a>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Swords, Crown, TrendingUp, Heart, FileCheck, RotateCcw, AlertTriangle } from "lucide-react";
import { ScoreCard } from "@/components/score-bar";
import { DivBadge } from "@/components/div-badge";
import { ContentCard } from "@/components/content-card";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function PkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pk = await prisma.pkMatch.findUnique({
    where: { id },
    include: {
      league: true,
      season: true,
      productA: {
        include: {
          brand: true,
          leagueStatuses: true,
          evidencePosts: { where: { status: "verified" }, take: 3 },
          contentPosts: { where: { type: "short" }, include: { metrics: true }, take: 4 },
        },
      },
      productB: {
        include: {
          brand: true,
          leagueStatuses: true,
          evidencePosts: { where: { status: "verified" }, take: 3 },
          contentPosts: { where: { type: "short" }, include: { metrics: true }, take: 4 },
        },
      },
    },
  });

  if (!pk) notFound();

  const statsA = pk.productA.leagueStatuses.find((s) => s.leagueId === pk.leagueId);
  const statsB = pk.productB.leagueStatuses.find((s) => s.leagueId === pk.leagueId);

  const stats = pk.statsSnapshot ? JSON.parse(pk.statsSnapshot) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Swords className="w-6 h-6 text-accent" />
          <span className="text-sm text-muted">{pk.league.name} · {pk.season?.name || "Open"}</span>
        </div>
        <h1 className="text-2xl font-bold">PK Battle</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
          pk.status === "active" ? "bg-success/10 text-success" : "bg-gray-100 text-muted"
        }`}>
          {pk.status}
        </span>
      </div>

      {/* VS Header */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
        <div className="text-center">
          <Link href={`/product/${pk.productA.slug}`} className="hover:text-accent transition-colors">
            <div className="aspect-square max-w-[200px] mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-muted text-sm mb-2">
              {pk.productA.name}
            </div>
            <h2 className="font-bold text-lg">{pk.productA.name}</h2>
          </Link>
          <p className="text-muted text-sm">{pk.productA.brand?.name}</p>
          <p className="font-bold text-lg mt-1">{formatPrice(pk.productA.price)}</p>
          {statsA && <div className="mt-2"><DivBadge div={statsA.div} size="sm" /></div>}
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-black text-accent">VS</span>
          {pk.proofWinner && (
            <div className="text-center">
              <div className="flex items-center gap-1 text-xs text-muted mb-1">
                <Crown className="w-3 h-3" /> Proof Winner
              </div>
              <span className="text-sm font-bold text-success">
                {pk.proofWinner === pk.productAId ? pk.productA.name : pk.productB.name}
              </span>
            </div>
          )}
          {pk.hypeWinner && (
            <div className="text-center">
              <div className="flex items-center gap-1 text-xs text-muted mb-1">
                <Heart className="w-3 h-3" /> Hype Winner
              </div>
              <span className="text-sm font-bold text-hype">
                {pk.hypeWinner === pk.productAId ? pk.productA.name : pk.productB.name}
              </span>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link href={`/product/${pk.productB.slug}`} className="hover:text-accent transition-colors">
            <div className="aspect-square max-w-[200px] mx-auto bg-gray-100 rounded-xl flex items-center justify-center text-muted text-sm mb-2">
              {pk.productB.name}
            </div>
            <h2 className="font-bold text-lg">{pk.productB.name}</h2>
          </Link>
          <p className="text-muted text-sm">{pk.productB.brand?.name}</p>
          <p className="font-bold text-lg mt-1">{formatPrice(pk.productB.price)}</p>
          {statsB && <div className="mt-2"><DivBadge div={statsB.div} size="sm" /></div>}
        </div>
      </div>

      {/* Score Comparison */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-center">{pk.productA.name}</h3>
          {statsA && <ScoreCard rankScore={statsA.rankScore} hypeScore={statsA.hypeScore} proofScore={statsA.proofScore} />}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-gray-50 rounded p-2">
              <span className="text-muted flex items-center gap-1"><FileCheck className="w-3 h-3" /> Evidence</span>
              <span className="font-bold">{statsA?.evidenceCount || 0}</span>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <span className="text-muted flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Return</span>
              <span className="font-bold">{((statsA?.returnRate || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-center">{pk.productB.name}</h3>
          {statsB && <ScoreCard rankScore={statsB.rankScore} hypeScore={statsB.hypeScore} proofScore={statsB.proofScore} />}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-gray-50 rounded p-2">
              <span className="text-muted flex items-center gap-1"><FileCheck className="w-3 h-3" /> Evidence</span>
              <span className="font-bold">{statsB?.evidenceCount || 0}</span>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <span className="text-muted flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Return</span>
              <span className="font-bold">{((statsB?.returnRate || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner determination note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <strong>How is the winner determined?</strong> The <strong>Proof Winner</strong> is decided by Proof Score (evidence + purchase feedback).
        The <strong>Hype Winner</strong> is based on popularity votes only. Only Proof determines the real champion.
      </div>

      {/* Related UGC Shorts */}
      {(pk.productA.contentPosts.length > 0 || pk.productB.contentPosts.length > 0) && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Related Shorts</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">{pk.productA.name}</h4>
              <div className="grid grid-cols-2 gap-2">
                {pk.productA.contentPosts.map((cp) => (
                  <ContentCard key={cp.id} content={{
                    id: cp.id, title: cp.title, coverUrl: cp.coverUrl, mediaUrl: cp.mediaUrl,
                    source: cp.source, type: cp.type, duration: cp.duration,
                    metrics: cp.metrics ? { views: cp.metrics.views, likes: cp.metrics.likes, saves: cp.metrics.saves, shares: cp.metrics.shares } : null,
                  }} />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted mb-2">{pk.productB.name}</h4>
              <div className="grid grid-cols-2 gap-2">
                {pk.productB.contentPosts.map((cp) => (
                  <ContentCard key={cp.id} content={{
                    id: cp.id, title: cp.title, coverUrl: cp.coverUrl, mediaUrl: cp.mediaUrl,
                    source: cp.source, type: cp.type, duration: cp.duration,
                    metrics: cp.metrics ? { views: cp.metrics.views, likes: cp.metrics.likes, saves: cp.metrics.saves, shares: cp.metrics.shares } : null,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

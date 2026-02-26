import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ShortsCard } from "@/components/content-card";
import { Flame, Trophy, Calendar, DollarSign, Users, Clock } from "lucide-react";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      league: true,
      entries: {
        include: {
          contentPost: { include: { metrics: true, author: true } },
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!challenge) notFound();

  const featured = challenge.entries.filter((e) => e.status === "featured" || e.status === "winner");
  const submitted = challenge.entries.filter((e) => e.status === "submitted" || e.status === "approved");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 via-purple-50 to-pink-50 rounded-xl p-8">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-6 h-6 text-accent" />
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            challenge.status === "active" ? "bg-success/10 text-success" : "bg-gray-100 text-muted"
          }`}>
            {challenge.status}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-accent mb-1">{challenge.hashtag}</h1>
        <h2 className="text-xl font-semibold mb-2">{challenge.title}</h2>
        <p className="text-muted mb-4">{challenge.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-muted">
            <Trophy className="w-4 h-4" /> {challenge.league.name}
          </span>
          {challenge.prizePool > 0 && (
            <span className="flex items-center gap-1 text-warning font-bold">
              <DollarSign className="w-4 h-4" /> ${challenge.prizePool} Prize Pool
            </span>
          )}
          <span className="flex items-center gap-1 text-muted">
            <Users className="w-4 h-4" /> {challenge.entries.length} entries
          </span>
          <span className="flex items-center gap-1 text-muted">
            <Calendar className="w-4 h-4" />
            {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
          </span>
        </div>

        {challenge.status === "active" && (
          <button className="mt-4 bg-accent text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
            Join Challenge
          </button>
        )}
      </div>

      {challenge.rules && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Rules</h3>
          <p className="text-sm text-muted">{challenge.rules}</p>
        </div>
      )}

      {/* Featured entries */}
      {featured.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" /> Featured Entries
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {featured.map((entry) => (
              <div key={entry.id} className="shrink-0">
                <ShortsCard
                  content={{
                    id: entry.contentPost.id,
                    title: entry.contentPost.title,
                    coverUrl: entry.contentPost.coverUrl,
                    mediaUrl: entry.contentPost.mediaUrl,
                    source: entry.contentPost.source,
                    type: entry.contentPost.type,
                    duration: entry.contentPost.duration,
                    metrics: entry.contentPost.metrics
                      ? { views: entry.contentPost.metrics.views, likes: entry.contentPost.metrics.likes, saves: entry.contentPost.metrics.saves, shares: entry.contentPost.metrics.shares }
                      : null,
                  }}
                />
                <p className="text-xs text-muted mt-1 text-center">by {entry.user.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All entries */}
      <section>
        <h3 className="text-lg font-semibold mb-4">All Entries ({submitted.length})</h3>
        {submitted.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2 flex-wrap">
            {submitted.map((entry) => (
              <div key={entry.id} className="shrink-0">
                <ShortsCard
                  content={{
                    id: entry.contentPost.id,
                    title: entry.contentPost.title,
                    coverUrl: entry.contentPost.coverUrl,
                    mediaUrl: entry.contentPost.mediaUrl,
                    source: entry.contentPost.source,
                    type: entry.contentPost.type,
                    duration: entry.contentPost.duration,
                    metrics: entry.contentPost.metrics
                      ? { views: entry.contentPost.metrics.views, likes: entry.contentPost.metrics.likes, saves: entry.contentPost.metrics.saves, shares: entry.contentPost.metrics.shares }
                      : null,
                  }}
                />
                <p className="text-xs text-muted mt-1 text-center">by {entry.user.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No entries yet. Be the first!</p>
        )}
      </section>
    </div>
  );
}

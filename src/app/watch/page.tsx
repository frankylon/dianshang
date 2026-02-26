import { prisma } from "@/lib/db";
import { ContentCard } from "@/components/content-card";
import { Play, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default async function WatchPage() {
  const longVideos = await prisma.contentPost.findMany({
    where: { type: "long" },
    include: { metrics: true, author: true, product: true, brand: true, league: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const trending = [...longVideos].sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0)).slice(0, 4);
  const latest = longVideos.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center gap-2">
        <Play className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold">Watch</h1>
        <span className="text-muted text-sm ml-2">Long-form reviews, tutorials & comparisons</span>
      </div>

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Trending</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.map((v) => (
            <ContentCard
              key={v.id}
              content={{
                id: v.id,
                title: v.title,
                coverUrl: v.coverUrl,
                mediaUrl: v.mediaUrl,
                source: v.source,
                type: v.type,
                duration: v.duration,
                metrics: v.metrics ? { views: v.metrics.views, likes: v.metrics.likes, saves: v.metrics.saves, shares: v.metrics.shares } : null,
              }}
            />
          ))}
        </div>
      </section>

      {/* Latest */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-semibold">Latest Videos</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latest.map((v) => (
            <ContentCard
              key={v.id}
              content={{
                id: v.id,
                title: v.title,
                coverUrl: v.coverUrl,
                mediaUrl: v.mediaUrl,
                source: v.source,
                type: v.type,
                duration: v.duration,
                metrics: v.metrics ? { views: v.metrics.views, likes: v.metrics.likes, saves: v.metrics.saves, shares: v.metrics.shares } : null,
              }}
            />
          ))}
        </div>
      </section>

      {longVideos.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No long videos available yet</p>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/db";
import { ContentCard, ShortsCard } from "@/components/content-card";
import { formatNumber, formatPrice } from "@/lib/utils";
import { DivBadge } from "@/components/div-badge";
import {
  Search,
  Trophy,
  Flame,
  ChevronRight,
  AlertTriangle,
  Zap,
  Calendar,
  DollarSign,
  Package,
  Star,
  ShieldCheck,
} from "lucide-react";

export const dynamic = 'force-dynamic';

async function getLeagues() {
  return prisma.league.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

async function getShorts() {
  return prisma.contentPost.findMany({
    where: { type: "short" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: {
      metrics: true,
    },
  });
}

async function getLongVideos() {
  return prisma.contentPost.findMany({
    where: { type: "long" },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: {
      metrics: true,
    },
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      brand: true,
      leagueStatuses: {
        include: { league: true },
        take: 1,
      },
      reviews: { select: { rating: true } },
      _count: { select: { evidencePosts: true, reviews: true } },
    },
  });
}

async function getChallenges() {
  return prisma.challenge.findMany({
    where: { status: "active" },
    orderBy: { endDate: "asc" },
    take: 6,
    include: {
      league: true,
      _count: {
        select: { entries: true },
      },
    },
  });
}

function mapContentToCard(
  post: {
    id: string;
    title: string;
    coverUrl: string | null;
    mediaUrl: string;
    source: string;
    type: string;
    duration: number | null;
    metrics: {
      views: number;
      likes: number;
      saves: number;
      shares: number;
    } | null;
  }
) {
  return {
    id: post.id,
    title: post.title,
    coverUrl: post.coverUrl,
    mediaUrl: post.mediaUrl,
    source: post.source,
    type: post.type,
    duration: post.duration,
    metrics: post.metrics
      ? {
          views: post.metrics.views,
          likes: post.metrics.likes,
          saves: post.metrics.saves,
          shares: post.metrics.shares,
        }
      : null,
  };
}

function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default async function Home() {
  const [leagues, shorts, longVideos, challenges, products] = await Promise.all([
    getLeagues(),
    getShorts(),
    getLongVideos(),
    getChallenges(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
            Find the best products through
            <br />
            <span className="text-accent">real evidence</span>, not ads
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10">
            Products compete like athletes in a league. Real users provide the
            evidence. The best rise to the top.
          </p>
          <form
            action="/search"
            method="GET"
            className="max-w-2xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              name="q"
              placeholder="Search products, leagues, or challenges..."
              className="w-full h-14 pl-12 pr-28 rounded-full border border-border bg-background text-foreground text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-full transition-colors text-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Active Leagues */}
      {leagues.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">
                Active Leagues
              </h2>
            </div>
            <Link
              href="/leagues"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/leagues/${league.slug}`}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-accent/30 transition-all group"
              >
                <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors mb-2">
                  {league.name}
                </h3>
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-sm text-muted leading-snug">
                    {league.painPoint}
                  </p>
                </div>
                <p className="text-xs text-muted line-clamp-2">
                  {league.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Recommendations */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">
                Featured Products
              </h2>
            </div>
            <Link
              href="/search"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const ls = product.leagueStatuses[0];
              const avgRating =
                product.reviews.length > 0
                  ? product.reviews.reduce((s, r) => s + r.rating, 0) /
                    product.reviews.length
                  : 0;

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-accent/30 transition-all group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    {/* Division badge overlay */}
                    {ls && (
                      <div className="absolute top-2 left-2">
                        <DivBadge div={ls.div} size="sm" />
                      </div>
                    )}
                    {/* Compare price discount */}
                    {product.compareAtPrice &&
                      product.compareAtPrice > product.price && (
                        <span className="absolute top-2 right-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          -
                          {Math.round(
                            (1 - product.price / product.compareAtPrice) * 100
                          )}
                          %
                        </span>
                      )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 space-y-1.5">
                    {product.brand && (
                      <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
                        {product.brand.name}
                      </p>
                    )}
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-foreground">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice &&
                        product.compareAtPrice > product.price && (
                          <span className="text-xs text-muted line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                    </div>

                    {/* Rating + Evidence */}
                    <div className="flex items-center gap-2 text-xs text-muted">
                      {avgRating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {avgRating.toFixed(1)}
                          <span className="text-gray-400">
                            ({product._count.reviews})
                          </span>
                        </span>
                      )}
                      {product._count.evidencePosts > 0 && (
                        <span className="flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-success" />
                          {product._count.evidencePosts} evidence
                        </span>
                      )}
                    </div>

                    {/* League info */}
                    {ls && (
                      <p className="text-[10px] text-muted">
                        {ls.league.name}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Shorts Section */}
      {shorts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">
                Shorts
              </h2>
            </div>
            <Link
              href="/content?type=short"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              See more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin">
            {shorts.map((post) => (
              <div key={post.id} className="shrink-0 w-[160px]">
                <Link href={`/content/${post.id}`}>
                  <ShortsCard content={mapContentToCard(post)} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Long Videos Section */}
      {longVideos.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">
                Videos
              </h2>
            </div>
            <Link
              href="/content?type=long"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              See more <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {longVideos.map((post) => (
              <Link key={post.id} href={`/content/${post.id}`}>
                <ContentCard content={mapContentToCard(post)} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Active Challenges */}
      {challenges.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              <h2 className="text-2xl font-semibold text-foreground">
                Active Challenges
              </h2>
            </div>
            <Link
              href="/challenges"
              className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((challenge) => {
              const remaining = daysUntil(challenge.endDate);

              return (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.hashtag}`}
                  className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      #{challenge.hashtag}
                    </span>
                    <span className="text-xs text-muted">
                      {challenge.league.name}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted line-clamp-2 mb-4">
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-3">
                      {challenge.prizePool > 0 && (
                        <span className="flex items-center gap-1 text-success font-medium">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatNumber(challenge.prizePool)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {remaining} days left
                      </span>
                    </div>
                    <span>
                      {challenge._count.entries}{" "}
                      {challenge._count.entries === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

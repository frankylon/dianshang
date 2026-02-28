import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Lock,
  Video,
  Image as ImageIcon,
  Images,
  CheckCircle,
  Clock,
  Weight,
  Tag,
  Shield,
  AlertCircle,
  Headphones,
  ArrowRight,
  Package,
  Store,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { formatPrice, parseTags, getSourceBadge } from "@/lib/utils";
import { RefereePanel } from "@/components/referee-panel";
import { ContentCard } from "@/components/content-card";
import { DivBadge } from "@/components/div-badge";
import { Tabs } from "@/components/tabs";
import { CustomPageRenderer } from "@/components/custom-page-renderer";

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      merchant: true,
      leagueStatuses: {
        include: { league: true },
      },
      reviews: {
        include: { user: true },
      },
      votes: true,
      evidencePosts: {
        include: { user: true },
        orderBy: { weight: "desc" },
      },
      contentPosts: {
        include: { metrics: true, author: true },
      },
      customPages: {
        where: { isPublished: true, reviewStatus: "approved" },
        take: 1,
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Derive data
  const leagueStatus = product.leagueStatuses[0] ?? null;
  const functionTags = parseTags(product.functionTags);
  const sceneTags = parseTags(product.sceneTags);
  const riskTags = parseTags(product.riskTags);
  const brandContentPosts = product.contentPosts.filter(
    (p) => p.source === "brand"
  );
  const userContentPosts = product.contentPosts.filter(
    (p) => p.source === "user"
  );
  const hasSponsor = false;
  const customPage = product.customPages[0] ?? null;

  // Average rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      : 0;

  // Parse custom page layout
  let customLayout: { sections: Array<{ type: string; config: Record<string, string | number | boolean> }> } | null = null;
  if (customPage) {
    try {
      customLayout = JSON.parse(customPage.layout);
    } catch {
      customLayout = null;
    }
  }

  // Media type icon helper
  function MediaTypeIcon({ type }: { type: string }) {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-green-500" />;
      case "gallery":
        return <Images className="w-4 h-4 text-purple-500" />;
      default:
        return <Package className="w-4 h-4 text-muted" />;
    }
  }

  // Status badge helper
  function StatusBadge({ status }: { status: string }) {
    if (status === "verified") {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }

  // Star rendering helper
  function StarRating({ rating }: { rating: number }) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* TAB CONTENT                                                        */
  /* ------------------------------------------------------------------ */

  const overviewContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Description
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          {product.description}
        </p>
      </div>

      {leagueStatus && (
        <RefereePanel
          leagueStatus={{
            div: leagueStatus.div,
            rankScore: leagueStatus.rankScore,
            hypeScore: leagueStatus.hypeScore,
            proofScore: leagueStatus.proofScore,
            evidenceCount: leagueStatus.evidenceCount,
            returnRate: leagueStatus.returnRate,
            complaintRate: leagueStatus.complaintRate,
            varStatus: leagueStatus.varStatus,
          }}
          hasSponsor={hasSponsor}
        />
      )}

      {(functionTags.length > 0 ||
        sceneTags.length > 0 ||
        riskTags.length > 0) && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Feature Tags
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {functionTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {sceneTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {riskTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100"
              >
                <AlertCircle className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const brandDemoContent = (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Brand Demo Content
      </h3>
      {brandContentPosts.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No brand demo content available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandContentPosts.map((post) => (
            <ContentCard
              key={post.id}
              content={{
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
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const communityContent = (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Community Content (UGC)
      </h3>
      {userContentPosts.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No community content yet. Be the first to share!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userContentPosts.map((post) => (
            <ContentCard
              key={post.id}
              content={{
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
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const evidenceContent = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-gray-50 border border-border rounded-lg p-3">
        <Lock className="w-4 h-4 text-muted" />
        <span className="text-sm font-semibold text-foreground">
          Evidence Wall
        </span>
        <span className="text-xs text-muted">
          Platform Verified &middot; Sorted by weight
        </span>
        <Shield className="w-4 h-4 text-accent ml-auto" />
      </div>

      {product.evidencePosts.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No evidence posts yet. Purchase this product to submit evidence.
        </p>
      ) : (
        <div className="space-y-3">
          {product.evidencePosts.map((evidence) => {
            const tags = evidence.structuredTags
              ? (() => {
                  try {
                    return JSON.parse(evidence.structuredTags) as Record<
                      string,
                      string
                    >;
                  } catch {
                    return {} as Record<string, string>;
                  }
                })()
              : ({} as Record<string, string>);

            return (
              <div
                key={evidence.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <MediaTypeIcon type={evidence.mediaType} />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                        {evidence.title}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">
                        by {evidence.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                      <Weight className="w-3 h-3" />
                      {evidence.weight.toFixed(1)}x
                    </span>
                    <StatusBadge status={evidence.status} />
                  </div>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {evidence.description}
                </p>
                {Object.keys(tags).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(tags).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200"
                      >
                        <span className="font-medium">{key}:</span> {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const reviewsContent = (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Customer Reviews
      </h3>
      {product.reviews.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No reviews yet. Purchase this product to leave a review.
        </p>
      ) : (
        <div className="space-y-3">
          {product.reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium text-foreground">
                    {review.user.name}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                  <Weight className="w-3 h-3" />
                  {review.weight.toFixed(1)}x weight
                </span>
              </div>
              {review.title && (
                <h4 className="text-sm font-semibold text-foreground">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-muted leading-relaxed">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ------------------------------------------------------------------ */
  /* RENDER                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen">
      {/* ============================================================= */}
      {/* STICKY TOP BAR: Product Info + Cart + Rankings                 */}
      {/* This section stays locked at the top                          */}
      {/* ============================================================= */}
      <div className="sticky top-14 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4 items-center">
            {/* Product image + basic info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-100 border border-border flex-shrink-0 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {product.brand && (
                  <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
                    {product.brand.name}
                  </p>
                )}
                <h1 className="text-sm font-bold text-foreground truncate">
                  {product.name}
                </h1>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.price && (
                      <span className="text-xs text-muted line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                </div>
              </div>
            </div>

            {/* League ranking + VAR data */}
            <div className="flex items-center gap-3 overflow-x-auto">
              {leagueStatus && (
                <>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <DivBadge div={leagueStatus.div} size="sm" />
                    <span className="text-xs text-muted">
                      {leagueStatus.league.name}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border shrink-0" />
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    <span className="text-muted">
                      Rank{" "}
                      <span className="font-bold text-foreground">
                        {leagueStatus.rankScore.toFixed(0)}
                      </span>
                    </span>
                    <span className="text-hype">
                      Hype{" "}
                      <span className="font-bold">
                        {leagueStatus.hypeScore.toFixed(0)}
                      </span>
                    </span>
                    <span className="text-proof">
                      Proof{" "}
                      <span className="font-bold">
                        {leagueStatus.proofScore.toFixed(0)}
                      </span>
                    </span>
                    <span className="text-muted">
                      Evidence{" "}
                      <span className="font-bold text-foreground">
                        {leagueStatus.evidenceCount}
                      </span>
                    </span>
                  </div>
                  <div className="h-6 w-px bg-border shrink-0" />
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                      leagueStatus.varStatus === "clear"
                        ? "bg-green-100 text-green-700"
                        : leagueStatus.varStatus === "under_review"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    VAR: {leagueStatus.varStatus.replace(/_/g, " ")}
                  </span>
                </>
              )}
              {avgRating > 0 && (
                <>
                  <div className="h-6 w-px bg-border shrink-0" />
                  <span className="flex items-center gap-1 text-xs shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-muted">
                      ({product.reviews.length})
                    </span>
                  </span>
                </>
              )}
            </div>

            {/* Add to Cart button */}
            <button className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm whitespace-nowrap shrink-0">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* MAIN HERO: Large product image + details                      */}
      {/* ============================================================= */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl border border-border overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <Package className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-4">
            {product.brand && (
              <span className="text-xs text-muted uppercase tracking-wider font-medium">
                {product.brand.name}
              </span>
            )}

            <h2 className="text-2xl font-bold text-foreground leading-tight">
              {product.name}
            </h2>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > product.price && (
                  <span className="text-sm text-muted line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
            </div>

            {/* Tags */}
            {(sceneTags.length > 0 || functionTags.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {sceneTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    {tag}
                  </span>
                ))}
                {functionTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* League + Division */}
            {leagueStatus && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>League:</span>
                <span className="font-medium text-foreground">
                  {leagueStatus.league.name}
                </span>
                <DivBadge div={leagueStatus.div} size="sm" />
              </div>
            )}

            {/* Compact Referee Panel */}
            {leagueStatus && (
              <RefereePanel
                leagueStatus={{
                  div: leagueStatus.div,
                  rankScore: leagueStatus.rankScore,
                  hypeScore: leagueStatus.hypeScore,
                  proofScore: leagueStatus.proofScore,
                  evidenceCount: leagueStatus.evidenceCount,
                  returnRate: leagueStatus.returnRate,
                  complaintRate: leagueStatus.complaintRate,
                  varStatus: leagueStatus.varStatus,
                }}
                hasSponsor={hasSponsor}
                compact
              />
            )}

            <p className="text-sm text-muted leading-relaxed line-clamp-3">
              {product.description}
            </p>

            {/* Merchant info */}
            <div className="flex items-center gap-2 text-xs text-muted mt-auto pt-2 border-t border-border">
              <Store className="w-3.5 h-3.5" />
              <span>
                Sold by{" "}
                <span className="font-medium text-foreground">
                  {product.merchant.businessName}
                </span>
              </span>
              {product.merchant.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-success" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* MERCHANT CUSTOM LANDING PAGE                                   */}
      {/* Shown if merchant has published a custom page                  */}
      {/* ============================================================= */}
      {customPage && customLayout && (
        <section className="border-t border-border">
          <CustomPageRenderer
            layout={customLayout}
            theme={customPage.theme}
            productName={product.name}
            productDescription={product.description}
            brandName={product.brand?.name}
            brandContentPosts={brandContentPosts.map((p) => ({
              id: p.id,
              title: p.title,
              coverUrl: p.coverUrl,
              mediaUrl: p.mediaUrl,
            }))}
            reviews={product.reviews.map((r) => ({
              userName: r.user.name,
              rating: r.rating,
              content: r.content,
            }))}
            functionTags={functionTags}
          />
        </section>
      )}

      {/* ============================================================= */}
      {/* TABS (Evidence, Reviews, Community, etc.)                      */}
      {/* ============================================================= */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <Tabs
          tabs={[
            { id: "overview", label: "Overview", content: overviewContent },
            {
              id: "brand-demo",
              label: "Brand Demo",
              content: brandDemoContent,
            },
            { id: "community", label: "Community", content: communityContent },
            { id: "evidence", label: "Evidence", content: evidenceContent },
            { id: "reviews", label: "Reviews", content: reviewsContent },
          ]}
        />
      </section>

      {/* ============================================================= */}
      {/* BOTTOM LINKS                                                   */}
      {/* ============================================================= */}
      <section className="max-w-5xl mx-auto px-4 pb-8 space-y-3">
        <Link
          href={
            leagueStatus
              ? `/league/${leagueStatus.league.slug}`
              : "/products"
          }
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border hover:bg-gray-100 transition-colors group"
        >
          <span className="text-sm font-medium text-foreground">
            Browse Related Products
          </span>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href="/support"
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-border hover:bg-gray-100 transition-colors group"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Headphones className="w-4 h-4 text-muted" />
            After-Sales &amp; Dispute Center
          </span>
          <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
        </Link>
      </section>
    </div>
  );
}

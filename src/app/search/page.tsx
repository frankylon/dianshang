import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { ShortsCard } from "@/components/content-card";
import { DivBadge } from "@/components/div-badge";
import Link from "next/link";
import {
  Search,
  Shield,
  Star,
  Sparkles,
  ChevronDown,
  Swords,
  AlertTriangle,
  Gift,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Search Results - LeagueShop",
  description: "Find the best products for your pain point, ranked by real evidence.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  if (!query) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10">
            <Search className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">Describe your problem to find the best products</h1>
          <p className="text-muted max-w-md mx-auto">
            Search by pain point, scenario, or what you need help with. We will show you
            products ranked by real evidence, not ads.
          </p>
          <form action="/search" method="GET" className="max-w-lg mx-auto">
            <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 bg-card shadow-sm focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-all">
              <Search className="w-5 h-5 text-muted shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="e.g. non-stick pan that actually lasts, cleaning pet hair..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted/60"
                autoFocus
              />
              <button
                type="submit"
                className="bg-accent text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Data Fetching ---

  // Build search terms for OR matching
  const searchTerms = query.split(/\s+/).filter(Boolean);
  const termPatterns = searchTerms.map((t) => `%${t}%`);

  // 1. Find matching league IDs based on pain point / description
  const matchingLeagues = await prisma.league.findMany({
    where: {
      isActive: true,
      OR: [
        { painPoint: { contains: query } },
        { description: { contains: query } },
        { name: { contains: query } },
        ...termPatterns.flatMap((pat) => [
          { painPoint: { contains: pat.replace(/%/g, "") } },
          { description: { contains: pat.replace(/%/g, "") } },
        ]),
      ],
    },
    select: { id: true },
  });
  const leagueIds = matchingLeagues.map((l) => l.id);

  // 2. Search products by matching query against name, description, sceneTags, functionTags
  //    and also include products that belong to matching leagues
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { sceneTags: { contains: query } },
        { functionTags: { contains: query } },
        ...termPatterns.flatMap((pat) => {
          const term = pat.replace(/%/g, "");
          return [
            { name: { contains: term } },
            { description: { contains: term } },
            { sceneTags: { contains: term } },
            { functionTags: { contains: term } },
          ];
        }),
        // Products in matching leagues
        ...(leagueIds.length > 0
          ? [{ leagueStatuses: { some: { leagueId: { in: leagueIds } } } }]
          : []),
      ],
    },
    include: {
      leagueStatuses: true,
      brand: {
        select: { name: true },
      },
    },
  });

  if (products.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SearchHeader query={query} resultCount={0} />
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <Search className="w-8 h-8 text-muted" />
          </div>
          <h2 className="text-xl font-semibold">No products found for this pain point</h2>
          <p className="text-muted max-w-md mx-auto">
            Try different keywords or describe your problem in another way. Our league is
            growing every day with new products.
          </p>
        </div>
      </div>
    );
  }

  // 3. Collect all product IDs and league IDs for related queries
  const productIds = products.map((p) => p.id);
  const allLeagueIds = [
    ...new Set(
      products.flatMap((p) => p.leagueStatuses.map((ls) => ls.leagueId))
    ),
  ];

  // 4. Fetch related short videos and PK matches in parallel
  const [shorts, pkMatches] = await Promise.all([
    prisma.contentPost.findMany({
      where: {
        type: "short",
        leagueId: { in: allLeagueIds.length > 0 ? allLeagueIds : undefined },
      },
      include: {
        metrics: true,
      },
      take: 12,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.pkMatch.findMany({
      where: {
        status: "active",
        OR: [
          { productAId: { in: productIds } },
          { productBId: { in: productIds } },
        ],
      },
      include: {
        productA: { select: { name: true, slug: true } },
        productB: { select: { name: true, slug: true } },
      },
      take: 5,
    }),
  ]);

  // --- Group products by Div ---

  // For each product, pick the best (lowest div) league status
  type ProductWithRelations = (typeof products)[number];

  function getBestLeagueStatus(product: ProductWithRelations) {
    if (product.leagueStatuses.length === 0) return null;
    return product.leagueStatuses.reduce((best, current) =>
      current.div < best.div || (current.div === best.div && current.rankScore > best.rankScore)
        ? current
        : best
    );
  }

  const div1Products: ProductWithRelations[] = [];
  const div2Products: ProductWithRelations[] = [];
  const div3Products: ProductWithRelations[] = [];

  for (const product of products) {
    const status = getBestLeagueStatus(product);
    const div = status?.div ?? 3;
    if (div === 1) div1Products.push(product);
    else if (div === 2) div2Products.push(product);
    else div3Products.push(product);
  }

  // Sort each group by rankScore descending
  const sortByRank = (a: ProductWithRelations, b: ProductWithRelations) => {
    const aScore = getBestLeagueStatus(a)?.rankScore ?? 0;
    const bScore = getBestLeagueStatus(b)?.rankScore ?? 0;
    return bScore - aScore;
  };

  div1Products.sort(sortByRank);
  div2Products.sort(sortByRank);
  div3Products.sort(sortByRank);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Search Header */}
      <SearchHeader query={query} resultCount={products.length} />

      <div className="mt-8 space-y-10">
        {/* Div 1 - Champion Pick */}
        {div1Products.length > 0 && (
          <section>
            <DivSectionHeader
              div={1}
              title="Div1 - Champion Pick"
              description="Top-tier products proven by real evidence. Trusted by the community."
              icon={<Shield className="w-5 h-5" />}
              accentColor="border-div1"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {div1Products.slice(0, 6).map((product) => {
                const status = getBestLeagueStatus(product);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    leagueStatus={status}
                    brand={product.brand}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Div 2 - Dark Horse */}
        {div2Products.length > 0 && (
          <section>
            <DivSectionHeader
              div={2}
              title="Div2 - Dark Horse"
              description="Rising contenders with growing proof. Extra rewards for early believers."
              icon={<Star className="w-5 h-5" />}
              accentColor="border-div2"
              rewardBadge={
                <span className="inline-flex items-center gap-1.5 bg-div2/10 text-div2 text-sm font-semibold px-3 py-1 rounded-full">
                  <Gift className="w-4 h-4" />
                  3% Credit Back
                </span>
              }
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {div2Products.slice(0, 6).map((product) => {
                const status = getBestLeagueStatus(product);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    leagueStatus={status}
                    brand={product.brand}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Related Shorts - Collapsible */}
        {shorts.length > 0 && (
          <section>
            <details className="group" open>
              <summary className="flex items-center gap-2 cursor-pointer select-none list-none">
                <div className="flex items-center gap-2 flex-1">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-bold">Related Shorts</h2>
                  <span className="text-xs text-muted bg-gray-100 px-2 py-0.5 rounded-full">
                    {shorts.length}
                  </span>
                </div>
                <ChevronDown className="w-5 h-5 text-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                {shorts.map((short) => (
                  <div key={short.id} className="shrink-0">
                    <ShortsCard
                      content={{
                        id: short.id,
                        title: short.title,
                        coverUrl: short.coverUrl,
                        mediaUrl: short.mediaUrl,
                        source: short.source,
                        type: short.type,
                        duration: short.duration,
                        metrics: short.metrics
                          ? {
                              views: short.metrics.views,
                              likes: short.metrics.likes,
                              saves: short.metrics.saves,
                              shares: short.metrics.shares,
                            }
                          : null,
                      }}
                    />
                  </div>
                ))}
              </div>
            </details>
          </section>
        )}

        {/* Div 3 - Rookie Trial */}
        {div3Products.length > 0 && (
          <section>
            <DivSectionHeader
              div={3}
              title="Div3 - Rookie Trial"
              description="New entries still building their track record. Highest rewards, but do your research."
              icon={<Sparkles className="w-5 h-5" />}
              accentColor="border-div3"
              rewardBadge={
                <span className="inline-flex items-center gap-1.5 bg-div3/10 text-div3 text-sm font-semibold px-3 py-1 rounded-full">
                  <Gift className="w-4 h-4" />
                  5% Credit Back
                </span>
              }
              riskWarning
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {div3Products.slice(0, 6).map((product) => {
                const status = getBestLeagueStatus(product);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    leagueStatus={status}
                    brand={product.brand}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* PK Arena Entry */}
        {pkMatches.length > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-danger/10">
                <Swords className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-lg font-bold">PK Arena</h2>
                <p className="text-xs text-muted">
                  Active head-to-head battles between products in your search
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {pkMatches.map((pk) => (
                <Link
                  key={pk.id}
                  href={`/pk/${pk.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-accent/40 hover:bg-accent/5 transition-all group"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium group-hover:text-accent transition-colors">
                      {pk.productA.name}
                    </span>
                    <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                      VS
                    </span>
                    <span className="font-medium group-hover:text-accent transition-colors">
                      {pk.productB.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted group-hover:text-accent transition-colors">
                    View Battle &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function SearchHeader({ query, resultCount }: { query: string; resultCount: number }) {
  return (
    <div className="space-y-4">
      <form action="/search" method="GET">
        <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 bg-card shadow-sm focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-all">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Describe your problem..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted/60"
          />
          <button
            type="submit"
            className="bg-accent text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      <div className="flex items-center gap-2 text-sm text-muted">
        <span>
          Found <strong className="text-foreground">{resultCount}</strong>{" "}
          {resultCount === 1 ? "product" : "products"} for
        </span>
        <span className="font-medium text-foreground bg-gray-100 px-2.5 py-0.5 rounded-lg">
          &ldquo;{query}&rdquo;
        </span>
      </div>
    </div>
  );
}

function DivSectionHeader({
  div,
  title,
  description,
  icon,
  accentColor,
  rewardBadge,
  riskWarning,
}: {
  div: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  rewardBadge?: React.ReactNode;
  riskWarning?: boolean;
}) {
  return (
    <div className={`border-l-4 ${accentColor} pl-4 py-2`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <DivBadge div={div} size="md" />
        {rewardBadge}
      </div>
      <p className="text-sm text-muted mt-1">{description}</p>
      {riskWarning && (
        <div className="flex items-center gap-2 mt-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            <strong>Risk notice:</strong> Div3 products have limited evidence and shorter track
            records. The higher credit reward compensates for the extra risk. Always check
            evidence count and return rates before purchasing.
          </span>
        </div>
      )}
    </div>
  );
}

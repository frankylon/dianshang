import { prisma } from "@/lib/db";
import Link from "next/link";
import { Trophy, Crown, Star, Sparkles, Swords, ChevronRight } from "lucide-react";
import { DivBadge } from "@/components/div-badge";
import { ProductCard } from "@/components/product-card";

export default async function LeaguesPage() {
  const leagues = await prisma.league.findMany({
    where: { isActive: true },
    include: {
      seasons: { where: { isCurrent: true }, take: 1 },
      productStatuses: {
        include: { product: { include: { brand: true } } },
        orderBy: { rankScore: "desc" },
      },
      challenges: { where: { status: "active" }, take: 3 },
      pkMatches: { where: { status: "active" }, include: { productA: true, productB: true }, take: 3 },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Leagues</h1>
          <p className="text-muted text-sm">Products compete like athletes. Rankings driven by real evidence.</p>
        </div>
      </div>

      {leagues.map((league) => {
        const season = league.seasons[0];
        const div1 = league.productStatuses.filter((s) => s.div === 1).slice(0, 3);
        const div2 = league.productStatuses.filter((s) => s.div === 2).slice(0, 3);
        const div3 = league.productStatuses.filter((s) => s.div === 3).slice(0, 3);
        const champion = div1[0];

        return (
          <section key={league.id} className="bg-card border border-border rounded-xl overflow-hidden">
            {/* League Header */}
            <div className="bg-gradient-to-r from-accent/5 to-transparent p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    {league.name}
                  </h2>
                  <p className="text-muted text-sm mt-1">{league.painPoint}</p>
                  {season && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full mt-2 inline-block">
                      {season.name}
                    </span>
                  )}
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(league.painPoint)}`}
                  className="text-accent text-sm hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Champion highlight */}
              {champion && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                  <Crown className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Current Champion</span>
                    <h3 className="font-bold text-lg">
                      <Link href={`/product/${champion.product.slug}`} className="hover:text-accent">
                        {champion.product.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted">
                      {champion.product.brand?.name} · Rank {champion.rankScore} · {champion.evidenceCount} evidence
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-700">{champion.rankScore}</div>
                    <div className="text-xs text-muted">Rank Score</div>
                  </div>
                </div>
              )}

              {/* Div Sections */}
              {[
                { div: 1, items: div1, icon: <Crown className="w-4 h-4" />, label: "Champion Pick" },
                { div: 2, items: div2, icon: <Star className="w-4 h-4" />, label: "Dark Horse" },
                { div: 3, items: div3, icon: <Sparkles className="w-4 h-4" />, label: "Rookie Trial" },
              ].map(({ div, items, icon, label }) => (
                items.length > 0 && (
                  <div key={div}>
                    <div className="flex items-center gap-2 mb-3">
                      <DivBadge div={div} size="md" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((status) => (
                        <ProductCard
                          key={status.id}
                          product={status.product}
                          leagueStatus={status}
                          brand={status.product.brand}
                        />
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* Active PK Matches */}
              {league.pkMatches.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Swords className="w-4 h-4 text-accent" /> Active PK Battles
                  </h3>
                  <div className="space-y-2">
                    {league.pkMatches.map((pk) => (
                      <Link
                        key={pk.id}
                        href={`/pk/${pk.id}`}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-sm">{pk.productA.name}</span>
                        <span className="text-xs text-accent font-bold px-2">VS</span>
                        <span className="font-medium text-sm">{pk.productB.name}</span>
                        <ChevronRight className="w-4 h-4 text-muted" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Challenges */}
              {league.challenges.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3">Active Challenges</h3>
                  <div className="flex gap-3 overflow-x-auto">
                    {league.challenges.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/challenges/${ch.id}`}
                        className="shrink-0 bg-gradient-to-br from-accent/5 to-purple-50 border border-border rounded-lg p-3 w-56 hover:shadow-md transition-shadow"
                      >
                        <span className="text-accent font-bold text-sm">{ch.hashtag}</span>
                        <p className="text-xs text-muted mt-1 line-clamp-2">{ch.description}</p>
                        {ch.prizePool > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mt-2 inline-block">
                            Prize: ${ch.prizePool}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

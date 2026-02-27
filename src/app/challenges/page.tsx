import { prisma } from "@/lib/db";
import Link from "next/link";
import { Flame, Trophy, Calendar, DollarSign, Users, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
  const challenges = await prisma.challenge.findMany({
    include: {
      league: true,
      entries: { include: { contentPost: { include: { metrics: true, author: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const active = challenges.filter((c) => c.status === "active");
  const ended = challenges.filter((c) => c.status === "ended");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center gap-3">
        <Flame className="w-7 h-7 text-accent" />
        <div>
          <h1 className="text-2xl font-bold">Pain Point Challenges</h1>
          <p className="text-muted text-sm">Compete with your Shorts to win prizes! Show the world your hacks.</p>
        </div>
      </div>

      {/* Active Challenges */}
      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-danger" /> Active Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {active.map((ch) => (
              <Link key={ch.id} href={`/challenges/${ch.id}`}>
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gradient-to-r from-accent/10 via-purple-50 to-pink-50 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-accent font-bold text-xl">{ch.hashtag}</span>
                      <span className="bg-success/10 text-success text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{ch.title}</h3>
                    <p className="text-muted text-sm">{ch.description}</p>
                  </div>
                  <div className="p-4 flex items-center justify-between border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {ch.league.name}
                      </span>
                      {ch.prizePool > 0 && (
                        <span className="flex items-center gap-1 text-warning font-medium">
                          <DollarSign className="w-4 h-4" />
                          ${ch.prizePool} Prize
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {ch.entries.length} entries
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Calendar className="w-3 h-3" />
                      Ends {new Date(ch.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Ended Challenges */}
      {ended.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 text-muted">Past Challenges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ended.map((ch) => (
              <Link key={ch.id} href={`/challenges/${ch.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 opacity-70 hover:opacity-100 transition-opacity">
                  <span className="text-sm font-bold text-muted">{ch.hashtag}</span>
                  <p className="text-xs text-muted mt-1">{ch.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted">
                    <Users className="w-3 h-3" /> {ch.entries.length} entries
                    <span>·</span>
                    <span>{ch.league.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {challenges.length === 0 && (
        <div className="text-center py-16 text-muted">
          <Flame className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No challenges yet. Stay tuned!</p>
        </div>
      )}
    </div>
  );
}

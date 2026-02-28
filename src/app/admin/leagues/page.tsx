import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Plus, Users, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminLeaguesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const leagues = await prisma.league.findMany({
    include: {
      productStatuses: true,
      seasons: { where: { isCurrent: true }, take: 1 },
      challenges: { where: { status: "active" } },
      _count: { select: { productStatuses: true, pkMatches: true, challenges: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">League Management</h2>
        <Link href="/admin/leagues/new" className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <Plus className="h-4 w-4" />
          Create League
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">League</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pain Point</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Products</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">PK Matches</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Challenges</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Current Season</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leagues.map((league) => {
              const currentSeason = league.seasons[0];
              return (
                <tr key={league.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">{league.name}</p>
                        <p className="text-xs text-gray-500">{league.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{league.painPoint}</td>
                  <td className="px-4 py-3 text-center">{league._count.productStatuses}</td>
                  <td className="px-4 py-3 text-center">{league._count.pkMatches}</td>
                  <td className="px-4 py-3 text-center">{league._count.challenges}</td>
                  <td className="px-4 py-3 text-center text-xs">
                    {currentSeason ? currentSeason.name : <span className="text-gray-400">None</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      league.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {league.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-blue-600 hover:underline mr-3">Edit</button>
                    <button className="text-xs text-gray-500 hover:underline">
                      {league.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {leagues.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No leagues created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Division Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Division Distribution</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { div: 1, label: "Div 1: Champion Pick", color: "border-amber-400 bg-amber-50" },
            { div: 2, label: "Div 2: Dark Horse", color: "border-blue-400 bg-blue-50" },
            { div: 3, label: "Div 3: Rookie Trial", color: "border-green-400 bg-green-50" },
          ].map((d) => {
            const count = leagues.reduce(
              (sum, l) => sum + l.productStatuses.filter((ps) => ps.div === d.div).length,
              0
            );
            return (
              <div key={d.div} className={`border-l-4 ${d.color} rounded-r-lg p-4`}>
                <p className="text-sm font-medium text-gray-700">{d.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count} products</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

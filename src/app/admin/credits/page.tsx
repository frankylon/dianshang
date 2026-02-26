import { prisma } from "@/lib/db";
import { Coins, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminCreditsPage() {
  const ledgerEntries = await prisma.creditsLedger.findMany({
    include: {
      user: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalEarned = ledgerEntries
    .filter((e) => e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpent = ledgerEntries
    .filter((e) => e.amount < 0)
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);

  const uniqueUsers = new Set(ledgerEntries.map((e) => e.userId)).size;

  // Group by type
  const byType = ledgerEntries.reduce<Record<string, { count: number; total: number }>>((acc, e) => {
    if (!acc[e.type]) acc[e.type] = { count: 0, total: 0 };
    acc[e.type].count++;
    acc[e.type].total += e.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Credits & Rewards</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Earned", value: formatPrice(totalEarned), icon: TrendingUp, color: "text-green-600 bg-green-50" },
          { label: "Total Spent", value: formatPrice(totalSpent), icon: TrendingDown, color: "text-red-600 bg-red-50" },
          { label: "Net Credits", value: formatPrice(totalEarned - totalSpent), icon: Coins, color: "text-blue-600 bg-blue-50" },
          { label: "Users with Credits", value: uniqueUsers, icon: RefreshCw, color: "text-purple-600 bg-purple-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Breakdown by Type */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Breakdown by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(byType).map(([type, data]) => (
            <div key={type} className="border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-500">{type.replace(/_/g, " ")}</p>
              <p className="text-lg font-bold text-gray-900">{data.count} entries</p>
              <p className={`text-sm font-medium ${data.total >= 0 ? "text-green-600" : "text-red-600"}`}>
                {data.total >= 0 ? "+" : ""}{formatPrice(data.total)}
              </p>
            </div>
          ))}
          {Object.keys(byType).length === 0 && (
            <p className="text-sm text-gray-500 col-span-4">No credit activity yet</p>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{entry.user.name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {entry.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-[250px] truncate">{entry.description}</td>
                <td className={`px-4 py-3 text-right font-medium ${
                  entry.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {entry.amount >= 0 ? "+" : ""}{formatPrice(entry.amount)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{formatPrice(entry.balance)}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {ledgerEntries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No credit activity yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice, formatNumber, getDivLabel, getDivColor, getVarStatusLabel } from "@/lib/utils";
import {
  Package,
  DollarSign,
  Trophy,
  Shield,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MerchantDashboard() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "merchant" && session.role !== "admin") {
    redirect("/");
  }

  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.id },
    include: { brand: true },
  });

  if (!merchant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Merchant Account Not Found
          </h2>
          <p className="text-gray-500 mt-2">
            No merchant profile is associated with this account.
          </p>
        </div>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: {
      leagueStatuses: { include: { league: true } },
      orderItems: { include: { order: true } },
    },
  });

  const deposits = await prisma.deposit.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  // Calculate stats
  const totalProducts = products.length;
  const totalRevenue = products.reduce(
    (sum, p) =>
      sum +
      p.orderItems.reduce((itemSum, oi) => itemSum + oi.totalPrice, 0),
    0
  );

  const activeLeagueIds = new Set(
    products.flatMap((p) => p.leagueStatuses.map((ls) => ls.leagueId))
  );
  const activeLeagues = activeLeagueIds.size;

  const varCaseCount = await prisma.varCase.count({
    where: {
      productLeagueStatus: {
        product: { merchantId: merchant.id },
      },
    },
  });

  // Recent orders (last 10 orders that contain this merchant's products)
  const recentOrderItems = await prisma.orderItem.findMany({
    where: { product: { merchantId: merchant.id } },
    include: {
      order: { include: { user: true } },
      product: true,
    },
    orderBy: { order: { createdAt: "desc" } },
    take: 10,
  });

  // Deduplicate by order ID to get unique recent orders
  const seenOrderIds = new Set<string>();
  const recentOrders = recentOrderItems.filter((item) => {
    if (seenOrderIds.has(item.orderId)) return false;
    seenOrderIds.add(item.orderId);
    return true;
  });

  // League statuses for all products
  const allLeagueStatuses = products.flatMap((p) =>
    p.leagueStatuses.map((ls) => ({
      productName: p.name,
      leagueName: ls.league.name,
      div: ls.div,
      rankScore: ls.rankScore,
      varStatus: ls.varStatus,
    }))
  );

  const stats = [
    {
      label: "Total Products",
      value: totalProducts.toString(),
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Active Leagues",
      value: activeLeagues.toString(),
      icon: Trophy,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "VAR Cases",
      value: varCaseCount.toString(),
      icon: Shield,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {merchant.businessName}
        </h1>
        <p className="text-gray-500 mt-1">
          {merchant.brand
            ? `Brand: ${merchant.brand.name}`
            : "Here is your store overview."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Orders
          </h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No orders yet. Your products will appear here once customers start
            purchasing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Order ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {item.order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-3 text-gray-900">
                      {item.order.user.name}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.order.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item.order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : item.order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.order.status.charAt(0).toUpperCase() +
                          item.order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(item.order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Product Performance
          </h2>
        </div>
        {allLeagueStatuses.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No league data yet. Submit your products to leagues to see
            performance metrics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">League</th>
                  <th className="px-6 py-3 font-medium">Division</th>
                  <th className="px-6 py-3 font-medium">Rank Score</th>
                  <th className="px-6 py-3 font-medium">VAR Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allLeagueStatuses.map((ls, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {ls.productName}
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {ls.leagueName}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDivColor(
                          ls.div
                        )}`}
                      >
                        Div {ls.div} - {getDivLabel(ls.div)}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-gray-900">
                      {ls.rankScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ls.varStatus === "clear"
                            ? "bg-green-100 text-green-700"
                            : ls.varStatus === "under_review"
                            ? "bg-yellow-100 text-yellow-700"
                            : ls.varStatus === "sanctioned"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {getVarStatusLabel(ls.varStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

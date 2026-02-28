import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  ShoppingCart,
  Package,
  Trophy,
  ShieldAlert,
  Users,
  Store,
  FileText,
  Camera,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    activeLeagues,
    openVarCases,
    totalUsers,
    totalMerchants,
    pendingContent,
    pendingEvidence,
    recentOrders,
    recentVarCases,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.league.count({ where: { isActive: true } }),
    prisma.varCase.count({ where: { status: { not: "resolved" } } }),
    prisma.user.count(),
    prisma.merchant.count(),
    prisma.contentPost.count({ where: { evidenceStatus: "pending" } }),
    prisma.evidencePost.count({ where: { status: "pending" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, items: { include: { product: true } } },
    }),
    prisma.varCase.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { productLeagueStatus: { include: { product: true, league: true } } },
    }),
  ]);

  const stats = [
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-600 bg-blue-50" },
    { label: "Revenue", value: `$${(totalRevenue._sum.totalAmount || 0).toFixed(2)}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Active Products", value: totalProducts, icon: Package, color: "text-purple-600 bg-purple-50" },
    { label: "Active Leagues", value: activeLeagues, icon: Trophy, color: "text-yellow-600 bg-yellow-50" },
    { label: "Open VAR Cases", value: openVarCases, icon: ShieldAlert, color: "text-red-600 bg-red-50" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-indigo-600 bg-indigo-50" },
    { label: "Merchants", value: totalMerchants, icon: Store, color: "text-teal-600 bg-teal-50" },
    { label: "Pending Reviews", value: pendingEvidence + pendingContent, icon: Camera, color: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{order.user.name}</p>
                    <p className="text-gray-500">
                      {order.items.map((i) => i.product.name).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === "completed" ? "bg-green-100 text-green-700" :
                      order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                      order.status === "cancelled" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Open VAR Cases */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Recent VAR Cases</h3>
          <div className="space-y-3">
            {recentVarCases.length === 0 ? (
              <p className="text-sm text-gray-500">No VAR cases</p>
            ) : (
              recentVarCases.map((vc) => (
                <div key={vc.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">
                      {vc.productLeagueStatus.product.name}
                    </p>
                    <p className="text-gray-500">
                      {vc.productLeagueStatus.league.name} &middot; {vc.triggerReason.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vc.status === "resolved" ? "bg-green-100 text-green-700" :
                    vc.status === "investigating" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {vc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  User,
  CreditCard,
  ShoppingCart,
  FileVideo,
  Award,
  Package,
} from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

const currentUserId = "user1";

export default async function AccountPage() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: currentUserId },
    include: {
      badges: { orderBy: { earnedAt: "desc" } },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: { product: true },
          },
        },
      },
      creditsLedger: true,
      evidencePosts: true,
      contentPosts: true,
    },
  });

  const totalOrders = await prisma.order.count({
    where: { userId: currentUserId },
  });

  const creditsBalance = user.creditsLedger.reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  const evidenceCount = user.evidencePosts.length;
  const contentCount = user.contentPosts.length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Account Overview</h1>

      {/* User Info Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-start gap-6">
        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
              {user.role}
            </span>
            {user.badges.length > 0 && (
              <span className="text-xs text-gray-400">
                {user.badges.length} badge{user.badges.length !== 1 && "s"} earned
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Credits</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPrice(creditsBalance)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Orders</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <FileVideo className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Evidence</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{evidenceCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Package className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Content</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{contentCount}</p>
        </div>
      </div>

      {/* Badges */}
      {user.badges.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Badges Earned</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <span
                key={badge.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200"
              >
                <Award className="h-3.5 w-3.5" />
                {badge.badge
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <Link
            href="/account/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {user.orders.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No orders yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {user.orders.map((order) => (
              <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">
                      {order.id.slice(0, 8)}...
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded"
                    >
                      {item.product.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-yellow-100 text-yellow-700",
    delivered: "bg-green-100 text-green-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

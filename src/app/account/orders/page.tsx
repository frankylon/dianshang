import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { Package } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">You have no orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order {order.id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <p className="text-sm font-bold text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} &times; {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

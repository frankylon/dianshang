import { prisma } from "@/lib/db";
import { Store, CheckCircle, XCircle, Package, DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default async function AdminMerchantsPage() {
  const merchants = await prisma.merchant.findMany({
    include: {
      user: true,
      brand: true,
      products: { select: { id: true, isActive: true } },
      deposits: { orderBy: { createdAt: "desc" }, take: 1 },
      sponsorships: { where: { isActive: true } },
      _count: { select: { products: true, customPages: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalMerchants = merchants.length;
  const verifiedCount = merchants.filter((m) => m.verified).length;
  const unverifiedCount = totalMerchants - verifiedCount;
  const totalProducts = merchants.reduce((sum, m) => sum + m._count.products, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Merchant Management</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Merchants", value: totalMerchants, icon: Store, color: "text-blue-600 bg-blue-50" },
          { label: "Verified", value: verifiedCount, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Unverified", value: unverifiedCount, icon: XCircle, color: "text-yellow-600 bg-yellow-50" },
          { label: "Total Products", value: totalProducts, icon: Package, color: "text-purple-600 bg-purple-50" },
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

      {/* Merchants Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Merchant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Verified</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Products</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Active Products</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Deposit Balance</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Sponsorships</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Custom Pages</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {merchants.map((merchant) => {
              const activeProducts = merchant.products.filter((p) => p.isActive).length;
              const latestDeposit = merchant.deposits[0];
              return (
                <tr key={merchant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{merchant.businessName}</p>
                    <p className="text-xs text-gray-500">{merchant.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {merchant.brand ? (
                      <div className="flex items-center gap-1">
                        <span>{merchant.brand.name}</span>
                        {merchant.brand.isChampion && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Champion</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {merchant.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-600 inline" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-300 inline" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{merchant._count.products}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{activeProducts}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {latestDeposit ? formatPrice(latestDeposit.balance) : "$0.00"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{merchant.sponsorships.length}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{merchant._count.customPages}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {!merchant.verified && (
                        <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                          Verify
                        </button>
                      )}
                      <button className="text-xs text-blue-600 hover:underline">View</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {merchants.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No merchants registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

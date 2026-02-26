import { prisma } from "@/lib/db";
import {
  formatPrice,
  getDivLabel,
  getDivColor,
  getVarStatusLabel,
} from "@/lib/utils";
import { Package, Plus, AlertTriangle, CheckCircle } from "lucide-react";

const currentUserId = "merchant1";

export default async function MerchantProducts() {
  const merchant = await prisma.merchant.findUnique({
    where: { userId: currentUserId },
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
      leagueStatuses: { include: { league: true, varCases: true } },
      evidencePosts: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">
            Manage your product catalog ({products.length} total)
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No products yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first product to the marketplace.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">Division</th>
                  <th className="px-6 py-3 font-medium">Rank Score</th>
                  <th className="px-6 py-3 font-medium">Evidence</th>
                  <th className="px-6 py-3 font-medium">VAR Status</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const primaryStatus = product.leagueStatuses[0];
                  const totalEvidence = product.evidencePosts.length;
                  const hasOpenVar = product.leagueStatuses.some(
                    (ls) => ls.varCases.some((vc) => vc.status === "open" || vc.status === "investigating")
                  );

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatPrice(product.price)}
                        {product.compareAtPrice && (
                          <span className="ml-1 text-xs text-gray-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            product.stock < 10
                              ? "text-red-600"
                              : product.stock < 50
                              ? "text-amber-600"
                              : "text-gray-900"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {primaryStatus ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDivColor(
                              primaryStatus.div
                            )}`}
                          >
                            Div {primaryStatus.div} -{" "}
                            {getDivLabel(primaryStatus.div)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Not in league
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-900">
                        {primaryStatus
                          ? primaryStatus.rankScore.toFixed(1)
                          : "--"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {totalEvidence}
                      </td>
                      <td className="px-6 py-4">
                        {primaryStatus ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              primaryStatus.varStatus === "clear"
                                ? "bg-green-100 text-green-700"
                                : primaryStatus.varStatus === "under_review"
                                ? "bg-yellow-100 text-yellow-700"
                                : primaryStatus.varStatus === "sanctioned"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {hasOpenVar && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {getVarStatusLabel(primaryStatus.varStatus)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">--</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

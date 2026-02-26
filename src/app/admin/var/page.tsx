import { prisma } from "@/lib/db";
import { ShieldAlert, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";

export default async function AdminVarPage() {
  const varCases = await prisma.varCase.findMany({
    include: {
      productLeagueStatus: {
        include: {
          product: { include: { merchant: true } },
          league: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const openCount = varCases.filter((c) => c.status === "open").length;
  const investigatingCount = varCases.filter((c) => c.status === "investigating").length;
  const resolvedCount = varCases.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">VAR Cases</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Open</p>
            <p className="text-xl font-bold text-gray-900">{openCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Investigating</p>
            <p className="text-xl font-bold text-gray-900">{investigatingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Resolved</p>
            <p className="text-xl font-bold text-gray-900">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">League</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Merchant</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Trigger</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Verdict</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {varCases.map((vc) => (
              <tr key={vc.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{vc.productLeagueStatus.product.name}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{vc.productLeagueStatus.league.name}</td>
                <td className="px-4 py-3 text-gray-600">{vc.productLeagueStatus.product.merchant.businessName}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {vc.triggerReason.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    vc.status === "open" ? "bg-red-100 text-red-700" :
                    vc.status === "investigating" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {vc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {vc.verdict ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      vc.verdict === "passed" ? "bg-green-100 text-green-700" :
                      vc.verdict === "remediation" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {vc.verdict}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(vc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {vc.status !== "resolved" ? (
                    <div className="flex gap-2 justify-end">
                      <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                        Pass
                      </button>
                      <button className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700">
                        Remediate
                      </button>
                      <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                        Fail
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Closed</span>
                  )}
                </td>
              </tr>
            ))}
            {varCases.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No VAR cases
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Merchant Response Preview */}
      {varCases.filter((c) => c.merchantResponse).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Merchant Responses</h3>
          <div className="space-y-3">
            {varCases
              .filter((c) => c.merchantResponse)
              .slice(0, 5)
              .map((vc) => (
                <div key={vc.id} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">
                      {vc.productLeagueStatus.product.name}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      vc.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {vc.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{vc.merchantResponse}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

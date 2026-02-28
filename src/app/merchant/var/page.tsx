import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Shield,
  AlertTriangle,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MerchantVar() {
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

  const varCases = await prisma.varCase.findMany({
    where: {
      productLeagueStatus: {
        product: { merchantId: merchant.id },
      },
    },
    include: {
      productLeagueStatus: {
        include: {
          product: true,
          league: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const openCases = varCases.filter(
    (vc) => vc.status === "open" || vc.status === "investigating"
  );
  const resolvedCases = varCases.filter((vc) => vc.status === "resolved");

  const statusConfig: Record<
    string,
    { label: string; icon: typeof Clock; className: string }
  > = {
    open: {
      label: "Open",
      icon: AlertTriangle,
      className: "bg-red-100 text-red-700",
    },
    investigating: {
      label: "Investigating",
      icon: Search,
      className: "bg-yellow-100 text-yellow-700",
    },
    resolved: {
      label: "Resolved",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700",
    },
  };

  const verdictConfig: Record<string, { label: string; className: string }> = {
    passed: { label: "Passed", className: "bg-green-100 text-green-700" },
    remediation: {
      label: "Remediation",
      className: "bg-amber-100 text-amber-700",
    },
    failed: { label: "Failed", className: "bg-red-100 text-red-700" },
  };

  const triggerLabels: Record<string, string> = {
    high_return_rate: "High Return Rate",
    evidence_complaint_spike: "Evidence Complaint Spike",
    repeated_defect_tags: "Repeated Defect Tags",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">VAR Cases</h1>
        <p className="text-gray-500 mt-1">
          Monitor and respond to product review cases
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Open Cases</p>
            <p className="text-xl font-bold text-gray-900">
              {openCases.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-xl font-bold text-gray-900">
              {resolvedCases.length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Cases</p>
            <p className="text-xl font-bold text-gray-900">
              {varCases.length}
            </p>
          </div>
        </div>
      </div>

      {/* VAR Cases Table */}
      {varCases.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <Shield className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No VAR cases
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your products have no active or historical VAR review cases. Keep
            up the quality!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">League</th>
                  <th className="px-6 py-3 font-medium">Trigger Reason</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Verdict</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {varCases.map((varCase) => {
                  const status = statusConfig[varCase.status] || {
                    label: varCase.status,
                    icon: Clock,
                    className: "bg-gray-100 text-gray-600",
                  };
                  const StatusIcon = status.icon;
                  const verdict = varCase.verdict
                    ? verdictConfig[varCase.verdict]
                    : null;
                  const isOpen =
                    varCase.status === "open" ||
                    varCase.status === "investigating";

                  return (
                    <tr key={varCase.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {varCase.productLeagueStatus.product.name}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {varCase.productLeagueStatus.league.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {triggerLabels[varCase.triggerReason] ||
                            varCase.triggerReason}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {verdict ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${verdict.className}`}
                          >
                            {verdict.label}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(varCase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {isOpen ? (
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Submit Response
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {varCase.resolvedAt
                              ? `Resolved ${new Date(
                                  varCase.resolvedAt
                                ).toLocaleDateString()}`
                              : "Closed"}
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

      {/* Merchant response info */}
      {openCases.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
          <p>
            <strong>Important:</strong> You have {openCases.length} open VAR
            case{openCases.length > 1 ? "s" : ""} that require your attention.
            Submitting a timely response with supporting evidence can help
            resolve cases favorably.
          </p>
        </div>
      )}
    </div>
  );
}

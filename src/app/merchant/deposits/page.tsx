import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  MinusCircle,
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MerchantDeposits() {
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

  const deposits = await prisma.deposit.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  });

  // Current balance is the latest deposit's running balance
  const currentBalance = deposits.length > 0 ? deposits[0].balance : 0;

  // Calculate totals
  const totalDeposited = deposits
    .filter((d) => d.amount > 0)
    .reduce((sum, d) => sum + d.amount, 0);
  const totalDeducted = deposits
    .filter((d) => d.amount < 0)
    .reduce((sum, d) => sum + Math.abs(d.amount), 0);

  const typeConfig: Record<
    string,
    { label: string; icon: typeof ArrowUpCircle; color: string }
  > = {
    initial: {
      label: "Initial Deposit",
      icon: ArrowUpCircle,
      color: "text-green-600",
    },
    top_up: {
      label: "Top Up",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    deduction: {
      label: "Deduction",
      icon: ArrowDownCircle,
      color: "text-red-600",
    },
    refund: {
      label: "Refund",
      icon: RefreshCw,
      color: "text-amber-600",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Deposits & Penalties
        </h1>
        <p className="text-gray-500 mt-1">
          Track your deposit balance and transaction history
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(currentBalance)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deposited</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalDeposited)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Deducted</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(totalDeducted)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h2>
        </div>

        {deposits.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="mt-3 text-sm font-medium text-gray-900">
              No transactions yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Your deposit history will appear here once you make your initial
              deposit.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Reason</th>
                  <th className="px-6 py-3 font-medium text-right">
                    Running Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deposits.map((deposit) => {
                  const config = typeConfig[deposit.type] || {
                    label: deposit.type,
                    icon: MinusCircle,
                    color: "text-gray-500",
                  };
                  const TypeIcon = config.icon;
                  const isPositive = deposit.amount > 0;

                  return (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">
                        {new Date(deposit.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <TypeIcon
                            className={`w-4 h-4 ${config.color}`}
                          />
                          <span className="font-medium text-gray-900">
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`font-medium ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatPrice(deposit.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                        {deposit.reason || "--"}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-medium text-gray-900">
                        {formatPrice(deposit.balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
        <p>
          <strong>Deposit policy:</strong> Merchants are required to maintain a
          minimum deposit balance. Deductions may occur from VAR penalties,
          return processing fees, or quality violations. Top up your balance to
          ensure uninterrupted listing status.
        </p>
      </div>
    </div>
  );
}

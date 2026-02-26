import { prisma } from "@/lib/db";
import {
  Layers,
  Plus,
  Palette,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";

const currentUserId = "merchant1";

export default async function MerchantPages() {
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

  const customPages = await prisma.customProductPage.findMany({
    where: { merchantId: merchant.id },
    include: {
      product: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const reviewStatusConfig: Record<
    string,
    { label: string; icon: typeof CheckCircle; className: string }
  > = {
    approved: {
      label: "Approved",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700",
    },
    pending: {
      label: "Pending Review",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700",
    },
    revision_needed: {
      label: "Revision Needed",
      icon: AlertCircle,
      className: "bg-orange-100 text-orange-700",
    },
    rejected: {
      label: "Rejected",
      icon: XCircle,
      className: "bg-red-100 text-red-700",
    },
  };

  const themeLabels: Record<string, string> = {
    default: "Default",
    dark: "Dark",
    brand: "Brand",
    minimal: "Minimal",
  };

  const claimTierLabels: Record<string, { label: string; color: string }> = {
    L1: { label: "L1 - Soft Claims", color: "bg-green-100 text-green-700" },
    L2: {
      label: "L2 - Verifiable Claims",
      color: "bg-blue-100 text-blue-700",
    },
    L3: {
      label: "L3 - High-Risk Claims",
      color: "bg-red-100 text-red-700",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
          <p className="text-gray-500 mt-1">
            Manage custom product pages ({customPages.length} total)
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Custom Page
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
        <p>
          <strong>C-Level Page Builder:</strong> Create rich custom product
          pages with themes, layouts, and claims. Claims are reviewed based on
          their tier level before publishing. The visual drag-and-drop builder
          is coming soon.
        </p>
      </div>

      {/* Custom Pages List */}
      {customPages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <Layers className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No custom pages yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create a custom product page to showcase your products with rich
            layouts and branding.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customPages.map((page) => {
            const reviewConfig = reviewStatusConfig[page.reviewStatus] || {
              label: page.reviewStatus,
              icon: Clock,
              className: "bg-gray-100 text-gray-600",
            };
            const ReviewIcon = reviewConfig.icon;
            const claimConfig = claimTierLabels[page.claimTier] || {
              label: page.claimTier,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <div
                key={page.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {/* Theme indicator */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      page.theme === "dark"
                        ? "bg-gray-900"
                        : page.theme === "brand"
                        ? "bg-blue-600"
                        : page.theme === "minimal"
                        ? "bg-gray-50 border border-gray-200"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                  >
                    <Palette
                      className={`w-5 h-5 ${
                        page.theme === "dark" || page.theme === "brand"
                          ? "text-white"
                          : "text-gray-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {page.product.name}
                      </h3>
                      {page.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <Eye className="w-3 h-3" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                          <EyeOff className="w-3 h-3" />
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-500">
                        Theme:{" "}
                        <span className="font-medium text-gray-700">
                          {themeLabels[page.theme] || page.theme}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${claimConfig.color}`}
                      >
                        {claimConfig.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${reviewConfig.className}`}
                      >
                        <ReviewIcon className="w-3 h-3" />
                        {reviewConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <span className="text-xs text-gray-400">
                    Updated{" "}
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/db";
import { formatNumber } from "@/lib/utils";
import {
  FileText,
  Plus,
  Play,
  BookOpen,
  Eye,
  Heart,
  Calendar,
} from "lucide-react";

const currentUserId = "merchant1";

export default async function MerchantContent() {
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

  const contentPosts = await prisma.contentPost.findMany({
    where: { authorId: currentUserId },
    include: {
      metrics: true,
      product: true,
      league: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-gray-500 mt-1">
            Manage your content posts ({contentPosts.length} total)
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Content
        </button>
      </div>

      {/* Content Grid */}
      {contentPosts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="mt-3 text-sm font-medium text-gray-900">
            No content yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first content post to engage with your audience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Cover / Media Preview */}
              <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                {post.coverUrl || post.mediaUrl ? (
                  <img
                    src={post.coverUrl || post.mediaUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-8 h-8 text-gray-300" />
                )}
                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      post.type === "short"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {post.type === "short" ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      <BookOpen className="w-3 h-3" />
                    )}
                    {post.type === "short" ? "Short" : "Long Form"}
                  </span>
                </div>
                {/* Evidence status */}
                {post.isEvidenceCandidate && post.evidenceStatus && (
                  <div className="absolute top-2 right-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.evidenceStatus === "approved"
                          ? "bg-green-100 text-green-700"
                          : post.evidenceStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {post.evidenceStatus.charAt(0).toUpperCase() +
                        post.evidenceStatus.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {post.title}
                  </h3>
                  {post.product && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Product: {post.product.name}
                    </p>
                  )}
                  {post.league && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      League: {post.league.name}
                    </p>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>
                      {post.metrics
                        ? formatNumber(post.metrics.views)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span>
                      {post.metrics
                        ? formatNumber(post.metrics.likes)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

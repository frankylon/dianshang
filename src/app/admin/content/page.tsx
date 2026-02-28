import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileText, Video, Eye, Heart, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { ContentActionButtons } from "@/components/admin-actions";

export const dynamic = 'force-dynamic';

export default async function AdminContentPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");
  const contentPosts = await prisma.contentPost.findMany({
    include: {
      author: true,
      league: true,
      product: true,
      brand: true,
      metrics: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = contentPosts.filter((c) => c.evidenceStatus === "pending").length;
  const approvedCount = contentPosts.filter((c) => c.evidenceStatus === "approved").length;
  const totalShorts = contentPosts.filter((c) => c.type === "short").length;
  const totalLong = contentPosts.filter((c) => c.type === "long").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Content Review</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Content", value: contentPosts.length, color: "text-blue-600 bg-blue-50" },
          { label: "Shorts", value: totalShorts, color: "text-purple-600 bg-purple-50" },
          { label: "Long Form", value: totalLong, color: "text-indigo-600 bg-indigo-50" },
          { label: "Pending Review", value: pendingCount, color: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Content</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Source</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">League / Product</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Views</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Likes</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Evidence</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contentPosts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600">{post.author.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.type === "short" ? "bg-purple-100 text-purple-700" : "bg-indigo-100 text-indigo-700"
                  }`}>
                    {post.type === "short" ? "Short" : "Long"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    post.source === "brand" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  }`}>
                    {post.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {post.league?.name || "—"}
                  {post.product && ` / ${post.product.name}`}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {post.metrics ? formatNumber(post.metrics.views) : "—"}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {post.metrics ? formatNumber(post.metrics.likes) : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {post.isEvidenceCandidate ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      post.evidenceStatus === "approved" ? "bg-green-100 text-green-700" :
                      post.evidenceStatus === "rejected" ? "bg-red-100 text-red-700" :
                      post.evidenceStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {post.evidenceStatus || "candidate"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {post.isEvidenceCandidate && post.evidenceStatus === "pending" && (
                      <ContentActionButtons postId={post.id} />
                    )}
                    <button className="text-xs text-gray-500 hover:underline px-2 py-1">View</button>
                  </div>
                </td>
              </tr>
            ))}
            {contentPosts.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No content posts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

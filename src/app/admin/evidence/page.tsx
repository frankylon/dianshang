import { prisma } from "@/lib/db";
import { Camera, CheckCircle, Clock, XCircle } from "lucide-react";

export default async function AdminEvidencePage() {
  const evidencePosts = await prisma.evidencePost.findMany({
    include: {
      user: true,
      product: true,
      orderItem: { include: { order: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = evidencePosts.filter((e) => e.status === "pending").length;
  const verifiedCount = evidencePosts.filter((e) => e.status === "verified").length;
  const rejectedCount = evidencePosts.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Evidence Review</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Evidence", value: evidencePosts.length, icon: Camera, color: "text-blue-600 bg-blue-50" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
          { label: "Verified", value: verifiedCount, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-600 bg-red-50" },
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

      {/* Evidence Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Evidence</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Submitter</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Media Type</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Weight</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {evidencePosts.map((ep) => (
              <tr key={ep.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 line-clamp-1">{ep.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{ep.description}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{ep.user.name}</td>
                <td className="px-4 py-3 text-gray-600">{ep.product.name}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ep.mediaType === "video" ? "bg-purple-100 text-purple-700" :
                    ep.mediaType === "gallery" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {ep.mediaType}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-mono text-xs">{ep.weight.toFixed(1)}x</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ep.status === "verified" ? "bg-green-100 text-green-700" :
                    ep.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {ep.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(ep.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {ep.status === "pending" ? (
                    <div className="flex gap-1 justify-end">
                      <button className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                        Verify
                      </button>
                      <button className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button className="text-xs text-gray-500 hover:underline">View</button>
                  )}
                </td>
              </tr>
            ))}
            {evidencePosts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No evidence submissions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { Users, ShieldCheck, Store, User } from "lucide-react";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      merchant: true,
      badges: true,
      _count: {
        select: {
          orders: true,
          reviews: true,
          evidencePosts: true,
          contentPosts: true,
          votes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const merchantCount = users.filter((u) => u.role === "merchant").length;
  const regularCount = users.filter((u) => u.role === "user").length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Regular Users", value: regularCount, icon: User, color: "text-green-600 bg-green-50" },
          { label: "Merchants", value: merchantCount, icon: Store, color: "text-purple-600 bg-purple-50" },
          { label: "Admins", value: adminCount, icon: ShieldCheck, color: "text-red-600 bg-red-50" },
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

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Orders</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Reviews</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Evidence</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Content</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Votes</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Badges</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.role === "admin" ? "bg-red-100 text-red-700" :
                    user.role === "merchant" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.orders}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.reviews}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.evidencePosts}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.contentPosts}</td>
                <td className="px-4 py-3 text-center text-gray-600">{user._count.votes}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.badges.slice(0, 3).map((b) => (
                      <span key={b.id} className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        {b.badge.replace(/_/g, " ")}
                      </span>
                    ))}
                    {user.badges.length > 3 && (
                      <span className="text-xs text-gray-400">+{user.badges.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  No users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

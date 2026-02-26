import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">My Account</h2>
        <nav className="flex flex-col gap-1">
          <Link
            href="/account"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="h-4 w-4" />
            Overview
          </Link>
          <Link
            href="/account/orders"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Orders
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

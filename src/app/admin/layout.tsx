"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  ShieldAlert,
  FileText,
  Camera,
  Coins,
  Users,
  Store,
  Settings,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leagues", label: "Leagues", icon: Trophy },
  { href: "/admin/var", label: "VAR Cases", icon: ShieldAlert },
  { href: "/admin/content", label: "Content Review", icon: FileText },
  { href: "/admin/evidence", label: "Evidence Review", icon: Camera },
  { href: "/admin/credits", label: "Credits & Rewards", icon: Coins },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/merchants", label: "Merchants", icon: Store },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white border-b border-gray-700">
        <div className="flex items-center gap-3 px-6 py-4">
          <Settings className="h-6 w-6 text-gray-300" />
          <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-64px)] bg-gray-900 border-r border-gray-700 flex-shrink-0">
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

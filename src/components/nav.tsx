"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Trophy,
  Play,
  Swords,
  User,
  Store,
  Settings,
  ShoppingCart,
  Flame,
  LogOut,
  LogIn,
} from "lucide-react";
import { useState, useEffect } from "react";

const mainLinks = [
  { href: "/", label: "Home", icon: Flame },
  { href: "/shorts", label: "Shorts", icon: Play },
  { href: "/watch", label: "Watch", icon: Play },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/challenges", label: "Challenges", icon: Swords },
];

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  merchantId?: string;
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const userLinks = [
    { href: "/account", label: "My Account", icon: User },
    { href: "/account/orders", label: "Orders", icon: ShoppingCart },
    ...(user?.role === "merchant" || user?.role === "admin"
      ? [{ href: "/merchant", label: "Merchant", icon: Store }]
      : []),
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "Admin", icon: Settings }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg shrink-0 text-accent">
          LeagueShop
        </Link>

        <form action="/search" className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Describe your problem... e.g. 'kitchen grease won't come off'"
            className="w-full pl-9 pr-4 py-2 rounded-full bg-background border border-border text-sm focus:outline-none focus:border-accent"
          />
        </form>

        <div className="hidden md:flex items-center gap-1">
          {mainLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xs font-bold text-accent">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {user.name}
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/10 text-accent capitalize">
                    {user.role}
                  </span>
                </div>
                {userLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-muted" />
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        )}
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
        {mainLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                active ? "bg-accent text-white" : "bg-gray-100 text-muted"
              }`}
            >
              <Icon className="w-3 h-3" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

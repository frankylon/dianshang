"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Trophy, Play, Swords, User, Store, Settings, ShoppingCart, Flame } from "lucide-react";
import { useState } from "react";

const mainLinks = [
  { href: "/", label: "Home", icon: Flame },
  { href: "/shorts", label: "Shorts", icon: Play },
  { href: "/watch", label: "Watch", icon: Play },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/challenges", label: "Challenges", icon: Swords },
];

const userLinks = [
  { href: "/account", label: "My Account", icon: User },
  { href: "/account/orders", label: "Orders", icon: ShoppingCart },
  { href: "/merchant", label: "Merchant", icon: Store },
  { href: "/admin", label: "Admin", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-bold text-lg shrink-0 text-accent">
          LeagueShop
        </Link>

        <form
          action="/search"
          className="flex-1 max-w-xl relative"
        >
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
                  active ? "bg-accent/10 text-accent font-medium" : "text-muted hover:text-foreground hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="w-5 h-5 text-muted" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
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
            </div>
          )}
        </div>
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

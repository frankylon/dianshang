"use client";
import { useState } from "react";
export function Tabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === t.id ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {tabs.find(t => t.id === active)?.content}
      </div>
    </div>
  );
}

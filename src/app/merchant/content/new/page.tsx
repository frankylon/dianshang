"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface League { id: string; name: string; }
interface Product { id: string; name: string; }

export default function NewContentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leagues, setLeagues] = useState<League[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    type: "short",
    title: "",
    description: "",
    mediaUrl: "",
    coverUrl: "",
    duration: "",
    leagueId: "",
    productId: "",
    tags: "",
  });

  useEffect(() => {
    fetch("/api/leagues").then(r => r.json()).then(d => setLeagues(d.leagues || [])).catch(() => {});
    fetch("/api/merchant/products").then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/merchant/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags ? JSON.stringify(form.tags.split(",").map(t => t.trim())) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/merchant/content");
      router.refresh();
    } catch { setError("Failed to create content"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/merchant/content" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="grid grid-cols-2 gap-3">
            {["short", "long"].map(t => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`px-4 py-3 rounded-lg border text-sm font-medium capitalize ${
                  form.type === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "short" ? "Short (< 60s)" : "Long Video"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Catchy title for your content" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Media URL *</label>
          <input type="text" value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/content/my-video.mp4 or https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL</label>
          <input type="text" value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/content/cover.jpg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
            <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="demo, kitchen, review" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">League</label>
            <select value={form.leagueId} onChange={e => setForm({ ...form, leagueId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">None</option>
              {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">None</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50">
            {loading ? "Publishing..." : "Publish Content"}
          </button>
          <Link href="/merchant/content" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

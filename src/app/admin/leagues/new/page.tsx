"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewLeaguePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    painPoint: "",
  });

  function handleNameChange(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm({ ...form, name, slug });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/admin/leagues");
      router.refresh();
    } catch { setError("Failed to create league"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/leagues" className="p-2 hover:bg-gray-700 rounded-lg text-gray-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New League</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">League Name *</label>
          <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Kitchen Effortless" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pain Point *</label>
          <input type="text" value={form.painPoint} onChange={e => setForm({ ...form, painPoint: e.target.value })} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What problem does this league address?" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this league is about..." />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create League"}
          </button>
          <Link href="/admin/leagues" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, Eye } from "lucide-react";
import Link from "next/link";

interface Product { id: string; name: string; }

const SECTION_TYPES = [
  { value: "hero", label: "Hero Banner", description: "Large headline + subtext with background color" },
  { value: "video_demo", label: "Video Demo", description: "Showcase brand demo videos" },
  { value: "features_grid", label: "Features Grid", description: "Grid of product features/benefits" },
  { value: "testimonials", label: "Testimonials", description: "Customer reviews showcase" },
  { value: "comparison_table", label: "Comparison Table", description: "Compare with competitors" },
  { value: "faq", label: "FAQ", description: "Frequently asked questions" },
];

interface Section {
  type: string;
  config: Record<string, string | number>;
}

export default function NewCustomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  const [productId, setProductId] = useState("");
  const [theme, setTheme] = useState("default");
  const [claimTier, setClaimTier] = useState("L1");
  const [sections, setSections] = useState<Section[]>([
    { type: "hero", config: { headline: "", subtext: "", bgColor: "#1a1a2e" } },
    { type: "video_demo", config: { title: "See it in action" } },
    { type: "features_grid", config: { columns: 3 } },
  ]);

  useEffect(() => {
    fetch("/api/merchant/products")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  function addSection(type: string) {
    const defaultConfigs: Record<string, Record<string, string | number>> = {
      hero: { headline: "", subtext: "", bgColor: "#1a1a2e" },
      video_demo: { title: "See it in action" },
      features_grid: { columns: 3 },
      testimonials: { limit: 6 },
      comparison_table: {},
      faq: {},
    };
    setSections([...sections, { type, config: defaultConfigs[type] || {} }]);
  }

  function removeSection(index: number) {
    setSections(sections.filter((_, i) => i !== index));
  }

  function updateSectionConfig(index: number, key: string, value: string | number) {
    const updated = [...sections];
    updated[index] = { ...updated[index], config: { ...updated[index].config, [key]: value } };
    setSections(updated);
  }

  function moveSection(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSections(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) { setError("Please select a product"); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/merchant/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          theme,
          claimTier,
          layout: JSON.stringify({ sections }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push("/merchant/pages");
      router.refresh();
    } catch { setError("Failed to create page"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/merchant/pages" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Custom Page</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        {/* Product selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Product *</label>
          <select value={productId} onChange={e => setProductId(e.target.value)} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a product</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Theme + Claim Tier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "default", label: "Default", preview: "bg-gradient-to-br from-gray-100 to-gray-200" },
                { value: "dark", label: "Dark", preview: "bg-gray-900" },
                { value: "brand", label: "Brand", preview: "bg-blue-600" },
                { value: "minimal", label: "Minimal", preview: "bg-white border border-gray-200" },
              ].map(t => (
                <button key={t.value} type="button" onClick={() => setTheme(t.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                    theme === t.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  <div className={`w-5 h-5 rounded ${t.preview}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Claim Tier</label>
            <div className="space-y-2">
              {[
                { value: "L1", label: "L1 - Soft Claims", desc: "Opinions & feelings", color: "bg-green-100 text-green-700" },
                { value: "L2", label: "L2 - Verifiable", desc: "Testable claims", color: "bg-blue-100 text-blue-700" },
                { value: "L3", label: "L3 - High-Risk", desc: "Health/safety claims", color: "bg-red-100 text-red-700" },
              ].map(c => (
                <button key={c.value} type="button" onClick={() => setClaimTier(c.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left text-sm ${
                    claimTier === c.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.color}`}>{c.value}</span>
                  <div>
                    <p className="font-medium text-gray-900">{c.label}</p>
                    <p className="text-xs text-gray-500">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sections builder */}
        <div>
          <label className="block text-sm font-medium mb-3">Page Sections</label>
          <div className="space-y-3">
            {sections.map((section, idx) => {
              const sectionType = SECTION_TYPES.find(s => s.value === section.type);
              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30">
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">{sectionType?.label}</span>
                      <p className="text-xs text-gray-500">{sectionType?.description}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{idx + 1}</span>
                    <button type="button" onClick={() => removeSection(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section-specific config */}
                  {section.type === "hero" && (
                    <div className="space-y-2 pl-7">
                      <input type="text" value={section.config.headline as string || ""} placeholder="Headline..."
                        onChange={e => updateSectionConfig(idx, "headline", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <input type="text" value={section.config.subtext as string || ""} placeholder="Subtext..."
                        onChange={e => updateSectionConfig(idx, "subtext", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Background:</label>
                        <input type="color" value={section.config.bgColor as string || "#1a1a2e"}
                          onChange={e => updateSectionConfig(idx, "bgColor", e.target.value)}
                          className="w-8 h-6 border border-gray-200 rounded cursor-pointer" />
                      </div>
                    </div>
                  )}
                  {section.type === "video_demo" && (
                    <div className="pl-7">
                      <input type="text" value={section.config.title as string || ""} placeholder="Section title..."
                        onChange={e => updateSectionConfig(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  )}
                  {section.type === "features_grid" && (
                    <div className="flex items-center gap-2 pl-7">
                      <label className="text-xs text-gray-500">Columns:</label>
                      <select value={section.config.columns as number || 3}
                        onChange={e => updateSectionConfig(idx, "columns", parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-200 rounded text-sm bg-white">
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                  )}
                  {section.type === "testimonials" && (
                    <div className="flex items-center gap-2 pl-7">
                      <label className="text-xs text-gray-500">Show up to:</label>
                      <select value={section.config.limit as number || 6}
                        onChange={e => updateSectionConfig(idx, "limit", parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-200 rounded text-sm bg-white">
                        <option value={3}>3 reviews</option>
                        <option value={6}>6 reviews</option>
                        <option value={9}>9 reviews</option>
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add section */}
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Add a section:</p>
            <div className="flex flex-wrap gap-2">
              {SECTION_TYPES.map(type => (
                <button key={type.value} type="button" onClick={() => addSection(type.value)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-3 h-3" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm disabled:opacity-50">
            {loading ? "Creating..." : "Create Custom Page"}
          </button>
          <Link href="/merchant/pages"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

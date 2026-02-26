import Link from "next/link";
import { DivBadge } from "./div-badge";
import { ScoreCard } from "./score-bar";
import { formatPrice, parseTags } from "@/lib/utils";
import { FileVideo, Image, ShoppingCart, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number | null;
    imageUrl: string;
    description: string;
    riskTags?: string | null;
    sceneTags?: string | null;
  };
  leagueStatus?: {
    div: number;
    rankScore: number;
    hypeScore: number;
    proofScore: number;
    evidenceCount: number;
    varStatus: string;
  } | null;
  brand?: { name: string } | null;
}

export function ProductCard({ product, leagueStatus, brand }: ProductCardProps) {
  const risks = parseTags(product.riskTags);
  const scenes = parseTags(product.sceneTags);

  return (
    <Link href={`/product/${product.slug}`} className="group">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            {product.name}
          </div>
          {leagueStatus && (
            <div className="absolute top-2 left-2">
              <DivBadge div={leagueStatus.div} size="sm" />
            </div>
          )}
          {leagueStatus?.varStatus === "under_review" && (
            <div className="absolute top-2 right-2 bg-warning/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              VAR
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {brand && (
            <span className="text-xs text-muted">{brand.name}</span>
          )}
          <h3 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted line-clamp-1">{product.description}</p>

          {scenes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {scenes.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-muted px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {leagueStatus && (
            <ScoreCard
              rankScore={leagueStatus.rankScore}
              hypeScore={leagueStatus.hypeScore}
              proofScore={leagueStatus.proofScore}
              compact
            />
          )}

          {leagueStatus && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-0.5">
                <FileVideo className="w-3 h-3" />
                {leagueStatus.evidenceCount} evidence
              </span>
            </div>
          )}

          {risks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-warning">
              <AlertTriangle className="w-3 h-3" />
              {risks.join(", ")}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs text-muted line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>
            <button className="flex items-center gap-1 bg-accent text-white text-xs px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors">
              <ShoppingCart className="w-3 h-3" />
              Buy
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

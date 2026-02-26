"use client";

import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, ShoppingCart, Eye, ChevronUp, ChevronDown, Play } from "lucide-react";
import { formatNumber, getSourceBadge } from "@/lib/utils";
import Link from "next/link";

interface ShortItem {
  id: string;
  title: string;
  description: string | null;
  mediaUrl: string;
  coverUrl: string | null;
  source: string;
  duration: number | null;
  authorName: string;
  brandName: string | null;
  productId: string | null;
  productName: string | null;
  productSlug: string | null;
  metrics: { views: number; likes: number; saves: number; shares: number } | null;
}

export function ShortsPlayer({ shorts }: { shorts: ShortItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = shorts[currentIndex];

  if (!current) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px)] text-muted">
        No shorts available
      </div>
    );
  }

  const badge = getSourceBadge(current.source);

  const goUp = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goDown = () => setCurrentIndex((i) => Math.min(shorts.length - 1, i + 1));

  return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)] bg-black">
      <div className="relative w-full max-w-[400px] h-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden">
        {/* Video placeholder */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 px-8 text-center">
          <Play className="w-16 h-16 mb-4 text-white/40" />
          <p className="text-lg font-medium text-white mb-2">{current.title}</p>
          {current.description && (
            <p className="text-sm text-white/60">{current.description}</p>
          )}
        </div>

        {/* Source badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Counter */}
        <div className="absolute top-4 right-4 z-10 text-white/60 text-xs">
          {currentIndex + 1} / {shorts.length}
        </div>

        {/* Right side actions */}
        <div className="absolute right-3 bottom-32 z-10 flex flex-col items-center gap-5">
          <button className="flex flex-col items-center gap-1 text-white/90 hover:text-red-400 transition-colors">
            <Heart className="w-7 h-7" />
            <span className="text-xs">{current.metrics ? formatNumber(current.metrics.likes) : "0"}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors">
            <MessageCircle className="w-7 h-7" />
            <span className="text-xs">Chat</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/90 hover:text-yellow-400 transition-colors">
            <Bookmark className="w-7 h-7" />
            <span className="text-xs">{current.metrics ? formatNumber(current.metrics.saves) : "0"}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/90 hover:text-white transition-colors">
            <Share2 className="w-7 h-7" />
            <span className="text-xs">{current.metrics ? formatNumber(current.metrics.shares) : "0"}</span>
          </button>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-16 z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <p className="text-white font-medium text-sm mb-1">@{current.authorName}</p>
          <p className="text-white/80 text-sm mb-2 line-clamp-2">{current.title}</p>
          {current.metrics && (
            <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
              <Eye className="w-3 h-3" />
              {formatNumber(current.metrics.views)} views
            </div>
          )}
          {current.productSlug && (
            <Link
              href={`/product/${current.productSlug}`}
              className="inline-flex items-center gap-1.5 bg-accent/90 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ShoppingCart className="w-3 h-3" />
              {current.productName || "View Product"}
            </Link>
          )}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goUp}
          disabled={currentIndex === 0}
          className="absolute top-1/2 -translate-y-8 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="w-8 h-8" />
        </button>
        <button
          onClick={goDown}
          disabled={currentIndex === shorts.length - 1}
          className="absolute bottom-1/2 translate-y-8 left-1/2 -translate-x-1/2 z-20 text-white/40 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

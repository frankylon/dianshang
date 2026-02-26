import Link from "next/link";
import { Play, Heart, MessageCircle, Bookmark, Share2, Eye } from "lucide-react";
import { formatNumber, formatDuration, getSourceBadge } from "@/lib/utils";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    coverUrl?: string | null;
    mediaUrl: string;
    source: string;
    type: string;
    duration?: number | null;
    metrics?: {
      views: number;
      likes: number;
      saves: number;
      shares: number;
    } | null;
  };
  orientation?: "horizontal" | "vertical";
}

export function ContentCard({ content, orientation = "horizontal" }: ContentCardProps) {
  const badge = getSourceBadge(content.source);
  const isShort = content.type === "short";

  if (orientation === "vertical") {
    return (
      <div className="relative bg-black rounded-xl overflow-hidden aspect-[9/16] min-w-[160px] group cursor-pointer">
        <div className="absolute inset-0 flex items-center justify-center text-white/60 text-xs px-2 text-center">
          {content.title}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {content.duration && (
          <div className="absolute top-2 right-2 text-xs text-white/80 bg-black/40 px-1.5 py-0.5 rounded">
            {formatDuration(content.duration)}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="text-white text-xs font-medium line-clamp-2">{content.title}</p>
          {content.metrics && (
            <div className="flex items-center gap-2 mt-1 text-white/70 text-xs">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatNumber(content.metrics.views)}</span>
              <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{formatNumber(content.metrics.likes)}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-12 h-12 text-white/90" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
      <div className="relative aspect-video bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center text-muted text-xs px-4 text-center">
          {content.title}
        </div>
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-1.5 py-0.5 rounded ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        {content.duration && (
          <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
            {formatDuration(content.duration)}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <Play className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-1">{content.title}</h3>
        {content.metrics && (
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatNumber(content.metrics.views)}</span>
            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{formatNumber(content.metrics.likes)}</span>
            <span className="flex items-center gap-0.5"><Bookmark className="w-3 h-3" />{formatNumber(content.metrics.saves)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function ShortsCard({ content }: { content: ContentCardProps["content"] }) {
  return <ContentCard content={content} orientation="vertical" />;
}

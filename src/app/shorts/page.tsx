import { prisma } from "@/lib/db";
import { ShortsPlayer } from "@/components/shorts-player";

export const dynamic = 'force-dynamic';

export default async function ShortsPage() {
  const shorts = await prisma.contentPost.findMany({
    where: { type: "short" },
    include: {
      metrics: true,
      author: true,
      product: true,
      brand: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const formatted = shorts.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    mediaUrl: s.mediaUrl,
    coverUrl: s.coverUrl,
    source: s.source,
    duration: s.duration,
    authorName: s.author.name,
    brandName: s.brand?.name || null,
    productId: s.product?.id || null,
    productName: s.product?.name || null,
    productSlug: s.product?.slug || null,
    metrics: s.metrics
      ? { views: s.metrics.views, likes: s.metrics.likes, saves: s.metrics.saves, shares: s.metrics.shares }
      : null,
  }));

  return <ShortsPlayer shorts={formatted} />;
}

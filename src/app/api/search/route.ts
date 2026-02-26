import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json({ products: [], shorts: [], pkMatches: [] });
  }

  const query = `%${q.toLowerCase()}%`;

  // Find matching products through multiple channels
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { sceneTags: { contains: q } },
        { functionTags: { contains: q } },
      ],
    },
    include: {
      brand: true,
      leagueStatuses: { include: { league: true } },
    },
  });

  // Also search by league pain points
  const leagueMatches = await prisma.league.findMany({
    where: {
      OR: [
        { painPoint: { contains: q } },
        { description: { contains: q } },
        { name: { contains: q } },
      ],
    },
    include: {
      productStatuses: {
        include: {
          product: { include: { brand: true, leagueStatuses: { include: { league: true } } } },
        },
        orderBy: { rankScore: "desc" },
      },
    },
  });

  // Merge products from league matches
  const leagueProducts = leagueMatches.flatMap((l) =>
    l.productStatuses.map((ps) => ps.product)
  );

  // Deduplicate
  const allProducts = [...products];
  for (const lp of leagueProducts) {
    if (!allProducts.find((p) => p.id === lp.id)) {
      allProducts.push(lp);
    }
  }

  // Related shorts
  const leagueIds = leagueMatches.map((l) => l.id);
  const productIds = allProducts.map((p) => p.id);

  const shorts = await prisma.contentPost.findMany({
    where: {
      type: "short",
      OR: [
        { leagueId: { in: leagueIds } },
        { productId: { in: productIds } },
        { title: { contains: q } },
      ],
    },
    include: { metrics: true, author: true },
    take: 12,
  });

  // Active PK matches
  const pkMatches = await prisma.pkMatch.findMany({
    where: {
      status: "active",
      OR: [
        { productAId: { in: productIds } },
        { productBId: { in: productIds } },
        { leagueId: { in: leagueIds } },
      ],
    },
    include: { productA: true, productB: true, league: true },
  });

  return NextResponse.json({ products: allProducts, shorts, pkMatches });
}

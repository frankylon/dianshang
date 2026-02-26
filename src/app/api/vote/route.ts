import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, productId, type, value = 1 } = body;

  if (!userId || !productId || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const weightMap: Record<string, number> = {
    passerby: 0.2,
    interactive: 0.5,
    purchase: 1.0,
  };

  const weight = weightMap[type];
  if (weight === undefined) {
    return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
  }

  // Upsert vote
  const vote = await prisma.vote.upsert({
    where: { userId_productId_type: { userId, productId, type } },
    update: { value, weight },
    create: { userId, productId, type, value, weight },
  });

  // Recalculate hype score for all league statuses of this product
  const votes = await prisma.vote.findMany({ where: { productId } });
  const totalHype = votes.reduce((sum, v) => sum + v.value * v.weight, 0);
  const normalizedHype = Math.min(100, Math.max(0, totalHype * 5));

  await prisma.productLeagueStatus.updateMany({
    where: { productId },
    data: {
      hypeScore: normalizedHype,
      rankScore: normalizedHype * 0.3, // Will be recalculated with proof
    },
  });

  // Recalculate rank = 30% hype + 70% proof
  const statuses = await prisma.productLeagueStatus.findMany({ where: { productId } });
  for (const status of statuses) {
    const rankScore = Math.round(status.hypeScore * 0.3 + status.proofScore * 0.7);
    await prisma.productLeagueStatus.update({
      where: { id: status.id },
      data: { rankScore },
    });
  }

  return NextResponse.json({ vote, message: "Vote recorded" });
}

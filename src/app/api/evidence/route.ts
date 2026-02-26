import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, productId, orderItemId, mediaType, mediaUrl, coverUrl, title, description, structuredTags } = body;

  if (!userId || !productId || !orderItemId || !mediaType || !mediaUrl || !title || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify order item belongs to user
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });

  if (!orderItem || orderItem.order.userId !== userId) {
    return NextResponse.json({ error: "Invalid order item or unauthorized" }, { status: 403 });
  }

  if (orderItem.order.status !== "completed" && orderItem.order.status !== "delivered") {
    return NextResponse.json({ error: "Order must be delivered or completed to submit evidence" }, { status: 400 });
  }

  // Determine weight based on evidence quality
  let weight = 2.0;
  if (mediaType === "video") weight = 2.5;
  if (structuredTags) {
    try {
      const tags = JSON.parse(structuredTags);
      if (tags.duration && tags.scenario && tags.verdict) weight = 3.0;
    } catch {}
  }

  const evidence = await prisma.evidencePost.create({
    data: {
      userId,
      productId,
      orderItemId,
      mediaType,
      mediaUrl,
      coverUrl,
      title,
      description,
      structuredTags,
      weight,
      status: "pending",
    },
  });

  return NextResponse.json({ evidence, message: "Evidence submitted for review" });
}

// Admin: verify/reject evidence
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { evidenceId, status, weight } = body;

  if (!evidenceId || !status) {
    return NextResponse.json({ error: "evidenceId and status required" }, { status: 400 });
  }

  if (!["verified", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Status must be 'verified' or 'rejected'" }, { status: 400 });
  }

  const evidence = await prisma.evidencePost.update({
    where: { id: evidenceId },
    data: { status, ...(weight !== undefined ? { weight } : {}) },
  });

  // If verified, update proof score
  if (status === "verified") {
    const productId = evidence.productId;
    const allEvidence = await prisma.evidencePost.findMany({
      where: { productId, status: "verified" },
    });
    const reviews = await prisma.review.findMany({ where: { productId } });

    const evidenceScore = allEvidence.reduce((sum, e) => sum + e.weight, 0);
    const reviewScore = reviews.reduce((sum, r) => sum + r.rating * r.weight, 0);
    const proofScore = Math.min(100, Math.max(0, (evidenceScore * 3 + reviewScore * 2)));

    const statuses = await prisma.productLeagueStatus.findMany({ where: { productId } });
    for (const s of statuses) {
      const rankScore = Math.round(s.hypeScore * 0.3 + proofScore * 0.7);
      await prisma.productLeagueStatus.update({
        where: { id: s.id },
        data: { proofScore, rankScore, evidenceCount: allEvidence.length },
      });
    }
  }

  return NextResponse.json({ evidence, message: `Evidence ${status}` });
}

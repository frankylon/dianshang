import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, title, description, mediaUrl, coverUrl, duration, leagueId, productId, brandId, tags } = body;

  if (!type || !title || !mediaUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const source = session.role === "merchant" ? "brand" : "user";

  const content = await prisma.contentPost.create({
    data: {
      authorId: session.id,
      source,
      type,
      title,
      description,
      mediaUrl,
      coverUrl,
      duration: duration ? parseInt(duration) : null,
      leagueId: leagueId || null,
      productId: productId || null,
      brandId: brandId || null,
      tags: tags || null,
    },
  });

  // Create metrics record
  await prisma.contentMetrics.create({
    data: { contentPostId: content.id },
  });

  return NextResponse.json({ content });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, description, tags } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.contentPost.findUnique({ where: { id } });
  if (!existing || (existing.authorId !== session.id && session.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = await prisma.contentPost.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && { tags }),
    },
  });

  return NextResponse.json({ content });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.contentPost.findUnique({ where: { id } });
  if (!existing || (existing.authorId !== session.id && session.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete metrics first, then content
  await prisma.contentMetrics.deleteMany({ where: { contentPostId: id } });
  await prisma.contentComment.deleteMany({ where: { contentPostId: id } });
  await prisma.contentPost.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

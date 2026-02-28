import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getMerchantId(session: { id: string; role: string; merchantId?: string }) {
  if (session.merchantId) return session.merchantId;
  const merchant = await prisma.merchant.findUnique({ where: { userId: session.id } });
  return merchant?.id;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  if (!merchantId) return NextResponse.json({ error: "No merchant profile" }, { status: 404 });

  const products = await prisma.product.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      leagueStatuses: { include: { league: true } },
      _count: { select: { reviews: true, variants: true } },
    },
  });

  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  if (!merchantId) return NextResponse.json({ error: "No merchant profile" }, { status: 404 });

  const body = await req.json();
  const { name, slug, description, price, compareAtPrice, imageUrl, functionTags, sceneTags, brandId, leagueId } = body;

  if (!name || !slug || !description || !price || !imageUrl) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existingSlug = await prisma.product.findUnique({ where: { slug } });
  if (existingSlug) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: { brand: true },
  });

  const product = await prisma.product.create({
    data: {
      merchantId,
      brandId: brandId || merchant?.brand?.id,
      name,
      slug,
      description,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      imageUrl,
      functionTags: functionTags || null,
      sceneTags: sceneTags || null,
    },
  });

  // Auto-join a league if specified
  if (leagueId) {
    await prisma.productLeagueStatus.create({
      data: { productId: product.id, leagueId, div: 3 },
    });
  }

  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Verify ownership
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || (existing.merchantId !== merchantId && session.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (updates.price) updates.price = parseFloat(updates.price);
  if (updates.compareAtPrice) updates.compareAtPrice = parseFloat(updates.compareAtPrice);

  const product = await prisma.product.update({ where: { id }, data: updates });
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || (existing.merchantId !== merchantId && session.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}

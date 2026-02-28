import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getMerchantId(session: { id: string; role: string; merchantId?: string }) {
  if (session.merchantId) return session.merchantId;
  const merchant = await prisma.merchant.findUnique({ where: { userId: session.id } });
  return merchant?.id;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  if (!merchantId) return NextResponse.json({ error: "No merchant profile" }, { status: 404 });

  const { productId, theme, layout, claimTier } = await req.json();
  if (!productId || !layout) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if product belongs to merchant
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || (product.merchantId !== merchantId && session.role !== "admin")) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if page already exists
  const existing = await prisma.customProductPage.findUnique({ where: { productId } });
  if (existing) {
    return NextResponse.json({ error: "Page already exists for this product. Use PATCH to update." }, { status: 409 });
  }

  const page = await prisma.customProductPage.create({
    data: {
      productId,
      merchantId,
      theme: theme || "default",
      layout: typeof layout === "string" ? layout : JSON.stringify(layout),
      claimTier: claimTier || "L1",
      reviewStatus: "pending",
    },
  });

  return NextResponse.json({ page });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const merchantId = await getMerchantId(session);
  const { id, theme, layout, claimTier, isPublished } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.customProductPage.findUnique({ where: { id } });
  if (!existing || (existing.merchantId !== merchantId && session.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const page = await prisma.customProductPage.update({
    where: { id },
    data: {
      ...(theme && { theme }),
      ...(layout && { layout: typeof layout === "string" ? layout : JSON.stringify(layout) }),
      ...(claimTier && { claimTier }),
      ...(typeof isPublished === "boolean" && { isPublished }),
      // Reset review status when content changes
      ...(layout && { reviewStatus: "pending" }),
    },
  });

  return NextResponse.json({ page });
}

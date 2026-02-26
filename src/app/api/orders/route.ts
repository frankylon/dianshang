import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, items, shippingAddress } = body;

  if (!userId || !items?.length || !shippingAddress) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate products and calculate totals
  let totalAmount = 0;
  const orderItems: { productId: string; variantId?: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: `Product ${item.productId} not found or inactive` }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
    }
    const price = item.variantId
      ? (await prisma.productVariant.findUnique({ where: { id: item.variantId } }))?.price || product.price
      : product.price;
    const itemTotal = price * item.quantity;
    totalAmount += itemTotal;
    orderItems.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice: price,
      totalPrice: itemTotal,
    });
  }

  const commissionRate = 0.15;
  const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100;

  // Create order
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      commissionRate,
      commissionAmount,
      shippingAddress,
      status: "paid",
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  // Update stock
  for (const item of orderItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return NextResponse.json({ order, message: "Order created successfully" });
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

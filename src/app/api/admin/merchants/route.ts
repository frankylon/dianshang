import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, verified, businessName, description } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const merchant = await prisma.merchant.update({
    where: { id },
    data: {
      ...(typeof verified === "boolean" && { verified }),
      ...(businessName && { businessName }),
      ...(description !== undefined && { description }),
    },
  });

  return NextResponse.json({ merchant });
}

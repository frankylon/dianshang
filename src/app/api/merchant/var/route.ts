import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "merchant" && session.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { caseId, response } = await req.json();
  if (!caseId || !response) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify merchant owns this case's product
  const merchant = await prisma.merchant.findUnique({ where: { userId: session.id } });
  if (!merchant && session.role !== "admin") {
    return NextResponse.json({ error: "No merchant profile" }, { status: 404 });
  }

  const varCase = await prisma.varCase.findUnique({
    where: { id: caseId },
    include: {
      productLeagueStatus: { include: { product: true } },
    },
  });

  if (!varCase) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  if (session.role !== "admin" && varCase.productLeagueStatus.product.merchantId !== merchant?.id) {
    return NextResponse.json({ error: "Not your case" }, { status: 403 });
  }

  const updated = await prisma.varCase.update({
    where: { id: caseId },
    data: {
      merchantResponse: response,
      status: "investigating",
    },
  });

  return NextResponse.json({ varCase: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, evidenceStatus, type } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  if (type === "evidence") {
    const evidence = await prisma.evidencePost.update({
      where: { id },
      data: { status: evidenceStatus },
    });
    return NextResponse.json({ evidence });
  }

  const content = await prisma.contentPost.update({
    where: { id },
    data: {
      ...(evidenceStatus && { evidenceStatus }),
    },
  });

  return NextResponse.json({ content });
}

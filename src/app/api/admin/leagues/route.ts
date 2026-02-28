import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, slug, description, painPoint, iconUrl } = await req.json();
  if (!name || !slug || !description || !painPoint) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const league = await prisma.league.create({
    data: { name, slug, description, painPoint, iconUrl },
  });

  return NextResponse.json({ league });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, name, description, painPoint, isActive } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const league = await prisma.league.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(painPoint && { painPoint }),
      ...(typeof isActive === "boolean" && { isActive }),
    },
  });

  return NextResponse.json({ league });
}

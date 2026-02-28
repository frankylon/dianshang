import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchant: true,
      _count: { select: { orders: true, reviews: true, votes: true, evidencePosts: true } },
    },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, name, password, role } = await req.json();
  if (!email || !name || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role: role || "user" },
  });

  if (role === "merchant") {
    await prisma.merchant.create({
      data: { userId: user.id, businessName: name },
    });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, name, role, email } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      ...(email && { email }),
    },
  });

  return NextResponse.json({ user });
}

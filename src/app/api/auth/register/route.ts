import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === "merchant" ? "merchant" : "user";

    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: userRole },
    });

    let merchantId: string | undefined;

    // If registering as merchant, create merchant record
    if (userRole === "merchant") {
      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: name,
        },
      });
      merchantId = merchant.id;
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      merchantId,
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}

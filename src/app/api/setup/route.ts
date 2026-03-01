import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// One-time setup endpoint:
// 1. Fixes seed users with invalid password hashes
// 2. Creates an admin account if none exists
// 3. Call POST /api/setup with { password: "your-new-password" }
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password.length < 6) {
    return NextResponse.json(
      { error: "Provide a password (min 6 chars) in the request body" },
      { status: 400 }
    );
  }

  const hash = await hashPassword(password);

  // 1. Fix all seed users with invalid passwordHash (not starting with $2)
  const fixedUsers = await prisma.user.updateMany({
    where: {
      passwordHash: {
        not: { startsWith: "$2" },
      },
    },
    data: { passwordHash: hash },
  });

  // 2. Check if admin exists
  let admin = await prisma.user.findFirst({
    where: { role: "admin" },
  });

  let adminCreated = false;
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin@leagueshop.com",
        name: "Admin",
        role: "admin",
        passwordHash: hash,
      },
    });
    adminCreated = true;
  }

  // 3. Create session for the admin
  await createSession({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  return NextResponse.json({
    ok: true,
    fixedUsers: fixedUsers.count,
    adminCreated,
    message: `Setup complete. ${fixedUsers.count} user(s) fixed. You are now logged in as admin.`,
    accounts: {
      admin: admin.email,
      merchants: "merchant1@example.com ~ merchant6@example.com",
      users: "alice@example.com, bob@example.com, carol@example.com",
      password: "All accounts now use the password you provided",
    },
  });
}

// GET endpoint: show setup status (no auth required)
export async function GET() {
  const adminExists = await prisma.user.findFirst({ where: { role: "admin" } });
  const totalUsers = await prisma.user.count();
  const invalidPasswords = await prisma.user.count({
    where: { passwordHash: { not: { startsWith: "$2" } } },
  });

  return NextResponse.json({
    adminExists: !!adminExists,
    totalUsers,
    usersNeedingPasswordFix: invalidPasswords,
    instruction: invalidPasswords > 0
      ? 'POST /api/setup with body { "password": "your-password" } to fix all passwords and log in as admin'
      : "All passwords are valid. You can log in normally.",
  });
}

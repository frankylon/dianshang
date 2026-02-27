import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, unknown> = {};

  // Check env vars (masked)
  const dbUrl = process.env.DATABASE_URL || "";
  const directUrl = process.env.DIRECT_URL || "";
  info.DATABASE_URL_set = dbUrl.length > 0;
  info.DATABASE_URL_length = dbUrl.length;
  info.DATABASE_URL_preview = dbUrl.substring(0, 30) + "...";
  info.DIRECT_URL_set = directUrl.length > 0;
  info.DIRECT_URL_length = directUrl.length;

  // Test database connection
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    info.db_connection = "success";
    info.db_result = result;
  } catch (e: unknown) {
    const error = e as Error;
    info.db_connection = "failed";
    info.db_error = error.message;
    info.db_error_name = error.name;
  }

  return NextResponse.json(info);
}

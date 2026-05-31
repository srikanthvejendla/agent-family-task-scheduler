import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { sql } from "drizzle-orm";

export async function GET() {
  let dbStatus: "ok" | "down" = "down";

  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = "ok";
  } catch (error) {
    console.error("Health check DB error:", error);
  }

  return NextResponse.json({
    status: "ok",
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}

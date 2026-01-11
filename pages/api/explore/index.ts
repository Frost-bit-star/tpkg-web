import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tools = await db.query(`
    SELECT tools.*, users.username
    FROM tools
    JOIN users ON users.id = tools.owner_id
    WHERE is_private = false
    ORDER BY (downloads * 2 + github_stars) DESC
    LIMIT 50
  `);

  return NextResponse.json({ tools: tools.rows });
}

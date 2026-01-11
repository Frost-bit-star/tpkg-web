import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { username, tool } = await req.json();

  const res = await db.query(`
    UPDATE tools SET downloads = downloads + 1
    WHERE name=$1 AND owner_id=(SELECT id FROM users WHERE username=$2)
    RETURNING *
  `, [tool, username]);

  if (!res.rows.length)
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

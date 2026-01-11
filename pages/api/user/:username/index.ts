import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: any) {
  const user = await db.query(
    "SELECT username,name,avatar_url,bio FROM users WHERE username=$1",
    [params.username]
  );

  if (!user.rows.length)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const tools = await db.query(
    "SELECT * FROM tools WHERE owner_id=(SELECT id FROM users WHERE username=$1)",
    [params.username]
  );

  return NextResponse.json({ user: user.rows[0], tools: tools.rows });
}

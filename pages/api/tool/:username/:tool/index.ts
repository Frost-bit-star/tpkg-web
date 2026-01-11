import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: any) {
  const t = await db.query(`
    SELECT tools.*, users.username
    FROM tools
    JOIN users ON users.id = tools.owner_id
    WHERE users.username=$1 AND tools.name=$2
  `, [params.username, params.tool]);

  if (!t.rows.length)
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  return NextResponse.json({ tool: t.rows[0] });
}

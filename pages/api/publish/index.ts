import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchTPKG, fetchRepoStats } from "@/lib/github";
import { validateTPKG } from "@/lib/tpkg";

export async function POST(req: Request) {
  const { userId, repo } = await req.json();

  const userRes = await db.query("SELECT * FROM users WHERE id=$1", [userId]);
  if (!userRes.rows.length)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const user = userRes.rows[0];

  try {
    const tpkg = await fetchTPKG(repo, user.access_token);
    validateTPKG(tpkg);

    const stats = await fetchRepoStats(repo, user.access_token);

    const tool = await db.query(`
      INSERT INTO tools
      (name, version, description, repo, type, install_cmd, owner_id,
       is_private, github_stars, github_forks, github_issues, readme)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (name, owner_id)
      DO UPDATE SET version=$2, description=$3, install_cmd=$6
      RETURNING *
    `, [
      tpkg.name,
      tpkg.version,
      tpkg.description,
      repo,
      tpkg.type,
      tpkg.install,
      user.id,
      stats.private,
      stats.stars,
      stats.forks,
      stats.issues,
      stats.readme
    ]);

    return NextResponse.json({ tool: tool.rows[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

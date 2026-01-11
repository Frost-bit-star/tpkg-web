import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const cliSession = searchParams.get("session"); // session ID for CLI login
  const isCLI = !!searchParams.get("cli"); // CLI requesting login
  const requestToken = !!searchParams.get("token"); // if CLI wants token only

  // CLI requesting a login session
  if (isCLI && !code && !requestToken) {
    // generate a random session ID
    const sessionId = crypto.randomBytes(16).toString("hex");

    // store session in DB
    await db.query(`
      INSERT INTO cli_sessions (id, completed)
      VALUES ($1, false)
    `, [sessionId]);

    // return login URL and session ID for the CLI
    const loginUrl = `${req.url}?session=${sessionId}`;
    return NextResponse.json({ url: loginUrl, session: sessionId });
  }

  // CLI polling for token
  if (isCLI && requestToken && cliSession) {
    const res = await db.query(`
      SELECT access_token, completed
      FROM cli_sessions
      WHERE id=$1
    `, [cliSession]);

    if (!res.rows.length) return NextResponse.json({}, { status: 204 });

    const session = res.rows[0];
    if (!session.completed) return NextResponse.json({}, { status: 204 });

    return NextResponse.json({ token: session.access_token });
  }

  // OAuth callback from GitHub (web or CLI)
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // Exchange code for GitHub access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    }),
  });

  const { access_token } = await tokenRes.json();

  // Get GitHub user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `token ${access_token}` },
  });

  const u: any = await userRes.json();

  // Insert or update user in DB
  const user = await db.query(`
    INSERT INTO users (github_id, username, name, avatar_url, bio, access_token)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (github_id)
    DO UPDATE SET access_token=$6
    RETURNING *
  `, [u.id, u.login, u.name, u.avatar_url, u.bio, access_token]);

  // If CLI session exists, mark it completed
  if (cliSession) {
    await db.query(`
      UPDATE cli_sessions
      SET access_token=$1, completed=true
      WHERE id=$2
    `, [access_token, cliSession]);
  }

  return NextResponse.json({ user: user.rows[0], token: cliSession ? access_token : undefined });
}

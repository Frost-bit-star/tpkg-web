// pages/api/auth/github.js
import fetch from "node-fetch";
import { db } from "@/lib/db.js";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const { code, state, cli, token, session } = req.query;

    // =========================
    // CLI: Poll for token
    // =========================
    if (cli === "1" && token === "1" && session) {
      const result = await db.query(
        "SELECT completed, access_token, user_id FROM github_sessions WHERE id=$1",
        [session]
      );

      if (result.rowCount === 0) return res.status(404).json({ error: "Session not found" });

      const s = result.rows[0];
      if (!s.completed) return res.status(204).send(); // not ready

      return res.json({ token: s.access_token });
    }

    // =========================
    // STEP 1: Initiate login (redirect to GitHub)
    // =========================
    if (!code) {
      const sessionState = crypto.randomBytes(16).toString("hex");

      // Save session for CLI/browser
      const insertRes = await db.query(
        "INSERT INTO github_sessions (id, completed) VALUES ($1, false) RETURNING id",
        [sessionState]
      );

      const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        scope: "read:user",
        state: sessionState,
      });

      const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

      // CLI wants JSON response
      if (cli === "1") {
        return res.json({ url: githubAuthUrl, session: sessionState });
      }

      return res.redirect(githubAuthUrl);
    }

    // =========================
    // STEP 2: GitHub redirects back with code
    // =========================
    if (!state || typeof state !== "string") return res.status(400).send("Missing or invalid state");

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const { access_token } = await tokenRes.json();
    if (!access_token) return res.status(400).send("Failed to get access token");

    // Fetch GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `token ${access_token}` },
    });
    const u = await userRes.json();
    if (!u || !u.id) return res.status(400).send("Failed to fetch GitHub user info");

    // Insert or update user
    const userDb = await db.query(
      `
      INSERT INTO users (github_id, username, name, avatar_url, access_token)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (github_id) DO UPDATE SET access_token=$5
      RETURNING id, username
      `,
      [u.id, u.login, u.name, u.avatar_url, access_token]
    );

    // Mark session as completed
    await db.query(
      "UPDATE github_sessions SET completed=true, access_token=$1, user_id=$2 WHERE id=$3",
      [access_token, userDb.rows[0].id, state]
    );

    // Redirect to dashboard
    const appUrl = process.env.APP_URL || "/dashboard";
    return res.redirect(`${appUrl}?user=${userDb.rows[0].username}`);
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    return res.status(500).send("Internal server error");
  }
}

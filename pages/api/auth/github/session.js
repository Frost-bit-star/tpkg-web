// pages/api/auth/github/session.js
import { db } from "@/lib/db.js";

export default async function handler(req, res) {
  try {
    const { sessionId } = req.query;

    if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

    const result = await db.query(
      "SELECT completed, access_token, user_id FROM github_sessions WHERE id=$1",
      [sessionId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const session = result.rows[0];

    // If completed, return user info
    if (session.completed) {
      const userRes = await db.query(
        "SELECT id, username, github_id FROM users WHERE id=$1",
        [session.user_id]
      );

      return res.json({ completed: true, user: userRes.rows[0] });
    }

    // Not completed yet
    return res.json({ completed: false });
  } catch (err) {
    console.error("Session check error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

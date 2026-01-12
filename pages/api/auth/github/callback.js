const fetch = require("node-fetch");
const cookie = require("cookie");
const { v4: uuid } = require("uuid");
const { db } = require("../../../../lib/db");
const { config } = require("../../../../lib/config");

module.exports = async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).end();

  // 1️⃣ Exchange code for access token
  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return res.status(401).end();
  }

  // 2️⃣ Fetch GitHub user
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": config.app.name,
    },
  });

  const gh = await userRes.json();

  // 3️⃣ Find or create user
  let user = await db.query(
    "SELECT id FROM users WHERE github_id = $1",
    [gh.id.toString()]
  );

  let userId;

  if (user.rows.length) {
    userId = user.rows[0].id;
  } else {
    userId = uuid();
    await db.query(
      "INSERT INTO users (id, email, github_id) VALUES ($1, $2, $3)",
      [userId, gh.email || `${gh.id}@github.local`, gh.id.toString()]
    );
  }

  // 4️⃣ Create session
  const sessionId = uuid();
  const expires = Date.now() + 86400000;

  await db.query(
    "INSERT INTO sessions (id, user_id, expires) VALUES ($1, $2, $3)",
    [sessionId, userId, expires]
  );

  // 5️⃣ Set cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("session", sessionId, {
      httpOnly: true,
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    })
  );

  // 6️⃣ Redirect user
  res.redirect("/dashboard");
};

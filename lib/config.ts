// lib/config.js
const config = {
  app: {
    name: "tpkg",
    port: Number(process.env.PORT) || 3000,
    url: process.env.APP_URL || "http://localhost:3000",
  },

  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "tpkg",
    password: process.env.DB_PASSWORD || "tpkg",
    name: process.env.DB_NAME || "tpkg",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    scopes: ["read:user", "repo"],
  },
};

module.exports = { config };

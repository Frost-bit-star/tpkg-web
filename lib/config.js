// lib/config.js
export const config = {
  app: {
    name: "tpkg",
    port: Number(process.env.PORT) || 3000,
    url: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
  },

  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "tpkg",
    password: process.env.DB_PASSWORD || "tpkg",
    name: process.env.DB_NAME || "tpkg",
    ssl: process.env.DB_SSL === "true",
  },

  github: {
    clientId: process.env.GITHUB_CLIENT_ID || "Ov23liOaQK1q0C2Golhk",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "cfd4ca1687aab40215a99239c5fa359b96bc1f15",
    scopes: ["read:user", "repo"],
  },
};

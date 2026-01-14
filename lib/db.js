// lib/db.js
import { Pool } from "pg";
import { config } from "./config.js"; // relative path, ESM-safe

const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  ssl: config.db.ssl || false,
});

db.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ PostgreSQL connected");
  }
});

db.on("error", (err) => {
  console.error("❌ PostgreSQL pool error:", err);
});

export { db };

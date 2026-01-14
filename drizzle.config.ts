import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "tpkg",
    password: process.env.DB_PASSWORD || "tpkg",
    database: process.env.DB_NAME || "tpkg"
  }
} satisfies Config;

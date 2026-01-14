// lib/schema.ts
import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

/* =======================
   USERS
======================= */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  github_id: integer("github_id").notNull().unique(),
  username: text("username").notNull().unique(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  access_token: text("access_token").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

/* =======================
   GITHUB OAUTH SESSIONS (WEB)
======================= */
export const github_sessions = pgTable("github_sessions", {
  id: text("id").primaryKey(), // hex state from crypto.randomBytes
  completed: boolean("completed").default(false),
  access_token: text("access_token"),
  created_at: timestamp("created_at").defaultNow(),
});

/* =======================
   CLI SESSIONS (FUTURE)
======================= */
export const cli_sessions = pgTable("cli_sessions", {
  id: text("id").primaryKey(), // also hex-based
  completed: boolean("completed").default(false),
  access_token: text("access_token"),
  created_at: timestamp("created_at").defaultNow(),
});

/* =======================
   TOOLS
======================= */
export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner_id: uuid("owner_id"),
  repo: text("repo").notNull(),
  name: text("name").notNull(),
  private: boolean("private").default(false),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  issues: integer("issues").default(0),
  readme: text("readme"),
  created_at: timestamp("created_at").defaultNow(),
});

/* =======================
   RELEASES
======================= */
export const releases = pgTable("releases", {
  id: uuid("id").primaryKey().defaultRandom(),
  tool_id: uuid("tool_id"),
  version: text("version").notNull(),
  description: text("description"),
  install: text("install"),
  language: text("language"),
  created_at: timestamp("created_at").defaultNow(),
});

/* =======================
   DOWNLOADS
======================= */
export const downloads = pgTable("downloads", {
  id: uuid("id").primaryKey().defaultRandom(),
  release_id: uuid("release_id"),
  ip: text("ip"),
  created_at: timestamp("created_at").defaultNow(),
});

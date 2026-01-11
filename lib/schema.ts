import { db } from "./db";

async function schema() {
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      github_id BIGINT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      name TEXT,
      avatar TEXT,
      bio TEXT,
      token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tools (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
      repo TEXT NOT NULL,
      name TEXT NOT NULL,
      private BOOLEAN DEFAULT false,
      stars INT DEFAULT 0,
      forks INT DEFAULT 0,
      issues INT DEFAULT 0,
      readme TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(owner_id, name)
    );

    CREATE TABLE IF NOT EXISTS releases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
      version TEXT NOT NULL,
      description TEXT,
      install TEXT,
      language TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(tool_id, version)
    );

    CREATE TABLE IF NOT EXISTS downloads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
      ip TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ tpkg schema ready");
  process.exit(0);
}

schema();

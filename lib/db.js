// lib/db.js
const { Pool } = require("pg");
const { config } = require("./config");

const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
});

db.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

module.exports = { db };

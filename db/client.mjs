import fs from "node:fs";
import pg from "pg";
// Minimal .env loader so scripts work without extra deps
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}
if (!process.env.DATABASE_URL) { console.error("DATABASE_URL is not set (copy .env.example to .env)"); process.exit(1); }
const needsSsl = /sslmode=require|aivencloud|neon\.tech|supabase/.test(process.env.DATABASE_URL);
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL.replace(/[?&]sslmode=require/, ""),
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});

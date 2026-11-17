// Creates tables (idempotent) and upserts the 10 demo users by email. Safe to re-run.
import fs from "node:fs";
import bcrypt from "bcryptjs";
import { pool } from "./client.mjs";
import { DEMO_USERS, DEMO_PASSWORD } from "./users.mjs";

await pool.query(fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
console.log("✔ Schema ready (users, projects, tasks)");
const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
for (const u of DEMO_USERS) {
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, specialization, skills)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role,
       specialization=EXCLUDED.specialization, skills=EXCLUDED.skills, password_hash=EXCLUDED.password_hash`,
    [u.id, u.name, u.email, hash, u.role, u.specialization, u.skills]
  );
  console.log(`✔ ${u.id.padEnd(5)} ${u.role.padEnd(7)} ${u.email}`);
}
const { rows } = await pool.query("SELECT count(*)::int AS n FROM users");
console.log(`Done. ${rows[0].n} users in database. Password for all: ${DEMO_PASSWORD}`);
await pool.end();

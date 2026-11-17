// Deletes generated projects/tasks only. Seeded users are kept.
import { pool } from "./client.mjs";
const t = await pool.query("DELETE FROM tasks");
const p = await pool.query("DELETE FROM projects");
console.log(`Deleted ${p.rowCount} projects and ${t.rowCount} tasks. Users kept.`);
await pool.end();

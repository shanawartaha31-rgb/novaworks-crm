import pg from "pg";

// Return DATE columns as plain "YYYY-MM-DD" strings (no timezone shifts)
pg.types.setTypeParser(1082, (v: string) => v);
// NUMERIC -> number
pg.types.setTypeParser(1700, (v: string) => Number(v));

const url = process.env.DATABASE_URL || "";
const needsSsl = /sslmode=require|aivencloud|neon\.tech|supabase/.test(url);

const g = globalThis as unknown as { __pool?: pg.Pool };
export const pool =
  g.__pool ??
  new pg.Pool({
    connectionString: url.replace(/[?&]sslmode=require/, ""),
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });
if (process.env.NODE_ENV !== "production") g.__pool = pool;

export async function q<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const r = await pool.query(sql, params);
  return r.rows as T[];
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { q } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  const rows = await q<{ id: string; role: string; password_hash: string }>(
    "SELECT id, role, password_hash FROM users WHERE lower(email) = lower($1)", [String(email).trim()]
  );
  const u = rows[0];
  if (!u || !(await bcrypt.compare(String(password), u.password_hash)))
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  await createSession(u.id);
  return NextResponse.json({ ok: true, role: u.role });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json(u);
}

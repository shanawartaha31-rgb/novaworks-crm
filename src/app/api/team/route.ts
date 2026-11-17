import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDirectory } from "@/lib/access";
export const dynamic = "force-dynamic";
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json(await getDirectory());
}

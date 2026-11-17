import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getMyTasks } from "@/lib/access";
export const dynamic = "force-dynamic";
// Returns only the logged-in user's own assigned tasks.
export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  return NextResponse.json(await getMyTasks(u));
}

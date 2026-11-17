import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectById } from "@/lib/access";
export const dynamic = "force-dynamic";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const data = await getProjectById(u, (await params).id);
  if (!data) return NextResponse.json({ error: "Forbidden: project not accessible for this account" }, { status: 403 });
  return NextResponse.json(data);
}

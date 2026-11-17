import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Home() {
  const u = await getCurrentUser();
  if (!u) redirect("/login");
  redirect(u.role === "AGENT" ? "/my-tasks" : "/projects");
}

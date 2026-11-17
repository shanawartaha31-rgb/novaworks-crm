import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getDirectory } from "@/lib/access";
import { aiProviderName } from "@/lib/ai";
import TranscriptClient from "./TranscriptClient";

export const dynamic = "force-dynamic";

export default async function TranscriptPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/projects");
  const dir = await getDirectory();
  return <TranscriptClient provider={aiProviderName()} directory={dir.filter((u) => u.role !== "ADMIN")} />;
}

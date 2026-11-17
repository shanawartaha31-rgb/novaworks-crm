import type { Draft } from "./ai";
import type { User } from "./types";

export interface Issue { path: string; message: string }

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s: unknown) => typeof s === "string" && ISO.test(s) && !isNaN(Date.parse(s + "T00:00:00Z"));

/** Map a name or id the AI returned to a real directory id of the required role. */
function resolve(ref: unknown, role: "MANAGER" | "AGENT", dir: User[]): string | null {
  if (typeof ref !== "string" || !ref.trim()) return null;
  const r = ref.trim().toLowerCase();
  const pool = dir.filter((u) => u.role === role);
  const hit =
    pool.find((u) => u.id.toLowerCase() === r) ||
    pool.find((u) => u.name.toLowerCase() === r) ||
    pool.find((u) => u.name.split(" ")[0].toLowerCase() === r);
  return hit ? hit.id : null;
}

/** Normalises the draft in place (names -> ids, trims) and returns every unresolved problem. */
export function validateDraft(draft: Draft, dir: User[]): { draft: Draft; issues: Issue[] } {
  const issues: Issue[] = [];
  if (!draft || !Array.isArray(draft.projects) || draft.projects.length === 0) {
    return { draft: { projects: [] }, issues: [{ path: "projects", message: "No projects could be extracted from the transcript." }] };
  }
  draft.projects.forEach((p, i) => {
    const at = `Project ${i + 1}${p?.name ? ` (${p.name})` : ""}`;
    p.name = String(p.name ?? "").trim();
    p.clientName = String(p.clientName ?? "").trim();
    p.description = String(p.description ?? "").trim();
    if (!p.name) issues.push({ path: at, message: "Project name is missing." });
    if (!p.clientName) issues.push({ path: at, message: "Client name is missing." });
    const mid = resolve(p.managerId, "MANAGER", dir);
    if (!mid) issues.push({ path: at, message: `Manager "${p.managerId || "?"}" is not an existing MANAGER.` });
    else p.managerId = mid;
    if (!validDate(p.deadline)) issues.push({ path: at, message: `Project deadline "${p.deadline || "?"}" is not a valid YYYY-MM-DD date.` });
    if (!Array.isArray(p.tasks) || p.tasks.length === 0) {
      issues.push({ path: at, message: "Project has no tasks." });
      p.tasks = [];
    }
    p.tasks.forEach((t, j) => {
      const tat = `${at} › Task ${j + 1}${t?.title ? ` (${t.title})` : ""}`;
      t.title = String(t.title ?? "").trim();
      t.description = String(t.description ?? "").trim();
      t.estimatedHours = Number(t.estimatedHours);
      if (!t.title) issues.push({ path: tat, message: "Task title is missing." });
      const aid = resolve(t.assigneeId, "AGENT", dir);
      if (!aid) issues.push({ path: tat, message: `Assignee "${t.assigneeId || "?"}" is not an existing AGENT.` });
      else t.assigneeId = aid;
      if (!(t.estimatedHours > 0)) issues.push({ path: tat, message: "Estimated hours must be a positive number." });
      if (!validDate(t.deadline)) issues.push({ path: tat, message: `Task deadline "${t.deadline || "?"}" is not a valid date.` });
      else if (validDate(p.deadline) && t.deadline > p.deadline)
        issues.push({ path: tat, message: `Task deadline ${t.deadline} is after project deadline ${p.deadline}.` });
    });
  });
  return { draft, issues };
}

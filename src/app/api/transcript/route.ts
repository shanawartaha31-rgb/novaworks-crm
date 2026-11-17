import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDirectory } from "@/lib/access";
import { extractDraft, type Draft } from "@/lib/ai";
import { validateDraft } from "@/lib/validate";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST { transcript }          -> AI extraction, validate, save all-or-nothing
 * POST { draft }               -> admin-corrected draft, re-validate, save all-or-nothing
 * POST { ..., dryRun: true }   -> validate only, never save
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Only the administrator can create from a transcript." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const directory = await getDirectory();

  let draft: Draft;
  if (body.draft) {
    draft = body.draft;
  } else {
    const transcript = String(body.transcript ?? "").trim();
    if (!transcript) return NextResponse.json({ error: "Transcript is empty. Paste the meeting transcript first." }, { status: 400 });
    try {
      draft = await extractDraft(transcript, directory);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 502 });
    }
  }

  const { draft: clean, issues } = validateDraft(draft, directory);
  if (issues.length) return NextResponse.json({ status: "needs_correction", issues, draft: clean }, { status: 422 });
  if (body.dryRun) return NextResponse.json({ status: "valid", draft: clean });

  // All-or-nothing save
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const created: { id: string; name: string; taskCount: number; hours: number }[] = [];
    for (const p of clean.projects) {
      const { rows } = await client.query(
        `INSERT INTO projects (name, client_name, description, manager_id, deadline) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
        [p.name, p.clientName, p.description, p.managerId, p.deadline]
      );
      const pid = rows[0].id;
      for (const t of p.tasks) {
        await client.query(
          `INSERT INTO tasks (project_id, title, description, assignee_id, deadline, estimated_hours) VALUES ($1,$2,$3,$4,$5,$6)`,
          [pid, t.title, t.description, t.assigneeId, t.deadline, t.estimatedHours]
        );
      }
      created.push({ id: pid, name: p.name, taskCount: p.tasks.length, hours: p.tasks.reduce((s, t) => s + t.estimatedHours, 0) });
    }
    await client.query("COMMIT");
    return NextResponse.json({
      status: "created",
      projects: created,
      totals: { projects: created.length, tasks: created.reduce((s, c) => s + c.taskCount, 0) },
      draft: clean,
    });
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Database error — nothing was saved. " + (e as Error).message }, { status: 500 });
  } finally {
    client.release();
  }
}

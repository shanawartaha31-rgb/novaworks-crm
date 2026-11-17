"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import type { Draft } from "@/lib/ai";
import { PageHeader, fmtDate } from "@/components/ui";

type Issue = { path: string; message: string };
type Result =
  | { status: "created"; projects: { id: string; name: string; taskCount: number; hours: number }[]; totals: { projects: number; tasks: number }; draft: Draft }
  | { status: "needs_correction"; issues: Issue[]; draft: Draft };

const STEPS = ["Reading transcript", "Matching team directory", "Applying final decisions", "Validating & saving"];

export default function TranscriptClient({ provider, directory }: { provider: string | null; directory: User[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  const managers = directory.filter((u) => u.role === "MANAGER");
  const agents = directory.filter((u) => u.role === "AGENT");
  const nameOf = (id: string) => directory.find((u) => u.id === id)?.name ?? id;

  async function loadSample() {
    setText(await (await fetch("/sample-transcript.txt")).text());
  }

  async function send(body: object) {
    setLoading(true);
    setError("");
    setResult(null);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 2500);
    try {
      const res = await fetch("/api/transcript", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.status === 422 || data.status === "needs_correction") {
        setResult(data);
        setDraft(data.draft);
      } else if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setResult(data);
        setDraft(null);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  function patchProject(i: number, key: string, value: string) {
    setDraft((d) => d && { projects: d.projects.map((p, pi) => (pi === i ? { ...p, [key]: value } : p)) });
  }
  function patchTask(i: number, j: number, key: string, value: string | number) {
    setDraft((d) => d && {
      projects: d.projects.map((p, pi) => pi !== i ? p : { ...p, tasks: p.tasks.map((t, tj) => (tj === j ? { ...t, [key]: value } : t)) }),
    });
  }

  return (
    <>
      <PageHeader
        title="Create from Transcript"
        subtitle="Paste the meeting transcript. The AI creates projects, assigns managers and developers, and sets deadlines and estimated hours."
        action={
          <span className={`chip ${provider ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>
            {provider ? `● AI: ${provider}` : "● No AI key configured"}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-ink">Meeting transcript</label>
            <div className="flex gap-2">
              <button type="button" onClick={loadSample} className="btn-ghost !py-1.5 text-xs" disabled={loading}>📄 Load supplied transcript</button>
              <button type="button" onClick={() => { setText(""); setResult(null); setDraft(null); setError(""); }} className="btn-ghost !py-1.5 text-xs" disabled={loading}>Clear</button>
            </div>
          </div>
          <textarea
            className="input h-80 resize-y font-mono text-xs leading-relaxed"
            placeholder="Paste the full meeting transcript here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
          />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">{text.length.toLocaleString()} characters</span>
            <button className="btn-primary" disabled={loading || !text.trim()} onClick={() => send({ transcript: text })}>
              {loading ? <><Spinner /> Processing…</> : "✨ Create from Transcript"}
            </button>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold text-ink">Team directory sent to AI</div>
          <p className="mt-1 text-xs text-slate-500">Only id, name, role and skills. Passwords never leave the server.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {directory.map((u) => (
              <li key={u.id} className="flex items-center justify-between">
                <span>{u.name}</span>
                <span className="font-mono text-[11px] text-slate-400">{u.id} · {u.role === "AGENT" ? "Dev" : "PM"}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {loading && (
        <div className="card mt-6 p-6">
          <div className="flex items-center gap-3 font-semibold text-ink"><Spinner dark /> AI is converting the meeting…</div>
          <ol className="mt-4 grid gap-2 sm:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s} className={`rounded-xl px-3 py-2 text-xs font-medium ${i < step ? "bg-emerald-50 text-emerald-700" : i === step ? "bg-brand-50 text-brand-700" : "bg-slate-50 text-slate-400"}`}>
                {i < step ? "✓" : i === step ? "…" : "○"} {s}
              </li>
            ))}
          </ol>
        </div>
      )}

      {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><b>Error:</b> {error} Nothing was saved.</div>}

      {result?.status === "created" && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <div className="text-lg font-bold text-emerald-800">
            ✅ Created {result.totals.projects} projects with {result.totals.tasks} tasks
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {result.projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`} className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md">
                <div className="font-semibold text-ink">{p.name}</div>
                <div className="mt-1 text-sm text-slate-500">{p.taskCount} tasks · {p.hours}h</div>
                <div className="mt-2 text-xs font-semibold text-brand-600">Open project →</div>
              </Link>
            ))}
          </div>
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-medium text-emerald-800">View extracted assignments</summary>
            <div className="mt-3 space-y-4">
              {result.draft.projects.map((p) => (
                <div key={p.name} className="rounded-xl bg-white p-4 text-sm">
                  <div className="font-semibold">{p.name} — {p.clientName} · {nameOf(p.managerId)} · {fmtDate(p.deadline)}</div>
                  <ul className="mt-2 space-y-1 text-slate-600">
                    {p.tasks.map((t) => <li key={t.title}>• {t.title} — {nameOf(t.assigneeId)}, {t.estimatedHours}h, {fmtDate(t.deadline)}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {result?.status === "needs_correction" && draft && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="text-lg font-bold text-amber-900">⚠️ Some required information could not be resolved — nothing was saved</div>
          <ul className="mt-3 space-y-1 text-sm text-amber-900">
            {result.issues.map((i, k) => <li key={k}>• <b>{i.path}:</b> {i.message}</li>)}
          </ul>
          <p className="mt-4 text-sm text-amber-800">Correct the fields below, then save. The draft is re-validated before anything is stored.</p>

          <div className="mt-4 space-y-5">
            {draft.projects.map((p, i) => (
              <div key={i} className="rounded-xl bg-white p-4">
                <div className="grid gap-3 md:grid-cols-4">
                  <input className="input" value={p.name} onChange={(e) => patchProject(i, "name", e.target.value)} placeholder="Project name" />
                  <input className="input" value={p.clientName} onChange={(e) => patchProject(i, "clientName", e.target.value)} placeholder="Client" />
                  <select className="input" value={p.managerId} onChange={(e) => patchProject(i, "managerId", e.target.value)}>
                    <option value="">— Select manager —</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <input className="input" type="date" value={p.deadline || ""} onChange={(e) => patchProject(i, "deadline", e.target.value)} />
                </div>
                <div className="mt-3 space-y-2">
                  {p.tasks.map((t, j) => (
                    <div key={j} className="grid gap-2 md:grid-cols-[2fr_1.3fr_1fr_90px]">
                      <input className="input" value={t.title} onChange={(e) => patchTask(i, j, "title", e.target.value)} placeholder="Task title" />
                      <select className="input" value={t.assigneeId} onChange={(e) => patchTask(i, j, "assigneeId", e.target.value)}>
                        <option value="">— Select developer —</option>
                        {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <input className="input" type="date" value={t.deadline || ""} onChange={(e) => patchTask(i, j, "deadline", e.target.value)} />
                      <input className="input" type="number" min={0.5} step={0.5} value={t.estimatedHours || ""} onChange={(e) => patchTask(i, j, "estimatedHours", Number(e.target.value))} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button className="btn-primary mt-5" disabled={loading} onClick={() => send({ draft })}>Re-validate & save</button>
        </div>
      )}
    </>
  );
}

function Spinner({ dark = false }: { dark?: boolean }) {
  return <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${dark ? "border-brand-200 border-t-brand-600" : "border-white/40 border-t-white"}`} />;
}

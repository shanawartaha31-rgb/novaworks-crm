import { requireUser } from "@/lib/auth";
import { getDirectory } from "@/lib/access";
import { Avatar, PageHeader, RoleBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Team() {
  await requireUser();
  const team = await getDirectory();
  return (
    <>
      <PageHeader title="Team Directory" subtitle="NovaWorks Technologies — read-only directory used by the AI for assignments." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((u) => (
          <div key={u.id} className="card p-5">
            <div className="flex items-center gap-3">
              <Avatar name={u.name} size={44} />
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{u.name}</div>
                <div className="truncate text-xs text-slate-500">{u.email}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">{u.specialization}</span>
              <RoleBadge role={u.role} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {u.skills.map((s) => <span key={s} className="chip bg-slate-100 text-slate-600">{s}</span>)}
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-400">{u.id}</div>
          </div>
        ))}
      </div>
    </>
  );
}

import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProjects } from "@/lib/access";
import { Avatar, Empty, PageHeader, Stat, fmtDate } from "@/components/ui";

export const dynamic = "force-dynamic";

const ACCENTS = ["from-indigo-500 to-violet-500", "from-sky-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-pink-500 to-rose-500"];

export default async function ProjectsPage() {
  const user = await requireUser();
  const projects = await getProjects(user);
  const tasks = projects.reduce((s, p) => s + p.taskCount, 0);
  const hours = projects.reduce((s, p) => s + p.totalHours, 0);
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader
        title={isAdmin ? "All Projects" : user.role === "MANAGER" ? "My Managed Projects" : "My Projects"}
        subtitle={
          isAdmin ? "Company-wide overview of every client project."
          : user.role === "MANAGER" ? `Projects managed by ${user.name}.`
          : "Projects where you have assigned tasks."
        }
        action={isAdmin && <Link href="/transcript" className="btn-primary">✨ Create from Transcript</Link>}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Projects" value={projects.length} icon="📁" />
        <Stat label={user.role === "AGENT" ? "My tasks" : "Tasks"} value={tasks} icon="✅" />
        <Stat label="Estimated hours" value={hours} icon="⏱️" />
      </div>

      {projects.length === 0 ? (
        <Empty
          title="No projects yet"
          text={isAdmin ? "Paste a meeting transcript and let the AI create projects and tasks automatically." : "Nothing is assigned to you yet."}
          action={isAdmin && <Link href="/transcript" className="btn-primary">✨ Create from Transcript</Link>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="card group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className={`h-1.5 bg-gradient-to-r ${ACCENTS[i % ACCENTS.length]}`} />
              <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{p.clientName}</div>
                <h3 className="mt-1 text-lg font-bold text-ink group-hover:text-brand-700">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                <div className="mt-5 flex items-center gap-2.5">
                  <Avatar name={p.managerName} size={28} />
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">{p.managerName}</div>
                    <div className="text-xs text-slate-400">Project manager</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                  <div><div className="text-sm font-bold text-ink">{fmtDate(p.deadline)}</div><div className="text-[11px] text-slate-400">Deadline</div></div>
                  <div><div className="text-sm font-bold text-ink">{p.taskCount}</div><div className="text-[11px] text-slate-400">{user.role === "AGENT" ? "My tasks" : "Tasks"}</div></div>
                  <div><div className="text-sm font-bold text-ink">{p.totalHours}h</div><div className="text-[11px] text-slate-400">Est. hours</div></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProjectById } from "@/lib/access";
import { Avatar, Empty, fmtDate } from "@/components/ui";
import TaskTable from "@/components/TaskTable";

export const dynamic = "force-dynamic";

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const data = await getProjectById(user, (await params).id);
  if (!data)
    return <Empty title="Access denied" text="This project does not exist or is not assigned to your account." action={<Link href="/projects" className="btn-ghost">← Back to projects</Link>} />;
  const { project: p, tasks } = data;
  const hours = tasks.reduce((s, t) => s + t.estimatedHours, 0);

  return (
    <>
      <Link href="/projects" className="text-sm font-medium text-slate-500 hover:text-brand-600">← Projects</Link>
      <div className="card mt-4 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-brand-500 to-violet-500" />
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Client · {p.clientName}</div>
            <h1 className="mt-1 text-2xl font-bold text-ink">{p.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{p.description}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:text-right">
            <div className="flex items-center gap-2 md:justify-end"><Avatar name={p.managerName} size={30} /><div><div className="text-sm font-semibold">{p.managerName}</div><div className="text-[11px] text-slate-400">Manager</div></div></div>
            <div><div className="text-sm font-semibold">{fmtDate(p.deadline)}</div><div className="text-[11px] text-slate-400">Project deadline</div></div>
            <div><div className="text-sm font-semibold">{tasks.length} tasks · {hours}h</div><div className="text-[11px] text-slate-400">{user.role === "AGENT" ? "Your share" : "Total effort"}</div></div>
          </div>
        </div>
      </div>
      <h2 className="mb-3 mt-8 text-lg font-bold text-ink">{user.role === "AGENT" ? "Your tasks in this project" : "Tasks"}</h2>
      {tasks.length ? <TaskTable tasks={tasks} /> : <Empty title="No tasks" text="No tasks are visible for your account in this project." />}
    </>
  );
}

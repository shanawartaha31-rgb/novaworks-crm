import type { Task } from "@/lib/types";
import { Avatar, fmtDate } from "./ui";
import Link from "next/link";

export default function TaskTable({ tasks, showProject = false }: { tasks: Task[]; showProject?: boolean }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <th className="th">Task</th>
            {showProject && <th className="th">Project</th>}
            <th className="th">Assigned to</th>
            <th className="th">Deadline</th>
            <th className="th text-right">Est. hours</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/50">
              <td className="td max-w-md">
                <div className="font-semibold text-ink">{t.title}</div>
                <div className="mt-0.5 text-slate-500">{t.description}</div>
              </td>
              {showProject && (
                <td className="td whitespace-nowrap">
                  <Link href={`/projects/${t.projectId}`} className="font-medium text-brand-600 hover:underline">{t.projectName}</Link>
                </td>
              )}
              <td className="td whitespace-nowrap">
                <div className="flex items-center gap-2"><Avatar name={t.assigneeName} size={26} /><span className="font-medium">{t.assigneeName}</span></div>
              </td>
              <td className="td whitespace-nowrap"><span className="chip bg-slate-100 text-slate-700">📅 {fmtDate(t.deadline)}</span></td>
              <td className="td whitespace-nowrap text-right font-bold text-ink">{t.estimatedHours}h</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

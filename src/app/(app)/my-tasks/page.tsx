import { requireUser } from "@/lib/auth";
import { getMyTasks } from "@/lib/access";
import { Empty, PageHeader, Stat } from "@/components/ui";
import TaskTable from "@/components/TaskTable";

export const dynamic = "force-dynamic";

export default async function MyTasks() {
  const user = await requireUser();
  const tasks = await getMyTasks(user);
  const projects = new Set(tasks.map((t) => t.projectId)).size;
  return (
    <>
      <PageHeader title="My Tasks" subtitle={`Work assigned to ${user.name}.`} />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Assigned tasks" value={tasks.length} icon="✅" />
        <Stat label="Projects" value={projects} icon="📁" />
        <Stat label="Estimated hours" value={tasks.reduce((s, t) => s + t.estimatedHours, 0)} icon="⏱️" />
      </div>
      {tasks.length ? <TaskTable tasks={tasks} showProject /> : <Empty title="No tasks assigned" text="You have no tasks assigned yet." />}
    </>
  );
}

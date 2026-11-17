// Role-based data access. Every page AND every API route goes through these functions,
// so restrictions are enforced on data requests, not just by hiding UI.
import { q } from "./db";
import type { Project, Task, User } from "./types";

const PROJECT_SELECT = `
  SELECT p.id, p.name, p.client_name AS "clientName", p.description, p.manager_id AS "managerId",
         m.name AS "managerName", p.deadline,
         COUNT(t.id)::int AS "taskCount", COALESCE(SUM(t.estimated_hours),0)::float AS "totalHours"
  FROM projects p
  JOIN users m ON m.id = p.manager_id
  LEFT JOIN tasks t ON t.project_id = p.id`;

const TASK_SELECT = `
  SELECT t.id, t.project_id AS "projectId", p.name AS "projectName", t.title, t.description,
         t.assignee_id AS "assigneeId", u.name AS "assigneeName", t.deadline,
         t.estimated_hours::float AS "estimatedHours"
  FROM tasks t
  JOIN users u ON u.id = t.assignee_id
  JOIN projects p ON p.id = t.project_id`;

export async function getProjects(user: User): Promise<Project[]> {
  if (user.role === "ADMIN")
    return q<Project>(`${PROJECT_SELECT} GROUP BY p.id, m.name ORDER BY p.created_at, p.name`);
  if (user.role === "MANAGER")
    return q<Project>(`${PROJECT_SELECT} WHERE p.manager_id = $1 GROUP BY p.id, m.name ORDER BY p.created_at, p.name`, [user.id]);
  // AGENT: distinct projects containing their assigned tasks (counts reflect only THEIR tasks)
  return q<Project>(
    `${PROJECT_SELECT} WHERE p.id IN (SELECT project_id FROM tasks WHERE assignee_id = $1)
       AND t.assignee_id = $1
     GROUP BY p.id, m.name ORDER BY p.created_at, p.name`,
    [user.id]
  );
}

export async function getTasks(user: User, projectId: string): Promise<Task[]> {
  if (user.role === "ADMIN")
    return q<Task>(`${TASK_SELECT} WHERE t.project_id = $1 ORDER BY t.deadline, t.title`, [projectId]);
  if (user.role === "MANAGER")
    return q<Task>(
      `${TASK_SELECT} WHERE t.project_id = $1 AND p.manager_id = $2 ORDER BY t.deadline, t.title`,
      [projectId, user.id]
    );
  return q<Task>(
    `${TASK_SELECT} WHERE t.project_id = $1 AND t.assignee_id = $2 ORDER BY t.deadline, t.title`,
    [projectId, user.id]
  );
}

/** Returns null when the project is outside the user's permitted projects. */
export async function getProjectById(user: User, projectId: string) {
  const allowed = await getProjects(user);
  const project = allowed.find((p) => p.id === projectId);
  if (!project) return null;
  return { project, tasks: await getTasks(user, projectId) };
}

export async function getMyTasks(user: User): Promise<Task[]> {
  return q<Task>(`${TASK_SELECT} WHERE t.assignee_id = $1 ORDER BY t.deadline, t.title`, [user.id]);
}

export async function getDirectory() {
  return q<User>("SELECT id, name, email, role, specialization, skills FROM users ORDER BY CASE role WHEN 'ADMIN' THEN 0 WHEN 'MANAGER' THEN 1 ELSE 2 END, id");
}

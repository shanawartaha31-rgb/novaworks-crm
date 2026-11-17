export type Role = "ADMIN" | "MANAGER" | "AGENT";
export interface User { id: string; name: string; email: string; role: Role; specialization: string; skills: string[] }
export interface Project { id: string; name: string; clientName: string; description: string; managerId: string; managerName: string; deadline: string; taskCount: number; totalHours: number }
export interface Task { id: string; projectId: string; projectName?: string; title: string; description: string; assigneeId: string; assigneeName: string; deadline: string; estimatedHours: number }

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Avatar, RoleBadge } from "./ui";

export default function Sidebar({ user }: { user: User }) {
  const path = usePathname();
  const router = useRouter();
  const links = [
    ...(user.role === "ADMIN" ? [{ href: "/transcript", label: "Create from Transcript", icon: "✨" }] : []),
    { href: "/projects", label: user.role === "AGENT" ? "My Projects" : "Projects", icon: "📁" },
    ...(user.role === "AGENT" ? [{ href: "/my-tasks", label: "My Tasks", icon: "✅" }] : []),
    { href: "/team", label: "Team Directory", icon: "👥" },
  ];
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 font-black text-white">N</div>
        <div>
          <div className="text-sm font-bold text-ink">NovaWorks</div>
          <div className="text-[11px] text-slate-500">AI Project Manager</div>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
        {links.map((l) => {
          const active = path === l.href || (l.href !== "/" && path.startsWith(l.href + "/"));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-slate-100 p-4 md:block">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{user.name}</div>
            <div className="mt-0.5"><RoleBadge role={user.role} /></div>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost mt-4 w-full">Log out</button>
      </div>
      <button onClick={logout} className="btn-ghost mx-3 mb-3 md:hidden">Log out ({user.name})</button>
    </aside>
  );
}

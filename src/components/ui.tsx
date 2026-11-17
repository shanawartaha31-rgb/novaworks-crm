import type { Role } from "@/lib/types";

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const hues = [234, 262, 199, 160, 24, 330, 280, 190, 12, 140];
  const h = hues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % hues.length];
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${h} 85% 94%)`, color: `hsl(${h} 60% 35%)` }}
    >
      {initials}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  const map = {
    ADMIN: "bg-slate-900 text-white",
    MANAGER: "bg-amber-100 text-amber-800",
    AGENT: "bg-emerald-100 text-emerald-800",
  } as const;
  return <span className={`chip ${map[role]}`}>{role === "AGENT" ? "Developer" : role === "MANAGER" ? "Manager" : "Admin"}</span>;
}

export function fmtDate(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">{icon}</span>
      <div>
        <div className="text-2xl font-bold text-ink">{value}</div>
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-3 text-4xl">🗂️</div>
      <div className="font-semibold text-ink">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

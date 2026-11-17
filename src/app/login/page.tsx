"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO = [
  { label: "Admin", email: "admin@novaworks.example", tag: "Admin" },
  { label: "Ayesha Khan", email: "ayesha@novaworks.example", tag: "Web PM" },
  { label: "Bilal Ahmed", email: "bilal@novaworks.example", tag: "Mobile PM" },
  { label: "Hina Malik", email: "hina@novaworks.example", tag: "AI PM" },
  { label: "Ali Raza", email: "ali@novaworks.example", tag: "Full-Stack" },
  { label: "Hamza Shah", email: "hamza@novaworks.example", tag: "Full-Stack" },
  { label: "Sara Noor", email: "sara@novaworks.example", tag: "App Dev" },
  { label: "Usman Tariq", email: "usman@novaworks.example", tag: "App Dev" },
  { label: "Zain Abbas", email: "zain@novaworks.example", tag: "AI Dev" },
  { label: "Maryam Asif", email: "maryam@novaworks.example", tag: "AI Dev" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Login failed");
    router.push(data.role === "AGENT" ? "/my-tasks" : "/projects");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 font-black backdrop-blur">N</div>
          <span className="text-lg font-bold">NovaWorks Technologies</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">From meeting<br />to execution,<br />in one click.</h1>
          <p className="mt-4 max-w-md text-brand-100">
            Paste a meeting transcript. Our AI project manager creates the projects, assigns the right people,
            and sets deadlines and estimated hours automatically.
          </p>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {[["🎙️", "Paste meeting"], ["🤖", "AI extracts"], ["📋", "Tasks assigned"]].map(([i, t]) => (
              <div key={t} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl">{i}</div>
                <div className="mt-1 text-xs font-medium">{t}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-brand-100">Lahore, Pakistan · The Infinity Hack ’26</div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in with your NovaWorks demo account.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@novaworks.example" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</div>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
          </form>

          <div className="mt-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts · password Demo123!</div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword("Demo123!"); }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-brand-500 hover:bg-brand-50"
                >
                  <span className="font-medium text-slate-700">{d.label}</span>
                  <span className="text-slate-400">{d.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const I = (d: ReactNode) => (
  <svg className="nav-ico w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    {d}
  </svg>
);

const GROUPS: { label: string; items: { href: string; name: string; icon: ReactNode }[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", name: "Dashboard", icon: I(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>) },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/students", name: "Students", icon: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>) },
      { href: "/teachers", name: "Teachers", icon: I(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>) },
      { href: "/courses", name: "Courses", icon: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>) },
      { href: "/batches", name: "Batches", icon: I(<><path d="M12 2 2 7l10 5 10-5-10-5z" /><path d="m2 17 10 5 10-5M2 12l10 5 10-5" /></>) },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/schedule", name: "Schedule", icon: I(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>) },
      { href: "/attendance", name: "Attendance", icon: I(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>) },
      { href: "/fees", name: "Fee Management", icon: I(<><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>) },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/leads", name: "Leads & Trials", icon: I(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></>) },
      { href: "/communications", name: "Communications", icon: I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />) },
    ],
  },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white/70 backdrop-blur border-r border-black/5 flex flex-col z-40">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-ink flex items-center justify-center text-gold-400 text-xl shadow-soft">✦</div>
          <div>
            <p className="font-extrabold text-[15px] leading-tight">Studio Manager</p>
            <p className="text-[11px] text-ink/50">Dance &amp; Art · Sharjah</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto space-y-5 pb-4">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-ink/35 mb-1">{g.label}</p>
            <div className="space-y-1">
              {g.items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/");
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition ${
                      active
                        ? "bg-ink text-white shadow-soft [&_.nav-ico]:text-gold-400"
                        : "text-ink hover:bg-black/5"
                    }`}
                  >
                    {it.icon}
                    {it.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream">
          <div className="w-9 h-9 rounded-full bg-gold-400 flex items-center justify-center text-sm font-bold text-ink uppercase">
            {email?.[0] ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{email?.split("@")[0] ?? "Admin"}</p>
            <p className="text-[11px] text-ink/50">Studio Manager</p>
          </div>
          <form action="/auth/signout" method="post">
            <button title="Sign out" className="text-ink/40 hover:text-ink">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div>
      <Sidebar email={user.email ?? "admin"} />
      <div className="ml-64">
        <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div className="relative w-80 max-w-full">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              placeholder="Search students, batches, payments…"
              className="w-full bg-white border border-black/5 rounded-full pl-10 pr-4 py-2.5 text-sm shadow-card focus:outline-none focus:ring-2 focus:ring-gold-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-full bg-white border border-black/5 shadow-card flex items-center justify-center hover:bg-cream transition">
              <svg className="w-[18px] h-[18px] text-ink/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-gold-400 rounded-full ring-2 ring-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-sm font-bold text-ink shadow-card uppercase">
              {(user.email ?? "A")[0]}
            </div>
          </div>
        </header>
        <main className="px-8 pb-10 animate-fade">{children}</main>
      </div>
    </div>
  );
}

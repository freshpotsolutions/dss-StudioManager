import Link from "next/link";
import { getStudents, getBatches, getPayments } from "@/lib/queries";
import { isComplete, aed, tint } from "@/lib/ui";
import { RevenueChart, ArtFormChart } from "@/components/Charts";
import type { Enrollment } from "@/lib/types";

export default async function DashboardPage() {
  const [students, batches, payments] = await Promise.all([getStudents(), getBatches(), getPayments()]);

  const allEnr = students.flatMap((s) => (s.enrollments ?? []).map((e) => ({ ...e, studentName: s.name })));

  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const revenueThisMonth = payments.filter((p) => p.paid_on.slice(0, 7) === thisMonth).reduce((a, p) => a + Number(p.amount), 0);

  // revenue series (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en-US", { month: "short" }) };
  });
  const revByMonth: Record<string, number> = Object.fromEntries(months.map((m) => [m.key, 0]));
  payments.forEach((p) => { const k = p.paid_on.slice(0, 7); if (k in revByMonth) revByMonth[k] += Number(p.amount); });

  // distribution by course
  const dist: Record<string, number> = {};
  allEnr.forEach((e) => { const c = e.batch?.course?.name ?? "Other"; dist[c] = (dist[c] ?? 0) + 1; });

  // attendance rate this snapshot
  const allAtt = allEnr.flatMap((e) => e.attendance ?? []);
  const attRate = allAtt.length ? Math.round((allAtt.filter((a) => a.status !== "absent").length / allAtt.length) * 100) : 0;

  const renewals = allEnr.filter((e) => isComplete(e as Enrollment));

  const todayAbbr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
  let todays = batches.filter((b) => b.days?.includes(todayAbbr));
  const todaysLabel = todays.length ? `Today · ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}` : "Active classes this week";
  if (!todays.length) todays = batches;
  const enrolledIn = (batchId: string) => allEnr.filter((e) => e.batch_id === batchId).length;

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back 👋</h1>
          <p className="text-ink/50 text-sm mt-1">Here&apos;s your studio overview for {now.toLocaleString("en-US", { month: "long", year: "numeric" })}.</p>
        </div>
      </div>

      {renewals.length > 0 && (
        <div className="mb-6 bg-ink text-white rounded-4xl p-5 shadow-soft flex items-center gap-4 flex-wrap">
          <div className="w-11 h-11 rounded-2xl bg-gold-400 flex items-center justify-center text-ink text-xl">🔔</div>
          <div className="flex-1 min-w-[220px]">
            <p className="font-bold text-sm">{renewals.length} session pack{renewals.length > 1 ? "s" : ""} completed — renewal due</p>
            <p className="text-xs text-white/60 mt-0.5">{renewals.map((e) => `${e.studentName} · ${e.batch?.course?.name ?? ""} ${e.batch?.name ?? ""}`).join("  •  ")}</p>
          </div>
          <Link href="/fees" className="bg-gold-400 text-ink px-4 py-2 rounded-full text-xs font-bold hover:bg-gold-300 transition">Collect Renewal</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-4xl p-5 shadow-card">
          <div className="w-10 h-10 rounded-2xl bg-plum-50 flex items-center justify-center mb-3">🧑‍🎓</div>
          <p className="text-3xl font-extrabold">{students.length}</p>
          <p className="text-xs text-ink/50 mt-1 font-semibold uppercase tracking-wide">Total Students</p>
        </div>
        <div className="bg-ink text-white rounded-4xl p-5 shadow-soft relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gold-400/20" />
          <div className="w-10 h-10 rounded-2xl bg-gold-400 flex items-center justify-center text-ink mb-3">💰</div>
          <p className="text-3xl font-extrabold">{aed(revenueThisMonth)}</p>
          <p className="text-xs text-white/60 mt-1 font-semibold uppercase tracking-wide">Revenue · {now.toLocaleString("en-US", { month: "short" })}</p>
        </div>
        <div className="bg-white rounded-4xl p-5 shadow-card">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 flex items-center justify-center mb-3">🎨</div>
          <p className="text-3xl font-extrabold">{batches.length}</p>
          <p className="text-xs text-ink/50 mt-1 font-semibold uppercase tracking-wide">Active Batches</p>
        </div>
        <div className="bg-white rounded-4xl p-5 shadow-card">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center mb-3">📅</div>
          <p className="text-3xl font-extrabold">{batches.filter((b) => b.days?.includes(todayAbbr)).length}</p>
          <p className="text-xs text-ink/50 mt-1 font-semibold uppercase tracking-wide">Classes Today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-4xl p-6 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Monthly Fee Collection</h3>
            <span className="text-xs text-ink/40 font-semibold">AED · last 6 months</span>
          </div>
          <div style={{ height: 160 }}>
            <RevenueChart labels={months.map((m) => m.label)} data={months.map((m) => revByMonth[m.key])} />
          </div>
        </div>
        <div className="bg-white rounded-4xl p-6 shadow-card flex flex-col">
          <h3 className="text-sm font-bold mb-2">Students by Art Form</h3>
          <div className="flex-1 flex items-center justify-center">
            {Object.keys(dist).length ? <ArtFormChart labels={Object.keys(dist)} data={Object.values(dist)} /> : <p className="text-sm text-ink/40">No enrollments yet.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="bg-white rounded-4xl p-6 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">{todaysLabel}</h3>
            <Link href="/schedule" className="text-xs font-semibold text-gold-600 hover:underline">View week →</Link>
          </div>
          <div className="space-y-2">
            {todays.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-cream transition">
                <div className="text-center w-20"><p className="text-sm font-bold">{b.clock ?? "—"}</p></div>
                <div className={`w-1 h-10 rounded-full ${tint(b.color).bar}`} />
                <div className="flex-1"><p className="text-sm font-bold">{b.course?.name ?? "Course"} · {b.name}</p><p className="text-xs text-ink/50">{b.teacher?.name ?? "—"}</p></div>
                <span className="text-xs font-semibold bg-cream px-3 py-1.5 rounded-full">{enrolledIn(b.id)} students</span>
              </div>
            ))}
            {!todays.length && <p className="text-sm text-ink/40">No classes scheduled.</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-4xl p-6 shadow-card">
            <h3 className="text-sm font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/students" className="flex flex-col items-start gap-2 p-3 bg-cream rounded-2xl hover:bg-sand transition"><span className="text-lg">➕</span><span className="text-xs font-bold">Students</span></Link>
              <Link href="/fees" className="flex flex-col items-start gap-2 p-3 bg-cream rounded-2xl hover:bg-sand transition"><span className="text-lg">💳</span><span className="text-xs font-bold">Collect Fee</span></Link>
              <Link href="/attendance" className="flex flex-col items-start gap-2 p-3 bg-cream rounded-2xl hover:bg-sand transition"><span className="text-lg">✓</span><span className="text-xs font-bold">Attendance</span></Link>
              <Link href="/communications" className="flex flex-col items-start gap-2 p-3 bg-cream rounded-2xl hover:bg-sand transition"><span className="text-lg">📣</span><span className="text-xs font-bold">Announce</span></Link>
            </div>
          </div>
          <div className="bg-gold-400 rounded-4xl p-6 shadow-soft relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">📈</div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink/70">Attendance rate</p>
            <p className="text-4xl font-extrabold mt-2">{attRate}%</p>
            <p className="text-xs text-ink/70 mt-1">Across all recorded sessions</p>
            <Link href="/attendance" className="inline-block mt-4 bg-ink text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black transition">View details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

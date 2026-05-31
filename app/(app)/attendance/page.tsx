import Link from "next/link";
import { getStudents, getBatches } from "@/lib/queries";
import { sessionsDone } from "@/lib/ui";
import AttendancePanel, { type PanelBatch } from "@/components/AttendancePanel";
import type { Enrollment } from "@/lib/types";

export default async function AttendancePage({ searchParams }: { searchParams: Promise<{ batch?: string }> }) {
  const { batch: initialBatchId } = await searchParams;
  const [students, batches] = await Promise.all([getStudents(), getBatches()]);

  const allEnr = students.flatMap((s) => (s.enrollments ?? []).map((e) => ({ ...e, studentName: s.name })));
  const label = (b: (typeof batches)[number]) => `${b.course?.name ?? "Course"} · ${b.name}`;

  const panelBatches: PanelBatch[] = batches.map((b) => ({
    id: b.id,
    label: label(b),
    clock: b.clock,
    sessionsTotal: b.sessions_total,
    meta: `Pack: ${b.sessions_total} sessions × ${b.hours_per_session} hr · ${(b.days ?? []).join(", ")} · ${b.time_label ?? ""}`,
    roster: allEnr.filter((e) => e.batch_id === b.id).map((e) => ({ enrollmentId: e.id, studentName: e.studentName, done: sessionsDone(e as Enrollment) })),
  }));

  // Rate per batch
  const byBatch = batches.map((b) => {
    const att = allEnr.filter((e) => e.batch_id === b.id).flatMap((e) => e.attendance ?? []);
    const rate = att.length ? Math.round((att.filter((a) => a.status !== "absent").length / att.length) * 100) : 0;
    return { id: b.id, label: label(b), rate, count: att.length };
  });

  const allAtt = allEnr.flatMap((e) => e.attendance ?? []);
  const avg = allAtt.length ? Math.round((allAtt.filter((a) => a.status !== "absent").length / allAtt.length) * 100) : 0;
  const present = allAtt.filter((a) => a.status !== "absent").length;

  const atRisk = allEnr
    .map((e) => {
      const att = e.attendance ?? [];
      const rate = att.length ? Math.round((att.filter((a) => a.status !== "absent").length / att.length) * 100) : 100;
      return { name: e.studentName, batch: label(batches.find((b) => b.id === e.batch_id)!), rate, count: att.length };
    })
    .filter((x) => x.count >= 3 && x.rate < 60);

  const barColor = (r: number) => (r >= 80 ? "bg-green-500" : r >= 65 ? "bg-gold-400" : "bg-rose-500");
  const txtColor = (r: number) => (r >= 80 ? "text-green-600" : r >= 65 ? "text-gold-600" : "text-rose-600");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Attendance</h1>
        <p className="text-ink/50 text-sm mt-1">Mark sessions and track attendance across batches.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-gold-400 rounded-4xl p-5 shadow-soft"><p className="text-xs font-bold uppercase tracking-wide text-ink/70">Average Rate</p><p className="text-3xl font-extrabold mt-2">{avg}%</p><p className="text-xs text-ink/70 mt-1">All recorded sessions</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Sessions Logged</p><p className="text-3xl font-extrabold mt-2">{allAtt.length}</p><p className="text-xs text-ink/40 mt-1">Across {batches.length} batches</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Present / Late</p><p className="text-3xl font-extrabold mt-2 text-green-600">{present}</p><p className="text-xs text-ink/40 mt-1">Counted toward packs</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">At-Risk</p><p className="text-3xl font-extrabold mt-2 text-rose-600">{atRisk.length}</p><p className="text-xs text-ink/40 mt-1">&lt; 60% attendance</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        <div className="xl:col-span-2">
          <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Mark Attendance</h2>
          <AttendancePanel batches={panelBatches} initialBatchId={initialBatchId} />
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-4xl p-6 shadow-card">
            <h3 className="text-sm font-bold mb-4">Rate by Batch</h3>
            <div className="space-y-4">
              {byBatch.map((b) => (
                <div key={b.id}>
                  <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold">{b.label}</span><span className={`font-bold ${txtColor(b.rate)}`}>{b.count ? `${b.rate}%` : "—"}</span></div>
                  <div className="w-full bg-cream rounded-full h-2.5"><div className={`${barColor(b.rate)} h-2.5 rounded-full`} style={{ width: `${b.count ? b.rate : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-4xl p-6 shadow-card">
            <h3 className="text-sm font-bold mb-4">At-Risk Students</h3>
            <div className="space-y-3">
              {atRisk.length ? atRisk.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-cream rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">{a.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                  <div className="flex-1"><p className="text-sm font-bold">{a.name}</p><p className="text-xs text-ink/40">{a.batch} · {a.rate}%</p></div>
                  <Link href="/communications" className="text-xs font-bold text-gold-600 hover:underline">Notify</Link>
                </div>
              )) : <p className="text-sm text-ink/40">No at-risk students. 🎉</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

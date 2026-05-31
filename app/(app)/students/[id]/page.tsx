import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudent, getStudentPayments, getBatches } from "@/lib/queries";
import { tint, initials, aed, shortDate, sessionsDone, sessionsCarried, packTotal, isComplete } from "@/lib/ui";
import Calendar, { type CalSession } from "@/components/Calendar";
import TransferButton from "@/components/TransferButton";
import type { Enrollment } from "@/lib/types";

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [student, payments, batches] = await Promise.all([getStudent(id), getStudentPayments(id), getBatches()]);
  if (!student) notFound();

  const enr = student.enrollments ?? [];
  const totalDue = enr.reduce((a, e) => a + Number(e.fee), 0);
  const collected = payments.reduce((a, p) => a + Number(p.amount), 0);
  const pending = enr.reduce((a, e) => {
    const paidForEnr = payments.filter((p) => p.enrollment_id === e.id).reduce((x, p) => x + Number(p.amount), 0);
    return a + (e.paid ? 0 : Math.max(0, Number(e.fee) - paidForEnr));
  }, 0);

  const calSessions: CalSession[] = enr.flatMap((e) =>
    (e.attendance ?? []).map((a) => ({
      date: a.session_date,
      time: a.session_time,
      status: a.status,
      color: e.batch?.course?.color ?? "plum",
      label: `${e.batch?.course?.name ?? ""} ${e.batch?.name ?? ""}`.trim(),
    })),
  );

  const batchLabel = (b: { course?: { name?: string } | null; name: string } | null | undefined) =>
    `${b?.course?.name ?? "Course"} · ${b?.name ?? ""}`.trim();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Student Profile</h1>
          <p className="text-ink/50 text-sm mt-1">Sessions, attendance calendar, and payments.</p>
        </div>
        <Link href="/students" className="bg-white border border-black/5 px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-cream transition shadow-card">← Back</Link>
      </div>

      <div className="bg-ink text-white rounded-4xl p-6 mb-6 shadow-soft relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-gold-400/10" />
        <div className="flex items-center gap-4 relative">
          <div className="w-16 h-16 rounded-full bg-gold-400 flex items-center justify-center text-2xl font-extrabold text-ink">{initials(student.name)}</div>
          <div>
            <h2 className="text-2xl font-extrabold">{student.name}</h2>
            <p className="text-sm text-white/60">ID: {student.code} · {student.email ?? "—"} · {student.phone ?? "—"}</p>
            {student.parent_name && <p className="text-sm text-white/60 mt-1">Parent: {student.parent_name} · {student.parent_phone ?? "—"}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Total Fees</p><p className="text-3xl font-extrabold mt-2">{aed(totalDue)}</p><p className="text-xs text-ink/40 mt-1">{enr.length} session pack{enr.length !== 1 ? "s" : ""}</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Pending</p><p className="text-3xl font-extrabold mt-2 text-gold-600">{aed(pending)}</p><p className="text-xs text-ink/40 mt-1">Awaiting payment</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Collected</p><p className="text-3xl font-extrabold mt-2 text-green-600">{aed(collected)}</p><p className="text-xs text-ink/40 mt-1">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
        <div>
          <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Session Packs</h2>
          <div className="space-y-4">
            {enr.map((e) => {
              const b = e.batch;
              const t = tint(b?.course?.color ?? "plum");
              const done = sessionsDone(e as Enrollment);
              const total = packTotal(e as Enrollment);
              const carried = sessionsCarried(e as Enrollment);
              const complete = isComplete(e as Enrollment);
              const pct = Math.min(100, Math.round((done / total) * 100));
              const options = batches.filter((x) => x.id !== e.batch_id).map((x) => ({ id: x.id, label: `${batchLabel(x)} · ${(x.days ?? []).join(", ")} ${x.time_label ?? ""}` }));
              return (
                <div key={e.id} className="bg-white rounded-4xl p-5 shadow-card">
                  <div className="flex justify-between items-start mb-3">
                    <div><h3 className="font-extrabold">{batchLabel(b)}</h3><p className="text-xs text-ink/50 mt-1">{b?.teacher?.name ?? "—"} {b?.teacher?.code ? `(${b.teacher.code})` : ""}</p></div>
                    {complete
                      ? <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Pack Complete</span>
                      : <span className={`px-2.5 py-1 ${t.bg} ${t.text} rounded-full text-xs font-bold`}>In Progress</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-ink/70 mb-3">
                    <p className="bg-cream rounded-xl p-2"><span className="block text-ink/40 text-[10px] uppercase font-bold">Schedule</span>{(b?.days ?? []).join(", ")} · {b?.time_label ?? ""}</p>
                    <p className="bg-cream rounded-xl p-2"><span className="block text-ink/40 text-[10px] uppercase font-bold">Pack</span>{b?.sessions_total ?? 8} sessions × {b?.hours_per_session ?? 1} hr</p>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5"><span className="text-ink/50">Sessions completed</span><span className={`font-bold ${complete ? "text-green-600" : t.text}`}>{done} / {total}</span></div>
                    <div className="w-full bg-cream rounded-full h-2.5"><div className={`${complete ? "bg-green-500" : t.bar} h-2.5 rounded-full`} style={{ width: `${pct}%` }} /></div>
                  </div>
                  {carried > 0 && <p className="text-[11px] text-ink/60 mb-3">↪ {carried} session{carried > 1 ? "s" : ""} carried forward from a previous batch</p>}
                  <div className="flex gap-2 mt-3">
                    <TransferButton enrollmentId={e.id} info={`${student.name} is in ${batchLabel(b)} — ${done}/${total} sessions completed.`} options={options} />
                    <Link href={`/attendance?batch=${e.batch_id}`} className="flex-1 text-center py-2 bg-ink hover:bg-black text-white rounded-full text-xs font-bold transition">✓ Mark</Link>
                  </div>
                </div>
              );
            })}
            {!enr.length && <p className="text-sm text-ink/40">No active packs.</p>}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Attendance Calendar</h2>
          <Calendar sessions={calSessions} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Payment History</h2>
        <div className="bg-white rounded-4xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream"><tr className="text-left text-[11px] text-ink/45 uppercase font-bold tracking-wide"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Receipt</th></tr></thead>
            <tbody className="divide-y divide-black/5">
              {payments.length ? payments.map((p) => (
                <tr key={p.id} className="hover:bg-cream transition">
                  <td className="px-5 py-4 text-ink/50">{shortDate(p.paid_on)}</td>
                  <td className="px-5 py-4 font-bold">{aed(Number(p.amount))}</td>
                  <td className="px-5 py-4 text-ink/50">{p.method}</td>
                  <td className="px-5 py-4 text-ink/50 font-mono text-xs">{p.receipt_no ?? "—"}</td>
                </tr>
              )) : <tr><td colSpan={4} className="px-5 py-6 text-center text-sm text-ink/40">No payments yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

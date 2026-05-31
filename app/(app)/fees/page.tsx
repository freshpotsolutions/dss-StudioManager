import { getStudents, getPayments } from "@/lib/queries";
import { tint, aed, shortDate } from "@/lib/ui";
import { recordPayment } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";

export default async function FeesPage() {
  const [students, payments] = await Promise.all([getStudents(), getPayments()]);
  const studentName: Record<string, string> = Object.fromEntries(students.map((s) => [s.id, s.name]));

  const allEnr = students.flatMap((s) => (s.enrollments ?? []).map((e) => ({ ...e, studentName: s.name })));
  const dueFor = (eId: string, fee: number) => fee - payments.filter((p) => p.enrollment_id === eId).reduce((a, p) => a + Number(p.amount), 0);
  const unpaid = allEnr.filter((e) => !e.paid).map((e) => ({ ...e, due: Math.max(0, dueFor(e.id, Number(e.fee))) }));

  const now = new Date().toISOString().slice(0, 7);
  const collected = payments.filter((p) => p.paid_on.slice(0, 7) === now).reduce((a, p) => a + Number(p.amount), 0);
  const pendingTotal = unpaid.reduce((a, e) => a + e.due, 0);
  const expected = collected + pendingTotal;
  const rate = expected ? Math.round((collected / expected) * 100) : 0;

  const PayDialog = ({ trigger, eId, sId, amount }: { trigger: React.ReactNode; eId?: string; sId?: string; amount?: number }) => (
    <FormDialog title="Record Payment" action={recordPayment} submitLabel="Record Payment" trigger={trigger}
      triggerClass="text-green-600 hover:underline text-xs font-bold">
      {eId && <input type="hidden" name="enrollment_id" defaultValue={eId} />}
      {sId && <input type="hidden" name="student_id" defaultValue={sId} />}
      {!eId && (
        <div>
          <label className={labelClass}>Enrollment</label>
          <select name="enrollment_id" className={fieldClass}>
            {allEnr.map((e) => <option key={e.id} value={e.id}>{e.studentName} — {e.batch?.course?.name} {e.batch?.name}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelClass}>Amount (AED)</label><input name="amount" type="number" defaultValue={amount ?? ""} placeholder="1500" className={fieldClass} /></div>
        <div><label className={labelClass}>Method</label><select name="method" className={fieldClass}><option>Bank Transfer</option><option>Cash</option><option>Card Payment</option><option>Cheque</option></select></div>
      </div>
      <div><label className={labelClass}>Payment Date</label><input name="paid_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={fieldClass} /></div>
    </FormDialog>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Fee Management</h1>
          <p className="text-ink/50 text-sm mt-1">Track and record student payments.</p>
        </div>
        <PayDialog trigger={<><span className="text-gold-400">+</span> Record Payment</>} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-ink text-white rounded-4xl p-5 shadow-soft"><p className="text-xs font-bold uppercase tracking-wide text-white/60">Collected · {new Date().toLocaleString("en-US", { month: "short" })}</p><p className="text-2xl font-extrabold mt-2 text-gold-400">{aed(collected)}</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Pending Dues</p><p className="text-2xl font-extrabold mt-2 text-gold-600">{aed(pendingTotal)}</p><p className="text-xs text-ink/40 mt-1">{unpaid.length} unpaid</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Expected</p><p className="text-2xl font-extrabold mt-2">{aed(expected)}</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Collection Rate</p><p className="text-2xl font-extrabold mt-2 text-green-600">{rate}%</p></div>
      </div>

      <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Pending Payments</h2>
      <div className="bg-white rounded-4xl shadow-card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-cream"><tr className="text-left text-[11px] text-ink/45 uppercase font-bold tracking-wide"><th className="px-5 py-3">Student</th><th className="px-5 py-3">Batch</th><th className="px-5 py-3">Pack</th><th className="px-5 py-3">Due</th><th className="px-5 py-3">Action</th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {unpaid.length ? unpaid.map((e) => {
              const t = tint(e.batch?.course?.color ?? "plum");
              return (
                <tr key={e.id} className="hover:bg-cream transition">
                  <td className="px-5 py-4 font-bold">{e.studentName}</td>
                  <td className="px-5 py-4"><span className={`px-2.5 py-1 ${t.bg} ${t.text} rounded-full text-xs font-semibold`}>{e.batch?.course?.name} {e.batch?.name}</span></td>
                  <td className="px-5 py-4 text-xs text-ink/50">{e.batch?.sessions_total ?? 8} × {e.batch?.hours_per_session ?? 1} hr</td>
                  <td className="px-5 py-4 font-bold">{aed(e.due)}</td>
                  <td className="px-5 py-4"><PayDialog trigger="Pay" eId={e.id} sId={e.student_id} amount={e.due} /></td>
                </tr>
              );
            }) : <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/40">No pending payments. 🎉</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-bold text-ink/60 uppercase tracking-wide mb-3">Recent Transactions</h2>
      <div className="bg-white rounded-4xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream"><tr className="text-left text-[11px] text-ink/45 uppercase font-bold tracking-wide"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Student</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Receipt</th></tr></thead>
          <tbody className="divide-y divide-black/5">
            {payments.length ? payments.map((p) => (
              <tr key={p.id} className="hover:bg-cream transition">
                <td className="px-5 py-4 text-ink/50">{shortDate(p.paid_on)}</td>
                <td className="px-5 py-4 font-bold">{studentName[p.student_id] ?? "—"}</td>
                <td className="px-5 py-4 font-bold">{aed(Number(p.amount))}</td>
                <td className="px-5 py-4 text-ink/50">{p.method}</td>
                <td className="px-5 py-4"><span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">{p.receipt_no ?? "Paid"}</span></td>
              </tr>
            )) : <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/40">No transactions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

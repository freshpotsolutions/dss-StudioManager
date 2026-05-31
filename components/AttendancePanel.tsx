"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAttendance } from "@/app/(app)/actions";

export type RosterRow = { enrollmentId: string; studentName: string; done: number };
export type PanelBatch = {
  id: string;
  label: string;
  clock: string | null;
  sessionsTotal: number;
  meta: string;
  roster: RosterRow[];
};

export default function AttendancePanel({
  batches,
  initialBatchId,
}: {
  batches: PanelBatch[];
  initialBatchId?: string;
}) {
  const router = useRouter();
  const valid = initialBatchId && batches.some((b) => b.id === initialBatchId);
  const [batchId, setBatchId] = useState(valid ? initialBatchId! : batches[0]?.id ?? "");
  const [date, setDate] = useState("2026-05-20");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<{ name: string; total: number; batch: string }[] | null>(null);
  const [saving, setSaving] = useState(false);

  const cur = batches.find((b) => b.id === batchId);
  const statusFor = (id: string) => status[id] ?? "present";

  async function save() {
    if (!cur) return;
    setSaving(true);
    const rows = cur.roster.map((r) => ({ enrollmentId: r.enrollmentId, status: statusFor(r.enrollmentId) as "present" | "absent" | "late" }));
    const res = await saveAttendance({ batchId: cur.id, date, clock: cur.clock ?? "", rows });
    setSaving(false);
    setStatus({});
    if (res.completed.length) setCompleted(res.completed);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-4xl p-6 shadow-card">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs text-ink/50 font-semibold">Batch</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200">
            {batches.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink/50 font-semibold">Session Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200" />
        </div>
      </div>

      {cur && <div className="bg-gold-50 border border-gold-100 rounded-xl p-3 text-xs text-gold-600 mb-4">{cur.meta}</div>}

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {cur && cur.roster.length > 0 ? (
          cur.roster.map((r) => (
            <div key={r.enrollmentId} className="flex items-center justify-between p-2.5 bg-cream rounded-xl">
              <div>
                <span className="text-sm font-semibold">{r.studentName}</span>
                <span className="text-xs text-ink/40 ml-2">{r.done}/{cur.sessionsTotal} done</span>
              </div>
              <select value={statusFor(r.enrollmentId)} onChange={(e) => setStatus((s) => ({ ...s, [r.enrollmentId]: e.target.value }))} className="text-xs border border-black/10 rounded-lg px-2 py-1.5">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink/40 text-center py-6">No students enrolled in this batch yet.</p>
        )}
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={save} disabled={saving || !cur?.roster.length} className="px-4 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-black disabled:opacity-50">
          {saving ? "Saving…" : "Save Attendance"}
        </button>
      </div>

      {completed && (
        <div className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCompleted(null)}>
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-md text-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gold-400 p-8"><div className="text-6xl">🎉</div></div>
            <div className="p-6">
              <h2 className="text-xl font-extrabold">Session Pack Complete!</h2>
              <p className="text-sm text-ink/60 mt-2">
                {completed.map((c) => (
                  <span key={c.name} className="block">
                    <b>{c.name}</b> completed all <b>{c.total} sessions</b> of <b>{c.batch}</b>.
                  </span>
                ))}
                Time to renew the pack and collect the next payment.
              </p>
              <button onClick={() => setCompleted(null)} className="mt-5 px-4 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-black">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

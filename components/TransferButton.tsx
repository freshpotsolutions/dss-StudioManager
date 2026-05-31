"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transferBatch } from "@/app/(app)/actions";

export default function TransferButton({
  enrollmentId,
  info,
  options,
}: {
  enrollmentId: string;
  info: string;
  options: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(options[0]?.id ?? "");
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!target) return;
    setBusy(true);
    await transferBatch(enrollmentId, target);
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex-1 py-2 bg-cream hover:bg-sand rounded-full text-xs font-bold transition">🔄 Transfer</button>
      {open && (
        <div className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
              <h2 className="font-extrabold">Transfer to Another Batch</h2>
              <button onClick={() => setOpen(false)} className="text-ink/40 hover:text-ink text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-cream rounded-xl p-3 text-xs text-ink/70">{info}</div>
              <div>
                <label className="text-xs text-ink/50 font-semibold">Move to Batch</label>
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200">
                  {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700"><b>✓ Attendance carries forward.</b> Completed sessions stay counted toward the same pack in the new batch.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-black/5 flex justify-end gap-3">
              <button onClick={() => setOpen(false)} className="px-4 py-2.5 border border-black/10 rounded-full text-sm font-semibold text-ink/60 hover:bg-cream">Cancel</button>
              <button onClick={go} disabled={busy} className="px-4 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-black disabled:opacity-50">{busy ? "Transferring…" : "Transfer Student"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

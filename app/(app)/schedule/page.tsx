import { getBatches } from "@/lib/queries";
import { tint } from "@/lib/ui";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function SchedulePage() {
  const batches = await getBatches();
  const slots = Array.from(new Set(batches.map((b) => b.time_label).filter(Boolean))) as string[];

  const cellBatches = (slot: string, day: string) =>
    batches.filter((b) => b.time_label === slot && (b.days ?? []).includes(day));

  const legend = Array.from(new Map(batches.map((b) => [b.course?.name, b.color])).entries());

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Weekly Schedule</h1>
        <p className="text-ink/50 text-sm mt-1">All classes scheduled this week (Mon – Sat).</p>
      </div>

      <div className="bg-white rounded-4xl shadow-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-ink text-white">
            <tr>
              <th className="px-4 py-3.5 text-left text-xs font-bold">Time Slot</th>
              {DAYS.map((d) => <th key={d} className="px-4 py-3.5 text-left text-xs font-bold">{d}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {slots.length ? slots.map((slot) => (
              <tr key={slot} className="hover:bg-cream transition">
                <td className="px-4 py-3 text-xs font-bold text-ink/60 whitespace-nowrap">{slot}</td>
                {DAYS.map((day) => (
                  <td key={day} className="px-4 py-3">
                    {cellBatches(slot, day).map((b) => {
                      const t = tint(b.color);
                      return <div key={b.id} className={`rounded-[10px] px-2 py-1.5 text-[11px] font-semibold ${t.bg} ${t.text} mb-1`}>{b.course?.name} {b.code}</div>;
                    })}
                  </td>
                ))}
              </tr>
            )) : <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-ink/40">No scheduled batches yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {legend.length > 0 && (
        <div className="mt-5 bg-white rounded-4xl p-5 shadow-card">
          <p className="text-xs font-bold text-ink/50 uppercase tracking-wide mb-3">Legend</p>
          <div className="flex flex-wrap gap-4">
            {legend.map(([name, color]) => (
              <div key={name} className="flex items-center gap-2"><span className={`w-3 h-3 rounded ${tint(color).bar}`} /><span className="text-xs">{name}</span></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

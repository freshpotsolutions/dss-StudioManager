"use client";

import { useState } from "react";
import { DOT } from "@/lib/ui";

export type CalSession = {
  date: string;
  time: string | null;
  status: "present" | "absent" | "late";
  color: string;
  label: string;
};

export default function Calendar({
  sessions,
  initialYear = 2026,
  initialMonth = 4, // 0-based; May
}: {
  sessions: CalSession[];
  initialYear?: number;
  initialMonth?: number;
}) {
  const [y, setY] = useState(initialYear);
  const [m, setM] = useState(initialMonth);

  const map: Record<string, CalSession[]> = {};
  for (const s of sessions) (map[s.date] ??= []).push(s);

  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const daysIn = new Date(y, m + 1, 0).getDate();
  const monthName = first.toLocaleString("en-US", { month: "long", year: "numeric" });

  const nav = (delta: number) => {
    let nm = m + delta, ny = y;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    setM(nm); setY(ny);
  };

  const cells: React.ReactNode[] = ["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
    <div key={"h" + i} className="text-center text-[10px] font-bold text-ink/40 py-1">{d}</div>
  ));
  for (let i = 0; i < startDow; i++) cells.push(<div key={"e" + i} />);
  for (let day = 1; day <= daysIn; day++) {
    const ds = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const evs = map[ds];
    if (evs) {
      const tip = evs.map((ev) => `${ev.label} ${ev.time ?? ""} (${ev.status})`).join(" | ");
      cells.push(
        <div key={day} title={tip} className="aspect-square rounded-xl bg-cream flex flex-col items-center justify-center gap-1 hover:bg-sand transition">
          <span className="text-xs font-bold">{day}</span>
          <div className="flex gap-0.5">
            {evs.map((ev, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${DOT[ev.status]}`} />)}
          </div>
        </div>,
      );
    } else {
      cells.push(
        <div key={day} className="aspect-square rounded-xl flex items-center justify-center">
          <span className="text-xs text-ink/30">{day}</span>
        </div>,
      );
    }
  }

  return (
    <div className="bg-white rounded-4xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => nav(-1)} className="w-8 h-8 rounded-full bg-cream hover:bg-sand flex items-center justify-center text-sm">‹</button>
        <p className="text-sm font-bold">{monthName}</p>
        <button onClick={() => nav(1)} className="w-8 h-8 rounded-full bg-cream hover:bg-sand flex items-center justify-center text-sm">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5 text-[10px] text-ink/50">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Present</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold-400" />Late</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />Absent</span>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveLead } from "@/app/(app)/actions";

const STAGES = [
  { value: "new", label: "New Enquiry" },
  { value: "trial_booked", label: "Trial Booked" },
  { value: "attended", label: "Attended Trial" },
  { value: "enrolled", label: "Enrolled" },
];

export default function LeadStage({ id, stage }: { id: string; stage: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <select
      value={stage}
      disabled={pending}
      onChange={(e) => {
        const v = e.target.value;
        start(async () => {
          await moveLead(id, v);
          router.refresh();
        });
      }}
      className="w-full text-[11px] border border-black/10 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gold-200 disabled:opacity-50"
    >
      {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
    </select>
  );
}

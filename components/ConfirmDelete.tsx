"use client";

import { useState, type ReactNode } from "react";

export default function ConfirmDelete({
  action,
  id,
  label = "this record",
  note,
  trigger = "Delete",
  triggerClass = "text-rose-600 hover:underline text-xs font-bold",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  note?: string;
  trigger?: ReactNode;
  triggerClass?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>{trigger}</button>
      {open && (
        <div className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-2xl">🗑️</div>
            <h2 className="text-lg font-extrabold mt-3">Delete {label}?</h2>
            <p className="text-sm text-ink/50 mt-1">{note ?? "This can't be undone."}</p>
            <div className="flex gap-2 justify-center mt-5">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 border border-black/10 rounded-full text-sm font-semibold text-ink/60 hover:bg-cream">Cancel</button>
              <form action={action} onSubmit={() => setTimeout(() => setOpen(false), 60)}>
                <input type="hidden" name="id" defaultValue={id} />
                <button type="submit" className="px-4 py-2.5 bg-rose-600 text-white rounded-full text-sm font-semibold hover:bg-rose-700">Delete</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

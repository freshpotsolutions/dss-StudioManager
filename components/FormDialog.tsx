"use client";

import { useState, type ReactNode } from "react";

export default function FormDialog({
  trigger,
  triggerClass = "bg-ink text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition shadow-soft",
  title,
  action,
  submitLabel = "Save",
  children,
  maxWidth = "max-w-lg",
}: {
  trigger: ReactNode;
  triggerClass?: string;
  title: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {trigger}
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-ink/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className={`bg-white rounded-4xl shadow-2xl w-full ${maxWidth} max-h-[88vh] overflow-y-auto`}>
            <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="font-extrabold">{title}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-ink/40 hover:text-ink text-xl">✕</button>
            </div>
            <form action={action} onSubmit={() => setTimeout(() => setOpen(false), 60)}>
              <div className="p-6 space-y-4">{children}</div>
              <div className="px-6 py-4 border-t border-black/5 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 border border-black/10 rounded-full text-sm font-semibold text-ink/60 hover:bg-cream">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-black">{submitLabel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Shared field styles
export const fieldClass =
  "mt-1 w-full border border-black/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-200";
export const labelClass = "text-xs text-ink/50 font-semibold";

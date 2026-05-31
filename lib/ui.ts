import type { Attendance, Color, Enrollment } from "./types";

// Tailwind tokens keyed by accent color (must be static strings for JIT).
export const TINT: Record<Color, { bg: string; text: string; bar: string; solid: string }> = {
  plum:  { bg: "bg-plum-50",  text: "text-plum-600",  bar: "bg-plum-500",  solid: "bg-plum-500" },
  blue:  { bg: "bg-blue-50",  text: "text-blue-600",  bar: "bg-blue-500",  solid: "bg-blue-500" },
  green: { bg: "bg-green-50", text: "text-green-600", bar: "bg-green-500", solid: "bg-green-500" },
  rose:  { bg: "bg-rose-50",  text: "text-rose-600",  bar: "bg-rose-500",  solid: "bg-rose-500" },
  gold:  { bg: "bg-gold-50",  text: "text-gold-600",  bar: "bg-gold-400",  solid: "bg-gold-400" },
};

export const tint = (c: Color | string | null | undefined) =>
  TINT[(c as Color) in TINT ? (c as Color) : "plum"];

export const DOT: Record<Attendance["status"], string> = {
  present: "bg-green-500",
  late: "bg-gold-400",
  absent: "bg-rose-400",
};

export const aed = (n: number) => "AED " + Math.round(n).toLocaleString("en-US");

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// ---- Session-pack math (the core domain logic) ----
export function sessionsDone(e: Enrollment) {
  return (e.attendance ?? []).filter((a) => a.status !== "absent").length;
}
// Sessions completed in a batch other than the current one (carried forward on transfer).
export function sessionsCarried(e: Enrollment) {
  return (e.attendance ?? []).filter((a) => a.status !== "absent" && a.batch_id !== e.batch_id).length;
}
export function packTotal(e: Enrollment) {
  return e.batch?.sessions_total ?? 8;
}
export function isComplete(e: Enrollment) {
  return sessionsDone(e) >= packTotal(e);
}

export const shortDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

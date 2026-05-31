"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

function revalidateAll() {
  ["/dashboard", "/students", "/teachers", "/courses", "/batches", "/attendance", "/fees", "/leads", "/communications"].forEach(
    (p) => revalidatePath(p, "page"),
  );
  revalidatePath("/students/[id]", "page");
}

async function nextCode(s: SupabaseServer, table: string, prefix: string, start: number) {
  const { data } = await s.from(table).select("code").order("code", { ascending: false }).limit(1);
  const last = (data?.[0] as { code?: string } | undefined)?.code;
  const n = last ? parseInt(last.replace(/\D/g, ""), 10) : start - 1;
  return prefix + (n + 1);
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

// ---------------------------------------------------------------------------
// Attendance — upsert rows, then detect newly completed packs (req #3).
// ---------------------------------------------------------------------------
export async function saveAttendance(payload: {
  batchId: string;
  date: string;
  clock: string;
  rows: { enrollmentId: string; status: "present" | "absent" | "late" }[];
}): Promise<{ completed: { name: string; total: number; batch: string }[] }> {
  const s = await createClient();
  if (!payload.date) return { completed: [] };

  const records = payload.rows.map((r) => ({
    enrollment_id: r.enrollmentId,
    batch_id: payload.batchId,
    session_date: payload.date,
    session_time: payload.clock,
    status: r.status,
  }));
  await s.from("attendance").upsert(records, { onConflict: "enrollment_id,session_date,batch_id" });

  const ids = payload.rows.map((r) => r.enrollmentId);
  const { data: enrs } = await s
    .from("enrollments")
    .select("id, notified, batch:batches(sessions_total, name, course:courses(name)), attendance(status)")
    .in("id", ids);

  const completed: { name: string; total: number; batch: string }[] = [];
  for (const e of (enrs ?? []) as any[]) {
    const done = (e.attendance ?? []).filter((a: any) => a.status !== "absent").length;
    const total = e.batch?.sessions_total ?? 8;
    if (done >= total && !e.notified) {
      await s.from("enrollments").update({ notified: true }).eq("id", e.id);
      const { data: stu } = await s
        .from("enrollments")
        .select("student:students(name)")
        .eq("id", e.id)
        .single();
      completed.push({
        name: (stu as any)?.student?.name ?? "Student",
        total,
        batch: `${e.batch?.course?.name ?? ""} · ${e.batch?.name ?? ""}`.trim(),
      });
    }
  }

  revalidateAll();
  return { completed };
}

// ---------------------------------------------------------------------------
// Transfer to another batch — attendance rows keep their batch, so completed
// sessions carry forward automatically (req #4).
// ---------------------------------------------------------------------------
export async function transferBatch(enrollmentId: string, targetBatchId: string) {
  const s = await createClient();
  await s.from("enrollments").update({ batch_id: targetBatchId, notified: false }).eq("id", enrollmentId);

  // Re-evaluate completion against the new pack size.
  const { data: e } = await s
    .from("enrollments")
    .select("id, batch:batches(sessions_total), attendance(status)")
    .eq("id", enrollmentId)
    .single();
  if (e) {
    const done = ((e as any).attendance ?? []).filter((a: any) => a.status !== "absent").length;
    const total = (e as any).batch?.sessions_total ?? 8;
    if (done >= total) await s.from("enrollments").update({ notified: true }).eq("id", enrollmentId);
  }
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export async function recordPayment(fd: FormData) {
  const s = await createClient();
  const enrollmentId = str(fd, "enrollment_id") || null;
  let studentId = str(fd, "student_id");
  if (!studentId && enrollmentId) {
    const { data } = await s.from("enrollments").select("student_id").eq("id", enrollmentId).single();
    studentId = (data as { student_id?: string } | null)?.student_id ?? "";
  }
  const amount = Number(str(fd, "amount") || 0);
  const method = str(fd, "method") || "Cash";
  const paidOn = str(fd, "paid_on") || new Date().toISOString().slice(0, 10);

  const { count } = await s.from("payments").select("*", { count: "exact", head: true });
  const receipt = `RCP-${paidOn.slice(0, 7)}-${String((count ?? 0) + 1).padStart(3, "0")}`;

  await s.from("payments").insert({
    enrollment_id: enrollmentId,
    student_id: studentId,
    amount,
    method,
    paid_on: paidOn,
    receipt_no: receipt,
  });
  if (enrollmentId) await s.from("enrollments").update({ paid: true }).eq("id", enrollmentId);
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Add records
// ---------------------------------------------------------------------------
export async function addStudent(fd: FormData) {
  const s = await createClient();
  const code = await nextCode(s, "students", "ST", 1001);
  await s.from("students").insert({
    code,
    name: `${str(fd, "first_name")} ${str(fd, "last_name")}`.trim(),
    email: str(fd, "email") || null,
    phone: str(fd, "phone") || null,
    parent_name: str(fd, "parent_name") || null,
    parent_phone: str(fd, "parent_phone") || null,
    relationship: str(fd, "relationship") || null,
    color: ["plum", "blue", "green", "rose", "gold"][Math.floor(Math.random() * 5)],
  });
  revalidateAll();
}

export async function addTeacher(fd: FormData) {
  const s = await createClient();
  const code = await nextCode(s, "teachers", "TR", 1001);
  await s.from("teachers").insert({
    code,
    name: `${str(fd, "first_name")} ${str(fd, "last_name")}`.trim(),
    specialization: str(fd, "specialization") || null,
    phone: str(fd, "phone") || null,
    email: str(fd, "email") || null,
  });
  revalidateAll();
}

export async function addCourse(fd: FormData) {
  const s = await createClient();
  const code = await nextCode(s, "courses", "CS", 1001);
  await s.from("courses").insert({
    code,
    name: str(fd, "name"),
    description: str(fd, "description") || null,
  });
  revalidateAll();
}

export async function createBatch(fd: FormData) {
  const s = await createClient();
  const code = await nextCode(s, "batches", "B", 1);
  await s.from("batches").insert({
    code,
    name: str(fd, "name") || "Batch",
    course_id: str(fd, "course_id") || null,
    teacher_id: str(fd, "teacher_id") || null,
    days: str(fd, "days") ? str(fd, "days").split(",").map((d) => d.trim()) : [],
    time_label: str(fd, "time_label") || null,
    clock: str(fd, "clock") || null,
    sessions_total: Number(str(fd, "sessions_total") || 8),
    hours_per_session: Number(str(fd, "hours_per_session") || 1),
    fee: Number(str(fd, "fee") || 0),
    capacity: Number(str(fd, "capacity") || 20),
  });
  revalidateAll();
}

export async function addLead(fd: FormData) {
  const s = await createClient();
  await s.from("leads").insert({
    name: str(fd, "name"),
    phone: str(fd, "phone") || null,
    interest: str(fd, "interest") || null,
    source: str(fd, "source") || "Walk-in",
    stage: (str(fd, "stage") as any) || "new",
    trial_date: str(fd, "trial_date") || null,
  });
  revalidateAll();
}

export async function sendCommunication(fd: FormData) {
  const s = await createClient();
  await s.from("communications").insert({
    type: str(fd, "type") || "Announcement",
    audience: str(fd, "audience") || "All Parents",
    channel: (str(fd, "channel") as any) || "WhatsApp",
    message: str(fd, "message") || null,
    status: "Queued",
  });
  revalidateAll();
}

export async function assignBatch(fd: FormData) {
  const s = await createClient();
  const batchId = str(fd, "batch_id");
  const { data: b } = await s.from("batches").select("fee").eq("id", batchId).single();
  await s.from("enrollments").insert({
    student_id: str(fd, "student_id"),
    batch_id: batchId,
    fee: (b as any)?.fee ?? 0,
  });
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Edit (update) actions
// ---------------------------------------------------------------------------
export async function updateStudent(fd: FormData) {
  const s = await createClient();
  await s.from("students").update({
    name: str(fd, "name"),
    email: str(fd, "email") || null,
    phone: str(fd, "phone") || null,
    parent_name: str(fd, "parent_name") || null,
    parent_phone: str(fd, "parent_phone") || null,
    relationship: str(fd, "relationship") || null,
  }).eq("id", str(fd, "id"));
  revalidateAll();
}

export async function updateTeacher(fd: FormData) {
  const s = await createClient();
  await s.from("teachers").update({
    name: str(fd, "name"),
    specialization: str(fd, "specialization") || null,
    phone: str(fd, "phone") || null,
    email: str(fd, "email") || null,
  }).eq("id", str(fd, "id"));
  revalidateAll();
}

export async function updateCourse(fd: FormData) {
  const s = await createClient();
  await s.from("courses").update({
    name: str(fd, "name"),
    description: str(fd, "description") || null,
    icon: str(fd, "icon") || "🎨",
  }).eq("id", str(fd, "id"));
  revalidateAll();
}

export async function updateBatch(fd: FormData) {
  const s = await createClient();
  await s.from("batches").update({
    name: str(fd, "name") || "Batch",
    course_id: str(fd, "course_id") || null,
    teacher_id: str(fd, "teacher_id") || null,
    days: str(fd, "days") ? str(fd, "days").split(",").map((d) => d.trim()) : [],
    time_label: str(fd, "time_label") || null,
    clock: str(fd, "clock") || null,
    sessions_total: Number(str(fd, "sessions_total") || 8),
    hours_per_session: Number(str(fd, "hours_per_session") || 1),
    fee: Number(str(fd, "fee") || 0),
    capacity: Number(str(fd, "capacity") || 20),
    status: str(fd, "status") || "active",
  }).eq("id", str(fd, "id"));
  revalidateAll();
}

export async function updateLead(fd: FormData) {
  const s = await createClient();
  await s.from("leads").update({
    name: str(fd, "name"),
    phone: str(fd, "phone") || null,
    interest: str(fd, "interest") || null,
    source: str(fd, "source") || "Walk-in",
    stage: (str(fd, "stage") as any) || "new",
    trial_date: str(fd, "trial_date") || null,
  }).eq("id", str(fd, "id"));
  revalidateAll();
}

// Lightweight stage move from the Kanban board (called directly from a client component).
export async function moveLead(leadId: string, stage: string) {
  const s = await createClient();
  await s.from("leads").update({ stage }).eq("id", leadId);
  revalidateAll();
}

// ---------------------------------------------------------------------------
// Delete actions
// ---------------------------------------------------------------------------
export async function deleteStudent(fd: FormData) {
  const s = await createClient();
  await s.from("students").delete().eq("id", str(fd, "id"));
  revalidateAll();
}
export async function deleteTeacher(fd: FormData) {
  const s = await createClient();
  await s.from("teachers").delete().eq("id", str(fd, "id"));
  revalidateAll();
}
export async function deleteCourse(fd: FormData) {
  const s = await createClient();
  await s.from("courses").delete().eq("id", str(fd, "id"));
  revalidateAll();
}
export async function deleteBatch(fd: FormData) {
  const s = await createClient();
  await s.from("batches").delete().eq("id", str(fd, "id"));
  revalidateAll();
}
export async function deleteLead(fd: FormData) {
  const s = await createClient();
  await s.from("leads").delete().eq("id", str(fd, "id"));
  revalidateAll();
}

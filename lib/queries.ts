import { createClient } from "@/lib/supabase/server";
import type {
  Batch, Communication, Course, Enrollment, Lead, Payment, Student, Teacher,
} from "./types";

export type StudentWithEnrollments = Student & { enrollments: Enrollment[] };

const ENROLLMENT_SELECT =
  "*, batch:batches(*, course:courses(*), teacher:teachers(*)), attendance(*)";

export async function getStudents(): Promise<StudentWithEnrollments[]> {
  const s = await createClient();
  const { data } = await s
    .from("students")
    .select(`*, enrollments(${ENROLLMENT_SELECT})`)
    .order("code");
  return (data ?? []) as unknown as StudentWithEnrollments[];
}

export async function getStudent(id: string): Promise<StudentWithEnrollments | null> {
  const s = await createClient();
  const { data } = await s
    .from("students")
    .select(`*, enrollments(${ENROLLMENT_SELECT})`)
    .eq("id", id)
    .single();
  return (data as unknown as StudentWithEnrollments) ?? null;
}

export async function getStudentPayments(id: string): Promise<Payment[]> {
  const s = await createClient();
  const { data } = await s
    .from("payments")
    .select("*")
    .eq("student_id", id)
    .order("paid_on", { ascending: false });
  return (data ?? []) as Payment[];
}

export async function getBatches(): Promise<Batch[]> {
  const s = await createClient();
  const { data } = await s
    .from("batches")
    .select("*, course:courses(*), teacher:teachers(*)")
    .order("code");
  return (data ?? []) as unknown as Batch[];
}

export async function getCourses(): Promise<Course[]> {
  const s = await createClient();
  const { data } = await s.from("courses").select("*").order("code");
  return (data ?? []) as Course[];
}

export async function getTeachers(): Promise<Teacher[]> {
  const s = await createClient();
  const { data } = await s.from("teachers").select("*").order("code");
  return (data ?? []) as Teacher[];
}

export async function getEnrollments(): Promise<Enrollment[]> {
  const s = await createClient();
  const { data } = await s.from("enrollments").select(ENROLLMENT_SELECT);
  return (data ?? []) as unknown as Enrollment[];
}

export async function getPayments(): Promise<Payment[]> {
  const s = await createClient();
  const { data } = await s
    .from("payments")
    .select("*")
    .order("paid_on", { ascending: false });
  return (data ?? []) as Payment[];
}

export async function getLeads(): Promise<Lead[]> {
  const s = await createClient();
  const { data } = await s.from("leads").select("*").order("created_at");
  return (data ?? []) as Lead[];
}

export async function getCommunications(): Promise<Communication[]> {
  const s = await createClient();
  const { data } = await s
    .from("communications")
    .select("*")
    .order("sent_at", { ascending: false });
  return (data ?? []) as Communication[];
}

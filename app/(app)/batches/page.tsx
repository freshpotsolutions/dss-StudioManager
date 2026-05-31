import Link from "next/link";
import { getBatches, getCourses, getTeachers, getStudents } from "@/lib/queries";
import { tint } from "@/lib/ui";
import { createBatch, assignBatch, updateBatch, deleteBatch } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";
import ConfirmDelete from "@/components/ConfirmDelete";

export default async function BatchesPage() {
  const [batches, courses, teachers, students] = await Promise.all([getBatches(), getCourses(), getTeachers(), getStudents()]);
  const allEnr = students.flatMap((s) => (s.enrollments ?? []).map((e) => ({ ...e, studentName: s.name })));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Batches</h1>
          <p className="text-ink/50 text-sm mt-1">Each batch sets its own session pack &amp; hours.</p>
        </div>
        <FormDialog title="Create New Batch" action={createBatch} submitLabel="Create Batch" trigger={<><span className="text-gold-400">+</span> Create New Batch</>}>
          <div><label className={labelClass}>Course</label><select name="course_id" className={fieldClass}>{courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Batch Name</label><input name="name" placeholder="Batch 4" className={fieldClass} /></div>
            <div><label className={labelClass}>Max Capacity</label><input name="capacity" type="number" defaultValue={20} className={fieldClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Sessions per Pack</label><input name="sessions_total" type="number" defaultValue={8} min={1} className={fieldClass} /></div>
            <div><label className={labelClass}>Hours per Session</label><select name="hours_per_session" className={fieldClass}><option value="1">1 hour</option><option value="1.5">1.5 hours</option><option value="2">2 hours</option></select></div>
          </div>
          <div><label className={labelClass}>Assigned Teacher</label><select name="teacher_id" className={fieldClass}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Days (comma-separated)</label><input name="days" placeholder="Mon, Wed, Sat" className={fieldClass} /></div>
            <div><label className={labelClass}>Fee (AED)</label><input name="fee" type="number" placeholder="1200" className={fieldClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Time Label</label><input name="time_label" placeholder="9:00–10:00 AM" className={fieldClass} /></div>
            <div><label className={labelClass}>Start Clock</label><input name="clock" placeholder="9:00 AM" className={fieldClass} /></div>
          </div>
        </FormDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {batches.map((b) => {
          const t = tint(b.color);
          const roster = allEnr.filter((e) => e.batch_id === b.id);
          const cap = b.capacity ?? 20;
          const pct = Math.min(100, Math.round((roster.length / cap) * 100));
          return (
            <div key={b.id} className="bg-white rounded-4xl p-6 shadow-card">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="font-extrabold text-lg">{b.course?.name} · {b.code}</h3><p className="text-xs text-ink/50 mt-1">{b.teacher?.name ?? "—"}</p></div>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold capitalize">{b.status}</span>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs text-ink/50 mb-1.5"><span>Enrollment</span><span className="font-bold text-ink">{roster.length} / {cap}</span></div>
                <div className="w-full bg-cream rounded-full h-2"><div className={`${t.bar} h-2 rounded-full`} style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-ink/70 mb-4">
                <p className="bg-cream rounded-xl p-2"><span className="block text-ink/40 text-[10px] uppercase font-bold">Schedule</span>{(b.days ?? []).join(", ")}</p>
                <p className="bg-cream rounded-xl p-2"><span className="block text-ink/40 text-[10px] uppercase font-bold">Pack</span>{b.sessions_total} × {b.hours_per_session} hr</p>
              </div>
              <div className="flex gap-2">
                <FormDialog title={`Assign student to ${b.course?.name} ${b.code}`} action={assignBatch} submitLabel="Assign"
                  triggerClass="flex-1 py-2.5 bg-cream hover:bg-sand text-ink rounded-full text-xs font-bold transition" trigger="👥 Assign">
                  <input type="hidden" name="batch_id" defaultValue={b.id} />
                  <div><label className={labelClass}>Student</label><select name="student_id" className={fieldClass}>{students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></div>
                  <p className="text-xs text-ink/50">Fee: AED {b.fee} · {b.sessions_total} sessions × {b.hours_per_session} hr</p>
                </FormDialog>
                <Link href={`/attendance?batch=${b.id}`} className="flex-1 text-center py-2.5 bg-ink hover:bg-black text-white rounded-full text-xs font-bold transition">✓ Attendance</Link>
              </div>
              <div className="flex gap-2 mt-2">
                <FormDialog title={`Edit ${b.course?.name ?? "Batch"} ${b.code}`} action={updateBatch} submitLabel="Update Batch"
                  triggerClass="flex-1 py-2 bg-cream hover:bg-sand rounded-full text-xs font-bold transition" trigger="Edit">
                  <input type="hidden" name="id" defaultValue={b.id} />
                  <div><label className={labelClass}>Course</label><select name="course_id" defaultValue={b.course_id ?? ""} className={fieldClass}>{courses.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Batch Name</label><input name="name" defaultValue={b.name} className={fieldClass} /></div>
                    <div><label className={labelClass}>Max Capacity</label><input name="capacity" type="number" defaultValue={b.capacity ?? 20} className={fieldClass} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Sessions per Pack</label><input name="sessions_total" type="number" min={1} defaultValue={b.sessions_total} className={fieldClass} /></div>
                    <div><label className={labelClass}>Hours per Session</label><select name="hours_per_session" defaultValue={String(b.hours_per_session)} className={fieldClass}><option value="1">1 hour</option><option value="1.5">1.5 hours</option><option value="2">2 hours</option></select></div>
                  </div>
                  <div><label className={labelClass}>Assigned Teacher</label><select name="teacher_id" defaultValue={b.teacher_id ?? ""} className={fieldClass}>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}</select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelClass}>Days (comma-separated)</label><input name="days" defaultValue={(b.days ?? []).join(", ")} className={fieldClass} /></div>
                    <div><label className={labelClass}>Fee (AED)</label><input name="fee" type="number" defaultValue={b.fee} className={fieldClass} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1"><label className={labelClass}>Time Label</label><input name="time_label" defaultValue={b.time_label ?? ""} className={fieldClass} /></div>
                    <div><label className={labelClass}>Start Clock</label><input name="clock" defaultValue={b.clock ?? ""} className={fieldClass} /></div>
                    <div><label className={labelClass}>Status</label><select name="status" defaultValue={b.status} className={fieldClass}><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></div>
                  </div>
                </FormDialog>
                <ConfirmDelete action={deleteBatch} id={b.id} label={`${b.course?.name ?? ""} ${b.code}`} note="Removes the batch and all its enrollments & attendance records."
                  triggerClass="px-3 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-100 transition" trigger="Delete" />
              </div>
            </div>
          );
        })}
        {!batches.length && <p className="text-sm text-ink/40">No batches yet.</p>}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getStudents } from "@/lib/queries";
import { tint, initials } from "@/lib/ui";
import { addStudent, updateStudent, deleteStudent } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";
import ConfirmDelete from "@/components/ConfirmDelete";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Student Management</h1>
          <p className="text-ink/50 text-sm mt-1">Manage all students and their enrollments.</p>
        </div>
        <FormDialog title="Add New Student" action={addStudent} submitLabel="Save Student" maxWidth="max-w-2xl" trigger={<><span className="text-gold-400">+</span> Add New Student</>}>
          <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide border-b border-black/5 pb-2">Student Information</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>First Name</label><input name="first_name" required placeholder="Fatima" className={fieldClass} /></div>
            <div><label className={labelClass}>Last Name</label><input name="last_name" placeholder="Al Rashid" className={fieldClass} /></div>
          </div>
          <div><label className={labelClass}>Contact Number</label><input name="phone" placeholder="+971 50 000 0000" className={fieldClass} /></div>
          <div><label className={labelClass}>Email</label><input name="email" type="email" placeholder="student@email.com" className={fieldClass} /></div>
          <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wide border-b border-black/5 pb-2">Parent / Guardian (optional)</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Guardian Name</label><input name="parent_name" placeholder="Ahmed Al Rashid" className={fieldClass} /></div>
            <div><label className={labelClass}>Relationship</label>
              <select name="relationship" className={fieldClass}><option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option></select>
            </div>
          </div>
          <div><label className={labelClass}>Parent Mobile</label><input name="parent_phone" placeholder="+971 50 000 0000" className={fieldClass} /></div>
        </FormDialog>
      </div>

      <div className="bg-white rounded-4xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream">
            <tr className="text-left text-[11px] text-ink/45 uppercase font-bold tracking-wide">
              <th className="px-5 py-3">ID</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Enrolled</th><th className="px-5 py-3">Fee Status</th><th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {students.map((s) => {
              const t = tint(s.color);
              const enr = s.enrollments ?? [];
              const pending = enr.some((e) => !e.paid);
              return (
                <tr key={s.id} className="hover:bg-cream transition">
                  <td className="px-5 py-4 text-ink/60 font-semibold">{s.code}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${t.bg} ${t.text} flex items-center justify-center text-xs font-bold`}>{initials(s.name)}</div>
                      <div><p className="font-bold">{s.name}</p><p className="text-xs text-ink/40">{s.email ?? "—"}</p></div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink/60">{s.phone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {enr.length ? enr.map((e) => {
                        const et = tint(e.batch?.course?.color ?? "plum");
                        return <span key={e.id} className={`px-2.5 py-1 ${et.bg} ${et.text} rounded-full text-xs font-semibold`}>{e.batch?.course?.name ?? "Course"}</span>;
                      }) : <span className="text-xs text-ink/30">No batches</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {enr.length === 0
                      ? <span className="text-xs text-ink/30">—</span>
                      : pending
                        ? <span className="px-2.5 py-1 bg-gold-50 text-gold-600 rounded-full text-xs font-bold">Pending</span>
                        : <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">Paid</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/students/${s.id}`} className="text-gold-600 hover:underline text-xs font-bold">Profile</Link>
                      <FormDialog title="Edit Student" action={updateStudent} submitLabel="Update Student"
                        triggerClass="text-ink/60 hover:underline text-xs font-bold" trigger="Edit">
                        <input type="hidden" name="id" defaultValue={s.id} />
                        <div><label className={labelClass}>Full Name</label><input name="name" required defaultValue={s.name} className={fieldClass} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={s.phone ?? ""} className={fieldClass} /></div>
                          <div><label className={labelClass}>Email</label><input name="email" type="email" defaultValue={s.email ?? ""} className={fieldClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelClass}>Guardian Name</label><input name="parent_name" defaultValue={s.parent_name ?? ""} className={fieldClass} /></div>
                          <div><label className={labelClass}>Relationship</label>
                            <select name="relationship" defaultValue={s.relationship ?? "Father"} className={fieldClass}><option>Father</option><option>Mother</option><option>Guardian</option><option>Other</option></select>
                          </div>
                        </div>
                        <div><label className={labelClass}>Parent Mobile</label><input name="parent_phone" defaultValue={s.parent_phone ?? ""} className={fieldClass} /></div>
                      </FormDialog>
                      <ConfirmDelete action={deleteStudent} id={s.id} label={s.name} note="Removes the student and all their enrollments, attendance and payments." />
                    </div>
                  </td>
                </tr>
              );
            })}
            {!students.length && <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-ink/40">No students yet. Click “Add New Student”.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

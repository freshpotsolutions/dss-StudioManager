import { getTeachers, getBatches } from "@/lib/queries";
import { tint, initials } from "@/lib/ui";
import { addTeacher } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";

export default async function TeachersPage() {
  const [teachers, batches] = await Promise.all([getTeachers(), getBatches()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Teacher Management</h1>
          <p className="text-ink/50 text-sm mt-1">Instructors and their assigned batches.</p>
        </div>
        <FormDialog title="Add New Teacher" action={addTeacher} submitLabel="Save Teacher" trigger={<><span className="text-gold-400">+</span> Add New Teacher</>}>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>First Name</label><input name="first_name" required placeholder="Priya" className={fieldClass} /></div>
            <div><label className={labelClass}>Last Name</label><input name="last_name" placeholder="Nair" className={fieldClass} /></div>
          </div>
          <div><label className={labelClass}>Contact Number</label><input name="phone" placeholder="+971 50 000 0000" className={fieldClass} /></div>
          <div><label className={labelClass}>Email</label><input name="email" type="email" placeholder="teacher@email.com" className={fieldClass} /></div>
          <div><label className={labelClass}>Specialization</label><input name="specialization" placeholder="Classical Dance" className={fieldClass} /></div>
        </FormDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {teachers.map((t) => {
          const c = tint(t.color);
          const assigned = batches.filter((b) => b.teacher_id === t.id);
          return (
            <div key={t.id} className="bg-white rounded-4xl shadow-card overflow-hidden">
              <div className={`h-20 ${c.solid}`} />
              <div className="px-6 pb-6">
                <div className="flex justify-center -mt-12 mb-3">
                  <div className={`w-24 h-24 rounded-full ${c.bg} border-4 border-white flex items-center justify-center text-3xl font-extrabold ${c.text} shadow-soft`}>{initials(t.name)}</div>
                </div>
                <h3 className="text-center font-extrabold text-lg">{t.name}</h3>
                <p className="text-center text-xs text-ink/50 mb-4">{t.specialization ?? "Instructor"}</p>
                <div className="space-y-2 text-xs text-ink/70 mb-4">
                  <div className="flex items-center justify-between"><span className="text-ink/40">Mobile</span><span className="font-semibold">{t.phone ?? "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-ink/40">Email</span><span className="font-semibold text-gold-600">{t.email ?? "—"}</span></div>
                  <div className="flex items-center justify-between"><span className="text-ink/40">ID</span><span className="font-semibold font-mono">{t.code}</span></div>
                </div>
                <div className="border-t border-black/5 pt-3">
                  <p className="text-[11px] font-bold text-ink/50 mb-2 uppercase tracking-wide">Assigned Batches</p>
                  <div className="flex flex-wrap gap-1.5">
                    {assigned.length ? assigned.map((b) => <span key={b.id} className={`px-2.5 py-1 ${c.bg} ${c.text} rounded-full text-xs font-semibold`}>{b.course?.name} · {b.code}</span>) : <span className="text-xs text-ink/30">None yet</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {!teachers.length && <p className="text-sm text-ink/40">No teachers yet.</p>}
      </div>
    </div>
  );
}

import { getCourses, getBatches, getStudents } from "@/lib/queries";
import { tint } from "@/lib/ui";
import { addCourse } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";

export default async function CoursesPage() {
  const [courses, batches, students] = await Promise.all([getCourses(), getBatches(), getStudents()]);
  const allEnr = students.flatMap((s) => s.enrollments ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Course Management</h1>
          <p className="text-ink/50 text-sm mt-1">All art forms offered by the studio.</p>
        </div>
        <FormDialog title="Add New Course" action={addCourse} submitLabel="Save Course" trigger={<><span className="text-gold-400">+</span> Add New Course</>}>
          <div><label className={labelClass}>Course Name</label><input name="name" required placeholder="Classical Dance" className={fieldClass} /></div>
          <div><label className={labelClass}>Description</label><textarea name="description" rows={3} placeholder="Brief description…" className={fieldClass} /></div>
        </FormDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => {
          const t = tint(c.color);
          const cb = batches.filter((b) => b.course_id === c.id);
          const activeCount = cb.filter((b) => b.status === "active").length;
          const studentCount = allEnr.filter((e) => e.batch?.course_id === c.id).length;
          return (
            <div key={c.id} className="bg-white rounded-4xl p-5 shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div><h3 className="text-xl font-extrabold">{c.name}</h3><p className="text-xs text-ink/40 mt-0.5">{c.code}</p></div>
                <div className={`w-11 h-11 rounded-2xl ${t.bg} flex items-center justify-center text-xl`}>{c.icon ?? "🎨"}</div>
              </div>
              <p className="text-sm text-ink/60 mb-4">{c.description ?? "—"}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-cream rounded-2xl p-3 text-center"><p className={`text-xl font-extrabold ${t.text}`}>{cb.length}</p><p className="text-[10px] text-ink/50 font-bold uppercase">Batches</p></div>
                <div className="bg-cream rounded-2xl p-3 text-center"><p className="text-xl font-extrabold text-green-600">{activeCount}</p><p className="text-[10px] text-ink/50 font-bold uppercase">Active</p></div>
                <div className="bg-cream rounded-2xl p-3 text-center"><p className="text-xl font-extrabold">{studentCount}</p><p className="text-[10px] text-ink/50 font-bold uppercase">Students</p></div>
              </div>
            </div>
          );
        })}
        {!courses.length && <p className="text-sm text-ink/40">No courses yet.</p>}
      </div>
    </div>
  );
}

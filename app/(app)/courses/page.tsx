import { getCourses, getBatches, getStudents } from "@/lib/queries";
import { tint } from "@/lib/ui";
import { addCourse, updateCourse, deleteCourse } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";
import ConfirmDelete from "@/components/ConfirmDelete";

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
              <div className="flex gap-2 mt-4">
                <FormDialog title="Edit Course" action={updateCourse} submitLabel="Update Course"
                  triggerClass="flex-1 py-2 bg-cream hover:bg-sand rounded-full text-xs font-bold transition" trigger="Edit">
                  <input type="hidden" name="id" defaultValue={c.id} />
                  <div className="grid grid-cols-4 gap-3">
                    <div><label className={labelClass}>Icon</label><input name="icon" defaultValue={c.icon ?? "🎨"} className={fieldClass} /></div>
                    <div className="col-span-3"><label className={labelClass}>Course Name</label><input name="name" required defaultValue={c.name} className={fieldClass} /></div>
                  </div>
                  <div><label className={labelClass}>Description</label><textarea name="description" rows={3} defaultValue={c.description ?? ""} className={fieldClass} /></div>
                </FormDialog>
                <ConfirmDelete action={deleteCourse} id={c.id} label={c.name} note="Batches in this course will be kept but un-linked from it."
                  triggerClass="px-3 py-2 bg-rose-50 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-100 transition" trigger="Delete" />
              </div>
            </div>
          );
        })}
        {!courses.length && <p className="text-sm text-ink/40">No courses yet.</p>}
      </div>
    </div>
  );
}

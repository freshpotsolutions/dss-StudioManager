import { getLeads } from "@/lib/queries";
import { shortDate } from "@/lib/ui";
import { addLead, updateLead, deleteLead } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";
import ConfirmDelete from "@/components/ConfirmDelete";
import LeadStage from "@/components/LeadStage";
import type { Lead } from "@/lib/types";

const STAGES: { key: Lead["stage"]; label: string; chip: string }[] = [
  { key: "new", label: "New Enquiry", chip: "bg-cream text-ink" },
  { key: "trial_booked", label: "Trial Booked", chip: "bg-blue-50 text-blue-600" },
  { key: "attended", label: "Attended Trial", chip: "bg-gold-50 text-gold-600" },
  { key: "enrolled", label: "Enrolled", chip: "bg-green-50 text-green-700" },
];

export default async function LeadsPage() {
  const leads = await getLeads();
  const counts = (k: Lead["stage"]) => leads.filter((l) => l.stage === k).length;
  const enquiries = leads.length;
  const trials = leads.filter((l) => l.stage === "trial_booked" || l.stage === "attended").length;
  const converted = counts("enrolled");
  const rate = enquiries ? Math.round((converted / enquiries) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Leads &amp; Trials</h1>
          <p className="text-ink/50 text-sm mt-1">Track prospective students from enquiry to enrollment.</p>
        </div>
        <FormDialog title="Add New Lead" action={addLead} submitLabel="Save Lead" trigger={<><span className="text-gold-400">+</span> Add Lead</>}>
          <div><label className={labelClass}>Full Name</label><input name="name" required placeholder="Prospective student" className={fieldClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Contact Number</label><input name="phone" placeholder="+971 50 000 0000" className={fieldClass} /></div>
            <div><label className={labelClass}>Interested In</label><input name="interest" placeholder="Classical Dance" className={fieldClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Source</label><select name="source" className={fieldClass}><option>Walk-in</option><option>Instagram</option><option>Referral</option><option>Website</option><option>Google</option></select></div>
            <div><label className={labelClass}>Stage</label><select name="stage" className={fieldClass}><option value="new">New Enquiry</option><option value="trial_booked">Trial Booked</option><option value="attended">Attended Trial</option><option value="enrolled">Enrolled</option></select></div>
          </div>
          <div><label className={labelClass}>Trial Date (optional)</label><input name="trial_date" type="date" className={fieldClass} /></div>
        </FormDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Total Leads</p><p className="text-3xl font-extrabold mt-2">{enquiries}</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">In Trials</p><p className="text-3xl font-extrabold mt-2">{trials}</p></div>
        <div className="bg-white rounded-4xl p-5 shadow-card"><p className="text-xs font-bold uppercase tracking-wide text-ink/45">Converted</p><p className="text-3xl font-extrabold mt-2">{converted}</p></div>
        <div className="bg-gold-400 rounded-4xl p-5 shadow-soft"><p className="text-xs font-bold uppercase tracking-wide text-ink/70">Conversion Rate</p><p className="text-3xl font-extrabold mt-2">{rate}%</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.key} className="bg-white rounded-4xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wide text-ink/50">{stage.label}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.chip}`}>{counts(stage.key)}</span>
            </div>
            <div className="space-y-2">
              {leads.filter((l) => l.stage === stage.key).map((l) => (
                <div key={l.id} className="bg-cream rounded-2xl p-3">
                  <p className="text-sm font-bold">{l.name}</p>
                  <p className="text-xs text-ink/50 mt-0.5">{l.interest ?? "—"}{l.source ? ` · ${l.source}` : ""}</p>
                  {l.phone && <p className="text-[11px] text-ink/40 mt-2">📞 {l.phone}</p>}
                  {l.trial_date && <span className="inline-block mt-2 text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Trial · {shortDate(l.trial_date)}</span>}
                  <div className="mt-3"><LeadStage id={l.id} stage={l.stage} /></div>
                  <div className="flex items-center gap-3 mt-2">
                    <FormDialog title="Edit Lead" action={updateLead} submitLabel="Update Lead"
                      triggerClass="text-ink/60 hover:underline text-[11px] font-bold" trigger="Edit">
                      <input type="hidden" name="id" defaultValue={l.id} />
                      <div><label className={labelClass}>Full Name</label><input name="name" required defaultValue={l.name} className={fieldClass} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={l.phone ?? ""} className={fieldClass} /></div>
                        <div><label className={labelClass}>Interested In</label><input name="interest" defaultValue={l.interest ?? ""} className={fieldClass} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClass}>Source</label><select name="source" defaultValue={l.source ?? "Walk-in"} className={fieldClass}><option>Walk-in</option><option>Instagram</option><option>Referral</option><option>Website</option><option>Google</option></select></div>
                        <div><label className={labelClass}>Stage</label><select name="stage" defaultValue={l.stage} className={fieldClass}><option value="new">New Enquiry</option><option value="trial_booked">Trial Booked</option><option value="attended">Attended Trial</option><option value="enrolled">Enrolled</option></select></div>
                      </div>
                      <div><label className={labelClass}>Trial Date</label><input name="trial_date" type="date" defaultValue={l.trial_date ?? ""} className={fieldClass} /></div>
                    </FormDialog>
                    <ConfirmDelete action={deleteLead} id={l.id} label={l.name} triggerClass="text-rose-600 hover:underline text-[11px] font-bold" />
                  </div>
                </div>
              ))}
              {!counts(stage.key) && <p className="text-xs text-ink/30 px-1 py-3">None</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

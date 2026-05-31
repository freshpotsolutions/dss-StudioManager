import { getCommunications } from "@/lib/queries";
import { shortDate } from "@/lib/ui";
import { sendCommunication } from "@/app/(app)/actions";
import FormDialog, { fieldClass, labelClass } from "@/components/FormDialog";

const channelChip: Record<string, string> = {
  WhatsApp: "bg-green-50 text-green-700",
  SMS: "bg-blue-50 text-blue-600",
  Email: "bg-gold-50 text-gold-600",
};

function Compose({ trigger, triggerClass, type }: { trigger: React.ReactNode; triggerClass?: string; type?: string }) {
  return (
    <FormDialog title="New Message" action={sendCommunication} submitLabel="Send Message" trigger={trigger} triggerClass={triggerClass}>
      <input type="hidden" name="type" defaultValue={type ?? "Announcement"} />
      <div><label className={labelClass}>Audience</label><select name="audience" className={fieldClass}><option>All Parents</option><option>Pending Fees</option><option>Low Attendance</option><option>Specific Batch</option></select></div>
      <div><label className={labelClass}>Channel</label><select name="channel" className={fieldClass}><option>WhatsApp</option><option>SMS</option><option>Email</option></select></div>
      <div><label className={labelClass}>Message</label><textarea name="message" rows={4} placeholder="Type your message… Use {name} to personalise." className={fieldClass} /></div>
    </FormDialog>
  );
}

export default async function CommunicationsPage() {
  const comms = await getCommunications();
  const total = comms.length;
  const pct = (ch: string) => (total ? Math.round((comms.filter((c) => c.channel === ch).length / total) * 100) : 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Communications</h1>
          <p className="text-ink/50 text-sm mt-1">Send announcements, fee reminders &amp; class updates.</p>
        </div>
        <Compose trigger={<><span className="text-gold-400">+</span> New Message</>} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <div className="bg-white rounded-4xl p-6 shadow-card">
            <h3 className="text-sm font-bold mb-4">Quick Templates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Compose type="Fee Reminder" triggerClass="text-left p-4 bg-cream rounded-2xl hover:bg-sand transition w-full" trigger={<><span className="text-xl">💸</span><p className="text-sm font-bold mt-2">Fee Reminder</p><p className="text-xs text-ink/50 mt-1">To pending students</p></>} />
              <Compose type="Class Cancelled" triggerClass="text-left p-4 bg-cream rounded-2xl hover:bg-sand transition w-full" trigger={<><span className="text-xl">🚫</span><p className="text-sm font-bold mt-2">Class Cancelled</p><p className="text-xs text-ink/50 mt-1">Notify a batch</p></>} />
              <Compose type="Event Invite" triggerClass="text-left p-4 bg-cream rounded-2xl hover:bg-sand transition w-full" trigger={<><span className="text-xl">🎉</span><p className="text-sm font-bold mt-2">Event Invite</p><p className="text-xs text-ink/50 mt-1">Recital / showcase</p></>} />
            </div>
          </div>

          <div className="bg-white rounded-4xl shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5"><h3 className="text-sm font-bold">Sent History</h3></div>
            <table className="w-full text-sm">
              <thead className="bg-cream"><tr className="text-left text-[11px] text-ink/45 uppercase font-bold tracking-wide"><th className="px-5 py-3">Date</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Audience</th><th className="px-5 py-3">Channel</th><th className="px-5 py-3">Status</th></tr></thead>
              <tbody className="divide-y divide-black/5">
                {comms.length ? comms.map((c) => (
                  <tr key={c.id} className="hover:bg-cream transition">
                    <td className="px-5 py-4 text-ink/50">{shortDate(c.sent_at.slice(0, 10))}</td>
                    <td className="px-5 py-4 font-bold">{c.type}</td>
                    <td className="px-5 py-4 text-ink/60">{c.audience}</td>
                    <td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${channelChip[c.channel] ?? "bg-cream"}`}>{c.channel}</span></td>
                    <td className="px-5 py-4 text-xs font-bold text-ink/60">{c.status}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="px-5 py-6 text-center text-sm text-ink/40">No messages sent yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-ink text-white rounded-4xl p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-white/60">Messages Sent</p>
            <p className="text-4xl font-extrabold mt-2">{total}</p>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-white/60">WhatsApp</span><span className="font-bold text-gold-400">{pct("WhatsApp")}%</span></div>
              <div className="flex justify-between"><span className="text-white/60">SMS</span><span className="font-bold">{pct("SMS")}%</span></div>
              <div className="flex justify-between"><span className="text-white/60">Email</span><span className="font-bold">{pct("Email")}%</span></div>
            </div>
          </div>
          <div className="bg-white rounded-4xl p-6 shadow-card">
            <h3 className="text-sm font-bold mb-3">Audience Segments</h3>
            <div className="space-y-2">
              <Compose triggerClass="w-full flex items-center justify-between p-3 bg-cream rounded-2xl hover:bg-sand transition" trigger={<><span className="text-sm font-semibold">All Parents</span><span className="text-xs font-bold text-ink/50">→</span></>} />
              <Compose type="Fee Reminder" triggerClass="w-full flex items-center justify-between p-3 bg-cream rounded-2xl hover:bg-sand transition" trigger={<><span className="text-sm font-semibold">Pending Fees</span><span className="text-xs font-bold text-gold-600">→</span></>} />
              <Compose triggerClass="w-full flex items-center justify-between p-3 bg-cream rounded-2xl hover:bg-sand transition" trigger={<><span className="text-sm font-semibold">Low Attendance</span><span className="text-xs font-bold text-rose-600">→</span></>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

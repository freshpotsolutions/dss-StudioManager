# Studio Manager — Next.js + Supabase

Admin dashboard for a Dance & Art studio (Sharjah, UAE). Rebuilt from the
single-file prototype as a **Next.js 16 (App Router)** app backed by
**Supabase** (Postgres + Auth), styled with the warm-light "Crextio" theme.

## Features
- **Auth** — email/password login (Supabase Auth), all routes gated by `proxy.ts`.
- **Students** + profile with **attendance calendar**, **session packs** (8 × 1 hr, configurable), pack-completion popup, and **batch transfer that carries attendance forward**.
- **Attendance** — per-batch marking, rate-by-batch, at-risk students.
- **Fees** — record payments, pending dues, renewals.
- **Batches** (per-batch sessions + hours config), **Courses**, **Teachers**, **Weekly Schedule**.
- **Leads & Trials** (Kanban) and **Communications** (announcements log).

## Tech
Next.js 16 · React 19 · TypeScript · Tailwind v3 · `@supabase/ssr` · Chart.js.

---

## 1. Create the Supabase project
1. Go to <https://supabase.com> → **New project**. Note the project ref.
2. **Project Settings → API**: copy the **Project URL** and the **anon / public** key.

## 2. Create the schema + seed data
In the Supabase dashboard → **SQL Editor**, run (in order):
1. Paste the contents of `supabase/migrations/0001_init.sql` and run it.
2. *(optional demo data)* Paste `supabase/seed.sql` and run it.

> Prefer the CLI? With Docker running: `supabase link --project-ref <ref>` then
> `supabase db push` for migrations, and paste the seed file in the SQL editor.

## 3. Create an admin user
Supabase dashboard → **Authentication → Users → Add user** → enter an email +
password and tick **Auto Confirm**. (A staff `profiles` row is created
automatically by the `on_auth_user_created` trigger.)

## 4. Configure environment
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-public-key>
```

## 5. Run locally
```bash
npm install
npm run dev
```
Open <http://localhost:3000> → you'll be redirected to `/login`. Sign in with
the admin user from step 3.

---

## Deploy to Vercel
1. Push this `studio-app` folder to a Git repo (GitHub/GitLab).
2. On <https://vercel.com> → **Add New → Project** → import the repo.
   - If the repo root is the parent folder, set **Root Directory = `studio-app`**.
3. Add both environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) under **Project → Settings → Environment Variables**.
4. Deploy.
5. In Supabase → **Authentication → URL Configuration**, set the **Site URL** to
   your Vercel domain (and add it to redirect URLs).

CLI alternative: `npm i -g vercel && vercel` from this folder, then add env vars
with `vercel env add`.

---

## Project map
```
app/(app)/            Protected pages (dashboard, students, attendance, fees, …)
app/(app)/actions.ts  Server Actions (attendance, transfer, payments, add records)
app/login/            Login page + sign-in action
lib/supabase/         Browser + server clients, proxy session refresh
lib/queries.ts        Server-side data fetching (Supabase nested selects)
lib/ui.ts             Session-pack math + theme tokens
components/           Sidebar, Charts, Calendar, AttendancePanel, TransferButton, FormDialog
supabase/             SQL migration + seed
proxy.ts              Auth gate (Next 16 renamed `middleware` → `proxy`)
```

## Notes
- **RLS**: any authenticated staff user has full access to business tables.
  Tighten with per-role policies later if you add non-admin roles.
- The anon/public key is safe to expose in the browser **because RLS is on** —
  unauthenticated requests are blocked by policy.
- Dates in the seed data are May 2026 to match the original prototype demo.

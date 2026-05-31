-- ============================================================================
-- Studio Manager — schema for a Dance & Art studio (Supabase / Postgres)
-- Models the prototype: courses, teachers, batches (each with its own session
-- pack size + hours), students, enrollments (= a session pack), attendance
-- (records the batch it happened in so it carries forward on transfer),
-- payments, leads, and communications.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Staff profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Courses (art forms)
-- ---------------------------------------------------------------------------
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  name        text not null,
  description text,
  icon        text default '🎨',
  color       text default 'plum',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Teachers
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  id             uuid primary key default gen_random_uuid(),
  code           text unique not null,
  name           text not null,
  specialization text,
  phone          text,
  email          text,
  color          text default 'plum',
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Batches — each defines its own pack: sessions_total x hours_per_session
-- ---------------------------------------------------------------------------
create table if not exists public.batches (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,
  name              text not null,
  course_id         uuid references public.courses(id) on delete set null,
  teacher_id        uuid references public.teachers(id) on delete set null,
  days              text[] not null default '{}',
  time_label        text,                         -- e.g. "9:00–10:00 AM"
  clock             text,                         -- e.g. "9:00 AM" (used when recording attendance)
  sessions_total    int  not null default 8 check (sessions_total >= 1),
  hours_per_session numeric not null default 1,
  fee               numeric not null default 0,
  capacity          int default 20,
  color             text default 'plum',
  start_date        date,
  end_date          date,
  status            text not null default 'active' check (status in ('active','completed','archived')),
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Students
-- ---------------------------------------------------------------------------
create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  code          text unique not null,
  name          text not null,
  email         text,
  phone         text,
  parent_name   text,
  parent_phone  text,
  relationship  text,
  color         text default 'plum',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enrollments — a session pack for a student in a batch.
-- batch_id may change on transfer; attendance rows keep the batch they happened
-- in, so completed sessions carry forward.
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  batch_id    uuid not null references public.batches(id) on delete cascade,
  fee         numeric not null default 0,
  paid        boolean not null default false,
  notified    boolean not null default false,   -- completion popup already shown
  status      text not null default 'active' check (status in ('active','completed','dropped')),
  created_at  timestamptz not null default now()
);

create index if not exists enrollments_student_idx on public.enrollments(student_id);
create index if not exists enrollments_batch_idx on public.enrollments(batch_id);

-- ---------------------------------------------------------------------------
-- Attendance — one row per student per session.
-- ---------------------------------------------------------------------------
create table if not exists public.attendance (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  batch_id      uuid not null references public.batches(id) on delete cascade,
  session_date  date not null,
  session_time  text,
  status        text not null default 'present' check (status in ('present','absent','late')),
  created_at    timestamptz not null default now(),
  unique (enrollment_id, session_date, batch_id)
);

create index if not exists attendance_enrollment_idx on public.attendance(enrollment_id);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id            uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments(id) on delete set null,
  student_id    uuid not null references public.students(id) on delete cascade,
  amount        numeric not null,
  method        text not null default 'Cash',
  paid_on       date not null default current_date,
  receipt_no    text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leads & trials
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  interest    text,
  source      text default 'Walk-in',
  stage       text not null default 'new' check (stage in ('new','trial_booked','attended','enrolled')),
  trial_date  date,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Communications log
-- ---------------------------------------------------------------------------
create table if not exists public.communications (
  id        uuid primary key default gen_random_uuid(),
  type      text,
  audience  text,
  channel   text not null default 'WhatsApp' check (channel in ('WhatsApp','SMS','Email')),
  message   text,
  status    text default 'sent',
  sent_at   timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — internal staff tool: any authenticated user has full
-- access to business data. Tighten later with per-role policies if needed.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.teachers       enable row level security;
alter table public.batches        enable row level security;
alter table public.students       enable row level security;
alter table public.enrollments    enable row level security;
alter table public.attendance     enable row level security;
alter table public.payments       enable row level security;
alter table public.leads          enable row level security;
alter table public.communications enable row level security;

-- Profiles: a user can see all staff and edit their own row.
create policy "profiles readable by staff" on public.profiles
  for select to authenticated using (true);
create policy "update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Business tables: authenticated staff can do everything.
do $$
declare t text;
begin
  foreach t in array array[
    'courses','teachers','batches','students','enrollments',
    'attendance','payments','leads','communications'
  ]
  loop
    execute format($f$
      create policy "staff full access" on public.%I
        for all to authenticated using (true) with check (true);
    $f$, t);
  end loop;
end $$;

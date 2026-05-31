-- ============================================================================
-- Seed data — mirrors the prototype demo (safe to run on an empty schema).
-- ============================================================================

-- Courses --------------------------------------------------------------------
insert into public.courses (code, name, description, icon, color) values
  ('CS1001','Classical Dance','Classical and contemporary dance forms.','💃','plum'),
  ('CS1002','Contemporary','Modern and contemporary dance.','🩰','rose'),
  ('CS1003','Fine Arts','Painting, drawing, and visual arts.','🎨','blue'),
  ('CS1004','Vocal Music','Instrumental and vocal music training.','🎵','green'),
  ('CS1005','Keyboard','Keyboard and piano lessons.','🎹','gold')
on conflict (code) do nothing;

-- Teachers -------------------------------------------------------------------
insert into public.teachers (code, name, specialization, phone, email, color) values
  ('TR1001','Priya Nair','Classical Dance Specialist','+971 50 111 2222','priya@email.com','plum'),
  ('TR1002','Sara Al Mansoori','Fine Arts Specialist','+971 50 333 3333','sara@email.com','blue'),
  ('TR1003','Rajan Kumar','Vocal Music Specialist','+971 50 555 5555','rajan@email.com','green')
on conflict (code) do nothing;

-- Batches --------------------------------------------------------------------
insert into public.batches (code, name, course_id, teacher_id, days, time_label, clock, sessions_total, hours_per_session, fee, capacity, color, start_date, end_date)
values
  ('B1','Batch 1',
     (select id from public.courses where code='CS1001'),
     (select id from public.teachers where code='TR1001'),
     '{Mon,Wed,Sat}','9:00–10:00 AM','9:00 AM',8,1,1200,20,'plum','2026-01-01','2026-06-30'),
  ('B2','Batch 2',
     (select id from public.courses where code='CS1003'),
     (select id from public.teachers where code='TR1002'),
     '{Wed,Fri}','3:00–4:30 PM','3:00 PM',8,1.5,1500,15,'blue','2026-02-15','2026-08-15'),
  ('B3','Batch 1',
     (select id from public.courses where code='CS1004'),
     (select id from public.teachers where code='TR1003'),
     '{Tue,Thu,Sat}','6:00–7:00 PM','6:00 PM',8,1,1500,12,'green','2026-03-01','2026-08-31')
on conflict (code) do nothing;

-- Students -------------------------------------------------------------------
insert into public.students (code, name, email, phone, parent_name, parent_phone, relationship, color) values
  ('ST1001','Fatima Al Rashid','fatima@email.com','+971 50 111 1111','Ahmed Al Rashid','+971 50 999 0001','Father','plum'),
  ('ST1002','Ahmed Mansouri','ahmed@email.com','+971 50 222 2222','Mohammed Al Mansouri','+971 50 333 3333','Father','blue'),
  ('ST1003','Noor Al Mazrouei','noor@email.com','+971 50 444 4444','Salem Al Mazrouei','+971 50 444 0000','Father','green')
on conflict (code) do nothing;

-- Enrollments (session packs) + attendance + payments ------------------------
do $$
declare
  b1 uuid := (select id from public.batches where code='B1');
  b2 uuid := (select id from public.batches where code='B2');
  st_fatima uuid := (select id from public.students where code='ST1001');
  st_ahmed  uuid := (select id from public.students where code='ST1002');
  st_noor   uuid := (select id from public.students where code='ST1003');
  en_ahmed_b1 uuid; en_ahmed_b2 uuid; en_fatima_b1 uuid; en_noor_b1 uuid;
begin
  -- skip if already seeded
  if exists (select 1 from public.enrollments limit 1) then return; end if;

  insert into public.enrollments (student_id, batch_id, fee, paid, notified)
    values (st_ahmed, b1, 1200, false, false) returning id into en_ahmed_b1;
  insert into public.enrollments (student_id, batch_id, fee, paid, notified)
    values (st_ahmed, b2, 1500, true, false) returning id into en_ahmed_b2;
  insert into public.enrollments (student_id, batch_id, fee, paid, notified)
    values (st_fatima, b1, 1200, true, true) returning id into en_fatima_b1;
  insert into public.enrollments (student_id, batch_id, fee, paid, notified)
    values (st_noor, b1, 1200, false, false) returning id into en_noor_b1;

  -- Ahmed / Classical Dance B1 — 7 of 8 (one away from completion)
  insert into public.attendance (enrollment_id, batch_id, session_date, session_time, status) values
    (en_ahmed_b1, b1, '2026-05-02','9:00 AM','present'),
    (en_ahmed_b1, b1, '2026-05-04','9:00 AM','present'),
    (en_ahmed_b1, b1, '2026-05-06','9:00 AM','present'),
    (en_ahmed_b1, b1, '2026-05-09','9:00 AM','late'),
    (en_ahmed_b1, b1, '2026-05-11','9:00 AM','present'),
    (en_ahmed_b1, b1, '2026-05-13','9:00 AM','present'),
    (en_ahmed_b1, b1, '2026-05-16','9:00 AM','present');

  -- Ahmed / Fine Arts B2 — 3 of 8
  insert into public.attendance (enrollment_id, batch_id, session_date, session_time, status) values
    (en_ahmed_b2, b2, '2026-05-01','3:00 PM','present'),
    (en_ahmed_b2, b2, '2026-05-06','3:00 PM','present'),
    (en_ahmed_b2, b2, '2026-05-08','3:00 PM','present');

  -- Fatima / Classical Dance B1 — 8 of 8 (pack complete)
  insert into public.attendance (enrollment_id, batch_id, session_date, session_time, status) values
    (en_fatima_b1, b1, '2026-05-02','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-04','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-06','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-09','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-11','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-13','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-16','9:00 AM','present'),
    (en_fatima_b1, b1, '2026-05-18','9:00 AM','present');

  -- Noor / Classical Dance B1 — 2 of 8 (one absent)
  insert into public.attendance (enrollment_id, batch_id, session_date, session_time, status) values
    (en_noor_b1, b1, '2026-05-02','9:00 AM','present'),
    (en_noor_b1, b1, '2026-05-06','9:00 AM','absent'),
    (en_noor_b1, b1, '2026-05-09','9:00 AM','present');

  -- Payments
  insert into public.payments (enrollment_id, student_id, amount, method, paid_on, receipt_no) values
    (en_fatima_b1, st_fatima, 1500, 'Bank Transfer','2026-05-08','RCP-2026-05-001'),
    (en_ahmed_b2,  st_ahmed,   500, 'Bank Transfer','2026-05-08','RCP-2026-05-002');
end $$;

-- Leads ----------------------------------------------------------------------
insert into public.leads (name, phone, interest, source, stage, trial_date) values
  ('Hessa Al Suwaidi','+971 50 777 8888','Classical Dance','Instagram','new',null),
  ('Omar Khalid','+971 55 333 1212','Keyboard','Walk-in','new',null),
  ('Aisha Rahman','+971 52 909 0909','Fine Arts','Referral','new',null),
  ('Maryam Saeed','+971 50 121 2121','Contemporary','Website','trial_booked','2026-05-14'),
  ('Khalid Bin Zayed','+971 55 808 0808','Vocal Music','Google','trial_booked','2026-05-16'),
  ('Sara Ibrahim','+971 52 100 2000','Classical Dance','Walk-in','attended',null),
  ('Tariq Hassan','+971 50 300 4000','Keyboard','Instagram','attended',null),
  ('Latifa Al Ali','+971 55 600 7000','Fine Arts','Referral','enrolled',null),
  ('Bilal Ahmed','+971 52 500 6000','Classical Dance','Walk-in','enrolled',null);

-- Communications -------------------------------------------------------------
insert into public.communications (type, audience, channel, message, status, sent_at) values
  ('Fee Reminder','12 parents','WhatsApp','Gentle reminder: fees are due this week.','Delivered 12/12','2026-05-08'),
  ('Class Cancelled','Keyboard B2','SMS','Today''s Keyboard class is cancelled.','Delivered 8/8','2026-05-05'),
  ('Recital Invite','All students','Email','You are invited to our annual recital!','Opened 96/148','2026-05-01');

export type Color = "plum" | "blue" | "green" | "rose" | "gold";

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: Color;
  created_at: string;
}

export interface Teacher {
  id: string;
  code: string;
  name: string;
  specialization: string | null;
  phone: string | null;
  email: string | null;
  color: Color;
  created_at: string;
}

export interface Batch {
  id: string;
  code: string;
  name: string;
  course_id: string | null;
  teacher_id: string | null;
  days: string[];
  time_label: string | null;
  clock: string | null;
  sessions_total: number;
  hours_per_session: number;
  fee: number;
  capacity: number | null;
  color: Color;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  // optional joined relations
  course?: Course | null;
  teacher?: Teacher | null;
}

export interface Student {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  relationship: string | null;
  color: Color;
  created_at: string;
}

export interface Attendance {
  id: string;
  enrollment_id: string;
  batch_id: string;
  session_date: string;
  session_time: string | null;
  status: "present" | "absent" | "late";
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  batch_id: string;
  fee: number;
  paid: boolean;
  notified: boolean;
  status: string;
  created_at: string;
  batch?: Batch | null;
  attendance?: Attendance[];
}

export interface Payment {
  id: string;
  enrollment_id: string | null;
  student_id: string;
  amount: number;
  method: string;
  paid_on: string;
  receipt_no: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  interest: string | null;
  source: string | null;
  stage: "new" | "trial_booked" | "attended" | "enrolled";
  trial_date: string | null;
  created_at: string;
}

export interface Communication {
  id: string;
  type: string | null;
  audience: string | null;
  channel: "WhatsApp" | "SMS" | "Email";
  message: string | null;
  status: string | null;
  sent_at: string;
}

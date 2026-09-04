export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  groupId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD (hansı gün və ay ödənilib)
  forMonth: string; // YYYY-MM (hansı ayın ödənişidir, məs: 2026-09)
  note?: string;
  paymentMethod?: 'cash' | 'card' | 'm10' | 'other';
  createdAt: string;
}

export type NoteCategory = 'academic' | 'behavioral' | 'general';

export interface StudentNote {
  id: string;
  studentId: string;
  category: NoteCategory;
  content: string;
  createdAt: string; // ISO date string or YYYY-MM-DD HH:mm
}

export interface Student {
  id: string;
  groupId: string;
  name: string;
  phone?: string;
  monthlyFee: number;
  notes?: string;
  enrollmentDate?: string; // YYYY-MM-DD (Kursa qeydiyyat olunduğu gün və ay)
  paymentDueDay?: number; // 1-31 (Hər ay üçün ödənişin son günü)
  createdAt: string;
}

export type PaymentDueStatus = 'paid' | 'due' | 'due_soon' | 'overdue';

export interface Group {
  id: string;
  name: string;
  subject?: string;
  schedule?: string;
  defaultMonthlyFee?: number;
  createdAt: string;
}

export type ActiveTab = 'students_payments' | 'attendance' | 'payment_history';

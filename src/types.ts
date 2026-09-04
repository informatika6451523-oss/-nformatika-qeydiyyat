export type ActiveTab = 'students_payments' | 'attendance' | 'payment_history';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type NoteCategory = 'general' | 'academic' | 'payment' | 'behavior';

export interface Student {
  id: string;
  groupId: string;
  name: string;
  phone?: string;
  parentPhone?: string;
  monthlyFee: number;
  enrollmentDate?: string; // YYYY-MM-DD (Kursa qeydiyyat tarixi)
  paymentDueDay?: number; // 1-31 (Ödəniş günü)
  paymentDayOfMonth?: number; // 1-31 (Ödəniş günü)
  notes?: string;
  createdAt?: string;
}

export interface Group {
  id: string;
  name: string;
  subject?: string;
  defaultMonthlyFee?: number;
  scheduleDays?: string[];
  scheduleTime?: string;
  createdAt?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  groupId: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  forMonth: string; // YYYY-MM
  note?: string;
  receiptNumber?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  groupId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  note?: string;
}

export interface StudentNote {
  id: string;
  studentId: string;
  content: string;
  category: NoteCategory;
  date?: string;
  createdAt?: string;
}

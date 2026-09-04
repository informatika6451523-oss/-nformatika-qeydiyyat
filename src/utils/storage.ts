import { Group, Student, PaymentRecord, AttendanceRecord, StudentNote } from '../types';
import { getCurrentMonthString, getTodayDateString } from './dateUtils';

const STORAGE_KEY = 'repetitor_journal_v2';

export interface AppData {
  groups: Group[];
  students: Student[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  notes: StudentNote[];
}

const DEFAULT_DATA: AppData = {
  groups: [],
  students: [],
  payments: [],
  attendance: [],
  notes: [],
};

const MOCK_STUDENT_IDS = ['s-1', 's-2', 's-3', 's-4', 's-5'];
const MOCK_GROUP_IDS = ['g-1', 'g-2'];

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    const students: Student[] = (parsed.students || [])
      .filter((s: any) => !MOCK_STUDENT_IDS.includes(s.id))
      .map((s: any) => ({
        ...s,
        enrollmentDate: s.enrollmentDate || s.createdAt || '2026-09-01',
        paymentDueDay: s.paymentDueDay || 5,
      }));

    const groups: Group[] = (parsed.groups || []).filter(
      (g: any) => !MOCK_GROUP_IDS.includes(g.id)
    );

    return {
      groups,
      students,
      payments: (parsed.payments || []).filter((p: any) => !MOCK_STUDENT_IDS.includes(p.studentId)),
      attendance: (parsed.attendance || []).filter((a: any) => !MOCK_STUDENT_IDS.includes(a.studentId)),
      notes: (parsed.notes || []).filter((n: any) => !MOCK_STUDENT_IDS.includes(n.studentId)),
    };
  } catch (err) {
    console.error('Failed to load storage data:', err);
    return DEFAULT_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

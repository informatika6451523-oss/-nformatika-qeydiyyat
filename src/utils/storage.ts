import { Group, Student, PaymentRecord, AttendanceRecord, StudentNote } from '../types';
import { getCurrentMonthString, getTodayDateString } from './dateUtils';

export interface AppData {
  groups: Group[];
  students: Student[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  notes: StudentNote[];
}

const STORAGE_KEY = 'muellim_jurnal_app_data_v2';

const defaultGroups: Group[] = [
  {
    id: 'grp_1',
    name: 'Qrup A - İnformatika (Abituriyent)',
    subject: 'İnformatika',
    defaultMonthlyFee: 80,
    scheduleDays: ['B.e', 'Ç.a', 'Cümə'],
    scheduleTime: '15:00 - 16:30',
    createdAt: '2026-08-15',
  },
  {
    id: 'grp_2',
    name: 'Qrup B - Riyaziyyat (9-cu sinif)',
    subject: 'Riyaziyyat',
    defaultMonthlyFee: 70,
    scheduleDays: ['Çərşənbə', 'Şənbə'],
    scheduleTime: '11:00 - 12:30',
    createdAt: '2026-08-20',
  },
];

const defaultStudents: Student[] = [
  {
    id: 'std_1',
    groupId: 'grp_1',
    name: 'Rauf Əliyev',
    phone: '+994 50 123 45 67',
    parentPhone: '+994 55 987 65 43',
    monthlyFee: 80,
    enrollmentDate: '2026-08-19',
    paymentDayOfMonth: 19,
    notes: 'Dərslərə həmişə vaxtında gəlir, Python mövzularını yaxşı mənimsəyir.',
    createdAt: '2026-08-19',
  },
  {
    id: 'std_2',
    groupId: 'grp_1',
    name: 'Nərgiz Məmmədova',
    phone: '+994 51 345 67 89',
    parentPhone: '+994 70 876 54 32',
    monthlyFee: 80,
    enrollmentDate: '2026-08-25',
    paymentDayOfMonth: 25,
    notes: 'Qaydalara diqqətlidir, layihə tapşırıqlarını vaxtında təhvil verir.',
    createdAt: '2026-08-25',
  },
  {
    id: 'std_3',
    groupId: 'grp_1',
    name: 'Murad Quliyev',
    phone: '+994 77 456 78 90',
    parentPhone: '+994 50 765 43 21',
    monthlyFee: 80,
    enrollmentDate: '2026-09-01',
    paymentDayOfMonth: 1,
    notes: 'Baza anlayışları üzərində işləməli.',
    createdAt: '2026-09-01',
  },
  {
    id: 'std_4',
    groupId: 'grp_2',
    name: 'Aysel Kərimova',
    phone: '+994 55 567 89 01',
    parentPhone: '+994 50 654 32 10',
    monthlyFee: 70,
    enrollmentDate: '2026-08-10',
    paymentDayOfMonth: 10,
    notes: 'Riyaziyyat testlərində ən yüksək nəticə göstərənlərdəndir.',
    createdAt: '2026-08-10',
  },
];

const defaultPayments: PaymentRecord[] = [
  {
    id: 'pay_1',
    studentId: 'std_1',
    groupId: 'grp_1',
    amount: 80,
    paymentDate: getTodayDateString(),
    forMonth: getCurrentMonthString(),
    note: 'Nağd ödənildi',
    receiptNumber: 'QBZ-1001',
    createdAt: getTodayDateString(),
  },
];

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        groups: Array.isArray(parsed.groups) ? parsed.groups : defaultGroups,
        students: Array.isArray(parsed.students) ? parsed.students : defaultStudents,
        payments: Array.isArray(parsed.payments) ? parsed.payments : defaultPayments,
        attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
    }
  } catch (err) {
    console.error('LocalStorage oxuma xətası:', err);
  }

  return {
    groups: defaultGroups,
    students: defaultStudents,
    payments: defaultPayments,
    attendance: [],
    notes: [],
  };
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage yazma xətası:', err);
  }
}

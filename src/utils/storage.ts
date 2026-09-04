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
  groups: [
    {
      id: 'g-1',
      name: 'Qrup 1 (Həftəiçi)',
      subject: 'Riyaziyyat',
      schedule: 'B.e / Çər / Cüm 15:00',
      defaultMonthlyFee: 80,
      createdAt: '2026-09-01',
    },
    {
      id: 'g-2',
      name: 'Qrup 2 (Həftəsonu)',
      subject: 'İngilis dili',
      schedule: 'Şən / Baz 11:00',
      defaultMonthlyFee: 90,
      createdAt: '2026-09-01',
    }
  ],
  students: [
    {
      id: 's-1',
      groupId: 'g-1',
      name: 'Əli Məmmədov',
      phone: '050 123 45 67',
      monthlyFee: 80,
      notes: '9-cu sinif',
      enrollmentDate: '2026-08-15',
      paymentDueDay: 5,
      createdAt: '2026-08-15',
    },
    {
      id: 's-2',
      groupId: 'g-1',
      name: 'Aysel Quliyeva',
      phone: '055 987 65 43',
      monthlyFee: 80,
      notes: 'Olimpiadaya hazırlaşır',
      enrollmentDate: '2026-09-01',
      paymentDueDay: 5,
      createdAt: '2026-09-01',
    },
    {
      id: 's-3',
      groupId: 'g-1',
      name: 'Murad Əliyev',
      phone: '070 333 22 11',
      monthlyFee: 80,
      notes: '',
      enrollmentDate: '2026-08-01', // 33 days ago, 0 payments -> 3 days overdue on 30-day cycle
      paymentDueDay: 5,
      createdAt: '2026-08-01',
    },
    {
      id: 's-4',
      groupId: 'g-2',
      name: 'Nigar İsmayılova',
      phone: '051 444 55 66',
      monthlyFee: 90,
      notes: 'IELTS hazırlıq',
      enrollmentDate: '2026-08-20',
      paymentDueDay: 20,
      createdAt: '2026-08-20',
    },
    {
      id: 's-5',
      groupId: 'g-1',
      name: 'Rəşad Qasımov',
      phone: '055 777 88 99',
      monthlyFee: 85,
      notes: 'Buraxılış imtahanına hazırlıq',
      enrollmentDate: '2026-07-20', // 45 days ago, paid on 2026-07-22 -> 13 days overdue for cycle 2
      paymentDueDay: 20,
      createdAt: '2026-07-20',
    }
  ],
  payments: [
    {
      id: 'p-1',
      studentId: 's-1',
      groupId: 'g-1',
      amount: 80,
      paymentDate: '2026-09-02',
      forMonth: '2026-09',
      paymentMethod: 'card',
      note: 'M10 ilə ödənildi',
      createdAt: '2026-09-02T10:30:00Z',
    },
    {
      id: 'p-2',
      studentId: 's-2',
      groupId: 'g-1',
      amount: 80,
      paymentDate: '2026-09-03',
      forMonth: '2026-09',
      paymentMethod: 'cash',
      note: 'Dərsdə nağd verdi',
      createdAt: '2026-09-03T15:00:00Z',
    },
    {
      id: 'p-3',
      studentId: 's-5',
      groupId: 'g-1',
      amount: 85,
      paymentDate: '2026-07-22',
      forMonth: '2026-07',
      paymentMethod: 'cash',
      note: 'İlk ayın ödənişi',
      createdAt: '2026-07-22T12:00:00Z',
    }
  ],
  attendance: [
    {
      id: 'a-1',
      studentId: 's-1',
      groupId: 'g-1',
      date: '2026-09-01',
      status: 'present',
    },
    {
      id: 'a-2',
      studentId: 's-2',
      groupId: 'g-1',
      date: '2026-09-01',
      status: 'present',
    },
    {
      id: 'a-3',
      studentId: 's-3',
      groupId: 'g-1',
      date: '2026-09-01',
      status: 'absent',
      note: 'Xəstələnib',
    }
  ],
  notes: [
    {
      id: 'note-1',
      studentId: 's-1',
      category: 'academic',
      content: 'Cəbr mövzularında kvadrat tənlikləri çox yaxşı mənimsəyib. Həndəsə fiqurlarını təkrar etmək lazımdır.',
      createdAt: '2026-09-01 16:30',
    },
    {
      id: 'note-2',
      studentId: 's-1',
      category: 'behavioral',
      content: 'Dərsdə çox aktiv və diqqətlidir, ev tapşırıqlarını səliqəli yerinə yetirir.',
      createdAt: '2026-09-02 17:00',
    },
    {
      id: 'note-3',
      studentId: 's-3',
      category: 'general',
      content: 'Valideynlə danışıldı. Həftəiçi əlavə sınaq imtahanı qeyd ediləcək.',
      createdAt: '2026-09-02 18:15',
    }
  ]
};

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppData(DEFAULT_DATA);
      return DEFAULT_DATA;
    }
    const parsed = JSON.parse(raw);
    const students: Student[] = (parsed.students || []).map((s: any) => ({
      ...s,
      enrollmentDate: s.enrollmentDate || s.createdAt || '2026-09-01',
      paymentDueDay: s.paymentDueDay || 5,
    }));

    return {
      groups: parsed.groups || [],
      students,
      payments: parsed.payments || [],
      attendance: parsed.attendance || [],
      notes: parsed.notes || [],
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

import { Group, Student, PaymentRecord, AttendanceRecord, StudentNote } from '../types';
import { getCurrentMonthString, getTodayDateString } from './dateUtils';

export interface AppData {
  groups: Group[];
  students: Student[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
  notes: StudentNote[];
}

const PRIMARY_STORAGE_KEY = 'muellim_jurnal_app_data_v2';
const FALLBACK_KEYS = [
  'muellim_jurnal_app_data',
  'muellim_jurnal_app_data_v1',
  'muellim_jurnal_backup_latest',
  'teacher_journal_app_data',
  'teacher_journal_data',
  'muellim_jurnali_data',
  'muellim_jurnal',
  'teacher_journal',
  'journal_app_data',
];

export interface RecoverableBackup {
  key: string;
  sourceLabel: string;
  timestamp?: string;
  groupCount: number;
  studentCount: number;
  studentNames: string[];
  data: AppData;
}

export function isDefaultDataset(data: Partial<AppData>): boolean {
  if (!data.students || data.students.length === 0) return false;
  if (data.students.length === 4) {
    const defaultIds = ['std_1', 'std_2', 'std_3', 'std_4'];
    const allMatch = data.students.every((s) => defaultIds.includes(s.id));
    if (allMatch) return true;
  }
  return false;
}

function parseAppData(raw: string): AppData | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.groups) || Array.isArray(parsed.students)) {
        return {
          groups: Array.isArray(parsed.groups) ? parsed.groups : [],
          students: Array.isArray(parsed.students) ? parsed.students : [],
          payments: Array.isArray(parsed.payments) ? parsed.payments : [],
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
}

export function getRecoverableBackups(): RecoverableBackup[] {
  const backups: RecoverableBackup[] = [];
  const scannedKeys = new Set<string>();

  const checkKey = (key: string, label: string) => {
    if (scannedKeys.has(key)) return;
    scannedKeys.add(key);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = parseAppData(raw);
      if (parsed && (parsed.students.length > 0 || parsed.groups.length > 0)) {
        backups.push({
          key,
          sourceLabel: label,
          groupCount: parsed.groups.length,
          studentCount: parsed.students.length,
          studentNames: parsed.students.map((s) => s.name).slice(0, 5),
          data: parsed,
        });
      }
    } catch (err) {
      console.warn(`Açar oxunarkən xəta (${key}):`, err);
    }
  };

  // Check all known keys
  FALLBACK_KEYS.forEach((k) => checkKey(k, 'Əvvəlki yaddaş açarı'));
  checkKey(PRIMARY_STORAGE_KEY, 'Cari yaddaş');

  // Also scan any other keys in localStorage that look like teacher journal data
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && !scannedKeys.has(k)) {
        checkKey(k, 'Brauzer ehtiyat yaddaşı');
      }
    }
  } catch (err) {
    console.warn('LocalStorage skan xətası:', err);
  }

  return backups;
}

export function loadAppData(): AppData {
  try {
    // 1. Try reading the primary storage key first
    const primaryRaw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    let primaryData: AppData | null = null;
    if (primaryRaw) {
      primaryData = parseAppData(primaryRaw);
    }

    // If primary key has user-created data (not just demo data), use it!
    if (primaryData && !isDefaultDataset(primaryData) && (primaryData.students.length > 0 || primaryData.groups.length > 0)) {
      return primaryData;
    }

    // 2. If primary key is missing or ONLY contains default demo data:
    // Let's search all fallback and other keys to find the user's real data!
    for (const key of FALLBACK_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = parseAppData(raw);
        if (parsed && !isDefaultDataset(parsed) && (parsed.students.length > 0 || parsed.groups.length > 0)) {
          console.log(`Köhnə məlumatlar ${key} açarından bərpa edildi!`);
          // Automatically save it into primary key so it's restored permanently
          saveAppData(parsed);
          return parsed;
        }
      }
    }

    // 3. If primary key exists (even if demo), return it
    if (primaryData) {
      return primaryData;
    }
  } catch (err) {
    console.error('LocalStorage oxuma xətası:', err);
  }

  // 4. Default seed data if completely new setup
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
    const serialized = JSON.stringify(data);
    localStorage.setItem(PRIMARY_STORAGE_KEY, serialized);
    // Also mirror to legacy keys and backup key so old data is never lost again
    localStorage.setItem('muellim_jurnal_app_data', serialized);
    localStorage.setItem('muellim_jurnal_backup_latest', serialized);
  } catch (err) {
    console.error('LocalStorage yazma xətası:', err);
  }
}

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


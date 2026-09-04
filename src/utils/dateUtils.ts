import { Student } from '../types';

export const AZ_MONTH_NAMES = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMonthName(monthStr: string): string {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTH_NAMES[monthIndex] || month;
  return `${monthName} ${year}`;
}

export function formatFullDateAZ(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTH_NAMES[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

export function formatDayAndMonthAZ(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTH_NAMES[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName}`;
}

export function shiftMonth(monthStr: string, delta: number): string {
  if (!monthStr || !monthStr.includes('-')) return getCurrentMonthString();
  const [yearStr, monthStrNum] = monthStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStrNum, 10) + delta;

  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getDayFromDate(dateStr?: string): number {
  if (!dateStr) return 1;
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return parseInt(parts[2], 10) || 1;
  }
  return 1;
}

export interface PaymentStatusInfo {
  status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  dueDay: number;
  daysDiff: number; // positive = days until due, negative = days overdue, 0 = today
  label: string;
  badgeClass: string;
}

export function getPaymentDueStatusInfo(
  student: Student,
  forMonth: string,
  isPaid: boolean
): PaymentStatusInfo {
  const dueDay = student.paymentDayOfMonth || getDayFromDate(student.enrollmentDate) || 1;

  if (isPaid) {
    return {
      status: 'paid',
      dueDay,
      daysDiff: 0,
      label: 'Ödənilib',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  const todayStr = getTodayDateString();
  const [currentYearStr, currentMonthStr, currentDayStr] = todayStr.split('-');
  const [forYearStr, forMonthOnlyStr] = forMonth.split('-');

  const currentYear = parseInt(currentYearStr, 10);
  const currentMonth = parseInt(currentMonthStr, 10);
  const currentDay = parseInt(currentDayStr, 10);

  const targetYear = parseInt(forYearStr, 10);
  const targetMonth = parseInt(forMonthOnlyStr, 10);

  // Compare month differences
  const monthDelta = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);

  if (monthDelta < 0) {
    // A past month unpaid = overdue
    return {
      status: 'overdue',
      dueDay,
      daysDiff: -30,
      label: 'Gecikir (Ötən ay)',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }

  if (monthDelta > 0) {
    // A future month
    return {
      status: 'upcoming',
      dueDay,
      daysDiff: 30,
      label: `Hər ayın ${dueDay}-i`,
      badgeClass: 'bg-slate-50 text-slate-600 border-slate-200',
    };
  }

  // Same month: compare days
  const daysDiff = dueDay - currentDay;

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      status: 'overdue',
      dueDay,
      daysDiff,
      label: `${overdueDays} gün gecikir`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  } else if (daysDiff === 0) {
    return {
      status: 'due_today',
      dueDay,
      daysDiff: 0,
      label: 'Bugün son gündür',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold',
    };
  } else if (daysDiff <= 3) {
    return {
      status: 'due_soon',
      dueDay,
      daysDiff,
      label: `${daysDiff} gün qalıb`,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  } else {
    return {
      status: 'upcoming',
      dueDay,
      daysDiff,
      label: `Hər ayın ${dueDay}-i`,
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
}

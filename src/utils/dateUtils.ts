export const AZ_MONTHS = [
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
  'Dekabr'
];

export const AZ_WEEKDAYS_SHORT = ['B.e', 'Ç.a', 'Çər', 'C.a', 'Cüm', 'Şən', 'Baz'];

// Formats YYYY-MM to "Sentyabr 2026"
export function formatMonthName(yearMonth: string): string {
  if (!yearMonth) return '';
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const monthName = AZ_MONTHS[monthIndex] || monthStr;
  return `${monthName} ${yearStr}`;
}

// Formats YYYY-MM-DD to "03 Sentyabr 2026"
export function formatFullDateAZ(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTHS[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
}

// Formats YYYY-MM-DD to short "03 Sent"
export function formatShortDateAZ(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTHS[monthIndex]?.slice(0, 4) || month;
  return `${parseInt(day, 10)} ${monthName}`;
}

// Formats YYYY-MM-DD to "03 Sentyabr" (Gün və Ay)
export function formatDayAndMonthAZ(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [, month, day] = parts;
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = AZ_MONTHS[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName}`;
}

// Get current date string YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get current month string YYYY-MM
export function getCurrentMonthString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Navigate month +/-
export function shiftMonth(yearMonth: string, delta: number): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + delta;

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

// Calculates exact due date YYYY-MM-DD for a given forMonth and dueDay (defaults to 5th if not set)
export function getPaymentDueDate(forMonth: string, dueDay: number = 5): string {
  const safeDay = Math.min(Math.max(1, dueDay || 5), 31);
  const [yearStr, monthStr] = forMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  // Get max days in that specific month
  const daysInMonth = new Date(year, month, 0).getDate();
  const clampedDay = Math.min(safeDay, daysInMonth);
  return `${yearStr}-${monthStr}-${String(clampedDay).padStart(2, '0')}`;
}

export interface DueStatusInfo {
  status: 'paid' | 'due' | 'due_soon' | 'overdue';
  label: string;
  badgeClass: string;
  daysDiff: number; // positive = days overdue, negative = days remaining, 0 = today
  dueDateStr: string;
  formattedDueDate: string;
}

export function getPaymentDueStatusInfo(
  forMonth: string,
  dueDay: number | undefined,
  isPaid: boolean
): DueStatusInfo {
  const dueDateStr = getPaymentDueDate(forMonth, dueDay || 5);
  const formattedDueDate = formatDayAndMonthAZ(dueDateStr);

  if (isPaid) {
    return {
      status: 'paid',
      label: 'Ödənilib',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      daysDiff: 0,
      dueDateStr,
      formattedDueDate,
    };
  }

  const todayStr = getTodayDateString();
  const todayDate = new Date(`${todayStr}T00:00:00`);
  const dueDate = new Date(`${dueDateStr}T00:00:00`);
  
  const diffTime = todayDate.getTime() - dueDate.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (daysDiff > 0) {
    // Overdue
    return {
      status: 'overdue',
      label: `${daysDiff} gün gecikir`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      daysDiff,
      dueDateStr,
      formattedDueDate,
    };
  } else if (daysDiff === 0) {
    // Due today
    return {
      status: 'due_soon',
      label: 'Son gün (Bu gün)',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      daysDiff: 0,
      dueDateStr,
      formattedDueDate,
    };
  } else if (daysDiff >= -3) {
    // Approaching due date within 3 days
    const remainingDays = Math.abs(daysDiff);
    return {
      status: 'due_soon',
      label: `${remainingDays} gün qalıb`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      daysDiff,
      dueDateStr,
      formattedDueDate,
    };
  } else {
    // Due later in the month
    return {
      status: 'due',
      label: `Gözlənilir (${formattedDueDate})`,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      daysDiff,
      dueDateStr,
      formattedDueDate,
    };
  }
}

// -------------------------------------------------------------
// 30-Day Payment Cycle Logic (Qeydiyyat tarixindən hər 30 gündən bir)
// -------------------------------------------------------------

export interface Student30DayCycleInfo {
  isOverdue: boolean;
  daysSinceEnrollment: number;
  totalPaymentsCount: number;
  coveredDays: number;
  dueDate: string; // YYYY-MM-DD when current 30-day payment is/was due
  formattedDueDate: string;
  daysOverdue: number; // > 0 if overdue
  daysRemaining: number; // >= 0 if not yet overdue
  lastPaymentDate?: string;
  formattedLastPaymentDate?: string;
}

/**
 * Calculates 30-day payment status for a student based on enrollmentDate and payments.
 * A payment is required every 30 days from the registration date.
 * - 0 payments: due at enrollment + 30 days
 * - 1 payment: due at enrollment + 60 days
 * - N payments: due at enrollment + (N + 1) * 30 days
 * If daysSinceEnrollment >= (paymentsCount + 1) * 30, the student is OVERDUE.
 */
export function getStudent30DayCycleInfo(
  enrollmentDateStr: string | undefined,
  payments: { paymentDate: string }[],
  todayStr: string = getTodayDateString()
): Student30DayCycleInfo {
  const safeEnrollment = enrollmentDateStr || todayStr;
  const [eY, eM, eD] = safeEnrollment.split('-').map(Number);
  const [tY, tM, tD] = todayStr.split('-').map(Number);

  const enrollTime = new Date(eY, eM - 1, eD).getTime();
  const todayTime = new Date(tY, tM - 1, tD).getTime();

  const diffMs = todayTime - enrollTime;
  const daysSinceEnrollment = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

  const totalPaymentsCount = payments.length;

  // Covered days: each payment covers 30 days from enrollment
  // 0 payments cover up to day 30 (due at day 30)
  // 1 payment covers up to day 60 (due at day 60)
  // N payments cover up to day (N + 1) * 30
  const coveredDays = (totalPaymentsCount + 1) * 30;

  // Target due date
  const dueDateObj = new Date(enrollTime + coveredDays * 24 * 60 * 60 * 1000);
  const dueYear = dueDateObj.getFullYear();
  const dueMonth = String(dueDateObj.getMonth() + 1).padStart(2, '0');
  const dueDay = String(dueDateObj.getDate()).padStart(2, '0');
  const dueDate = `${dueYear}-${dueMonth}-${dueDay}`;
  const formattedDueDate = formatDayAndMonthAZ(dueDate);

  const isOverdue = daysSinceEnrollment >= coveredDays;
  const daysOverdue = isOverdue ? daysSinceEnrollment - coveredDays : 0;
  const daysRemaining = !isOverdue ? coveredDays - daysSinceEnrollment : 0;

  let lastPaymentDate: string | undefined = undefined;
  let formattedLastPaymentDate: string | undefined = undefined;

  if (payments.length > 0) {
    const sorted = [...payments].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
    lastPaymentDate = sorted[0].paymentDate;
    formattedLastPaymentDate = formatDayAndMonthAZ(lastPaymentDate);
  }

  return {
    isOverdue,
    daysSinceEnrollment,
    totalPaymentsCount,
    coveredDays,
    dueDate,
    formattedDueDate,
    daysOverdue,
    daysRemaining,
    lastPaymentDate,
    formattedLastPaymentDate,
  };
}


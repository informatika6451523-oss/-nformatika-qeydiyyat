import { Group, Student, PaymentRecord } from '../types';
import {
  formatMonthName,
  formatFullDateAZ,
  formatDayAndMonthAZ,
  getPaymentDueStatusInfo,
  PaymentStatusInfo,
  getTodayDateString,
} from './dateUtils';

export interface StudentReportItem {
  student: Student;
  paymentStatus: PaymentStatusInfo;
  isPaid: boolean;
  paidAmount: number;
  paymentDate?: string;
  receiptNumber?: string;
}

export interface GroupReportData {
  group: Group;
  items: StudentReportItem[];
  totalStudents: number;
  paidCount: number;
  unpaidCount: number;
  overdueCount: number;
  totalExpectedFee: number;
  totalCollected: number;
}

export interface OverallReportSummary {
  forMonth: string;
  generatedDate: string;
  groups: GroupReportData[];
  totalGroups: number;
  totalStudentsAll: number;
  totalPaidAll: number;
  totalUnpaidAll: number;
  totalOverdueAll: number;
  totalExpectedAll: number;
  totalCollectedAll: number;
}

export function compileReportData(
  groups: Group[],
  students: Student[],
  payments: PaymentRecord[],
  forMonth: string,
  filterGroupId?: string | null
): OverallReportSummary {
  const targetGroups = filterGroupId
    ? groups.filter((g) => g.id === filterGroupId)
    : groups;

  let totalStudentsAll = 0;
  let totalPaidAll = 0;
  let totalUnpaidAll = 0;
  let totalOverdueAll = 0;
  let totalExpectedAll = 0;
  let totalCollectedAll = 0;

  const groupsData: GroupReportData[] = targetGroups.map((group) => {
    const groupStudents = students.filter((s) => s.groupId === group.id);
    let groupPaidCount = 0;
    let groupUnpaidCount = 0;
    let groupOverdueCount = 0;
    let groupExpected = 0;
    let groupCollected = 0;

    const items: StudentReportItem[] = groupStudents.map((student) => {
      const monthPayment = payments.find(
        (p) => p.studentId === student.id && p.forMonth === forMonth
      );
      const isPaid = !!monthPayment && monthPayment.amount > 0;
      const paymentStatus = getPaymentDueStatusInfo(student, forMonth, isPaid);

      const fee = student.monthlyFee || group.defaultMonthlyFee || 80;
      groupExpected += fee;

      if (isPaid) {
        groupPaidCount++;
        groupCollected += monthPayment.amount;
      } else {
        groupUnpaidCount++;
        if (paymentStatus.status === 'overdue') {
          groupOverdueCount++;
        }
      }

      return {
        student,
        paymentStatus,
        isPaid,
        paidAmount: monthPayment ? monthPayment.amount : 0,
        paymentDate: monthPayment?.paymentDate,
        receiptNumber: monthPayment?.receiptNumber,
      };
    });

    totalStudentsAll += groupStudents.length;
    totalPaidAll += groupPaidCount;
    totalUnpaidAll += groupUnpaidCount;
    totalOverdueAll += groupOverdueCount;
    totalExpectedAll += groupExpected;
    totalCollectedAll += groupCollected;

    return {
      group,
      items,
      totalStudents: groupStudents.length,
      paidCount: groupPaidCount,
      unpaidCount: groupUnpaidCount,
      overdueCount: groupOverdueCount,
      totalExpectedFee: groupExpected,
      totalCollected: groupCollected,
    };
  });

  return {
    forMonth,
    generatedDate: getTodayDateString(),
    groups: groupsData,
    totalGroups: targetGroups.length,
    totalStudentsAll,
    totalPaidAll,
    totalUnpaidAll,
    totalOverdueAll,
    totalExpectedAll,
    totalCollectedAll,
  };
}

export function exportToWordDoc(report: OverallReportSummary, filename?: string) {
  const monthName = formatMonthName(report.forMonth);
  const docFilename =
    filename || `Sagird_Odenis_Hesabati_${report.forMonth.replace('-', '_')}.doc`;

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Şagird və Ödəniş Hesabatı - ${monthName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #1e293b;
        }
        h1 {
          font-size: 20pt;
          color: #0f172a;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 6px;
          margin-bottom: 4px;
        }
        .header-meta {
          font-size: 10pt;
          color: #64748b;
          margin-bottom: 20px;
        }
        .summary-card {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 12px;
          margin-bottom: 25px;
        }
        .summary-card table {
          width: 100%;
          border-collapse: collapse;
        }
        .summary-card td {
          padding: 6px 12px;
          font-size: 10.5pt;
        }
        .group-section {
          margin-top: 30px;
          page-break-inside: avoid;
        }
        h2 {
          font-size: 14pt;
          color: #1e40af;
          margin-bottom: 8px;
          background-color: #eff6ff;
          padding: 8px 10px;
          border-left: 4px solid #2563eb;
        }
        .group-meta {
          font-size: 10pt;
          color: #475569;
          margin-bottom: 10px;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10pt;
        }
        table.data-table th {
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          color: #334155;
        }
        table.data-table td {
          border: 1px solid #cbd5e1;
          padding: 7px 8px;
        }
        .status-paid {
          background-color: #ecfdf5;
          color: #047857;
          font-weight: bold;
        }
        .status-overdue {
          background-color: #fff1f2;
          color: #b91c1c;
          font-weight: bold;
        }
        .status-due {
          background-color: #fffbeb;
          color: #b45309;
        }
        .footer {
          margin-top: 40px;
          font-size: 9pt;
          color: #94a3b8;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <h1>Müəllim Jurnalı — Şagird və Ödəniş Hesabatı</h1>
      <div class="header-meta">
        <strong>Dövr:</strong> ${monthName} | <strong>Hazırlanma tarixi:</strong> ${formatFullDateAZ(report.generatedDate)}
      </div>

      <div class="summary-card">
        <table>
          <tr>
            <td><strong>Ümumi Qruplar:</strong> ${report.totalGroups}</td>
            <td><strong>Ümumi Şagirdlər:</strong> ${report.totalStudentsAll} nəfər</td>
            <td><strong>Ödəyənlər:</strong> <span style="color:#047857; font-weight:bold;">${report.totalPaidAll} nəfər</span></td>
          </tr>
          <tr>
            <td><strong>Ödəniş Etməyənlər:</strong> <span style="color:#b45309;">${report.totalUnpaidAll} nəfər</span></td>
            <td><strong>Gecikdirənlər:</strong> <span style="color:#b91c1c; font-weight:bold;">${report.totalOverdueAll} nəfər</span></td>
            <td><strong>Toplanan Məbləğ:</strong> <span style="color:#047857; font-weight:bold;">${report.totalCollectedAll} AZN</span> / ${report.totalExpectedAll} AZN</td>
          </tr>
        </table>
      </div>
  `;

  report.groups.forEach((grpData) => {
    htmlContent += `
      <div class="group-section">
        <h2>${grpData.group.name}</h2>
        <div class="group-meta">
          <strong>Fənn:</strong> ${grpData.group.subject || 'Qeyd olunmayıb'} | 
          <strong>Dərs günləri:</strong> ${(grpData.group.scheduleDays || []).join(', ') || 'Qeyd olunmayıb'} ${grpData.group.scheduleTime ? `(${grpData.group.scheduleTime})` : ''} | 
          <strong>Şagird sayı:</strong> ${grpData.totalStudents} | 
          <strong>Toplanan:</strong> ${grpData.totalCollected} AZN / ${grpData.totalExpectedFee} AZN
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">№</th>
              <th>Şagirdin Adı, Soyadı</th>
              <th>Əlaqə Nömrəsi</th>
              <th>Kursa Qeydiyyat Tarixi</th>
              <th>Aylıq Ödəniş Günü</th>
              <th>Məbləğ</th>
              <th>Ödəniş Vəziyyəti</th>
              <th>Qeyd / Qəbz №</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (grpData.items.length === 0) {
      htmlContent += `
        <tr>
          <td colspan="8" style="text-align:center; color:#94a3b8; padding:15px;">Bu qrupda hələ ki şagird qeydiyyatdan keçməyib.</td>
        </tr>
      `;
    } else {
      grpData.items.forEach((item, idx) => {
        let statusStyle = 'status-due';
        if (item.isPaid) statusStyle = 'status-paid';
        else if (item.paymentStatus.status === 'overdue') statusStyle = 'status-overdue';

        const dayNumber = item.student.paymentDayOfMonth || 1;
        const phone = item.student.phone || item.student.parentPhone || '—';
        const enrollment = item.student.enrollmentDate
          ? formatFullDateAZ(item.student.enrollmentDate)
          : '—';
        const receiptNote = item.receiptNumber
          ? `Qəbz: ${item.receiptNumber}`
          : item.student.notes || '—';

        htmlContent += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td><strong>${item.student.name}</strong></td>
            <td>${phone}</td>
            <td>${enrollment}</td>
            <td>Hər ayın ${dayNumber}-i</td>
            <td>${item.student.monthlyFee || grpData.group.defaultMonthlyFee || 80} AZN</td>
            <td class="${statusStyle}">${item.paymentStatus.label} ${item.isPaid ? `(${item.paidAmount} AZN)` : ''}</td>
            <td>${receiptNote}</td>
          </tr>
        `;
      });
    }

    htmlContent += `
          </tbody>
        </table>
      </div>
    `;
  });

  htmlContent += `
      <div class="footer">
        Bu rəsmi hesabat sənədi Müəllim Jurnalı və Şagird Ödənişləri Sistemi tərəfindən avtomatik tərtib edilmişdir.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = docFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function exportToCsv(report: OverallReportSummary, filename?: string) {
  const csvFilename =
    filename || `Sagird_Hesabat_${report.forMonth.replace('-', '_')}.csv`;

  const rows: string[][] = [
    ['MÜƏLLİM JURNALI - ŞAGİRD VƏ ÖDƏNİŞ HESABATI'],
    [`Hesabat Dövrü:`, formatMonthName(report.forMonth)],
    [`Tarix:`, formatFullDateAZ(report.generatedDate)],
    [''],
    [
      'Qrup',
      'Şagirdin Adı',
      'Əlaqə',
      'Valideyn Nömrəsi',
      'Qeydiyyat Tarixi',
      'Ödəniş Günü',
      'Aylıq Haqq (AZN)',
      'Ödəniş Statusu',
      'Ödənilib (AZN)',
      'Qəbz №',
      'Qeyd',
    ],
  ];

  report.groups.forEach((grp) => {
    grp.items.forEach((item) => {
      rows.push([
        grp.group.name,
        item.student.name,
        item.student.phone || '',
        item.student.parentPhone || '',
        item.student.enrollmentDate || '',
        `Hər ayın ${item.student.paymentDayOfMonth || 1}-i`,
        String(item.student.monthlyFee || grp.group.defaultMonthlyFee || 80),
        item.paymentStatus.label,
        item.isPaid ? String(item.paidAmount) : '0',
        item.receiptNumber || '',
        item.student.notes || '',
      ]);
    });
  });

  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = csvFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

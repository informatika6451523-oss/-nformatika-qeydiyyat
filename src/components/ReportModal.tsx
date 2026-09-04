import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Group, Student, PaymentRecord } from '../types';
import {
  compileReportData,
  exportToWordDoc,
  exportToCsv,
} from '../utils/reportExport';
import {
  formatMonthName,
  formatFullDateAZ,
  shiftMonth,
  getCurrentMonthString,
} from '../utils/dateUtils';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  students: Student[];
  payments: PaymentRecord[];
  initialGroupId?: string | null;
  initialMonth?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  groups,
  students,
  payments,
  initialGroupId = null,
  initialMonth,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | 'all'>(
    initialGroupId || 'all'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || getCurrentMonthString()
  );

  const reportData = useMemo(() => {
    return compileReportData(
      groups,
      students,
      payments,
      selectedMonth,
      selectedGroupId === 'all' ? null : selectedGroupId
    );
  }, [groups, students, payments, selectedMonth, selectedGroupId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = () => {
    exportToWordDoc(reportData);
  };

  const handleDownloadCsv = () => {
    exportToCsv(reportData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Non printable */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Hesabat Mərkəzi
              </h2>
              <p className="text-xs text-slate-500">
                Qrup cədvəli, şagird məlumatları və aylıq ödəniş hesabatı (PDF, Word, Excel)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar: Filters & Export buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-3.5 bg-white shrink-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Group selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Qrup:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Bütün Qruplar ({groups.length})</option>
                {groups.map((grp) => (
                  <option key={grp.id} value={grp.id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl border border-slate-200 p-1">
              <button
                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Əvvəlki ay"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-2 text-xs font-bold text-slate-800 min-w-28 text-center">
                {formatMonthName(selectedMonth)}
              </span>
              <button
                onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
                className="p-1 text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Növbəti ay"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
              title="Çap et və ya PDF kimi yadda saxla"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>PDF / Çap Et</span>
            </button>

            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
              title="Microsoft Word (.doc) formatında yüklə"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Word (.doc) Yüklə</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Excel (.csv) cədvəli yüklə"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Excel (.csv)</span>
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          <div
            id="printable-report-area"
            className="rounded-2xl bg-white p-6 sm:p-8 shadow-xs border border-slate-200"
          >
            {/* Report Header in Document */}
            <div className="border-b border-slate-200 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Müəllim Jurnalı — Şagird və Ödəniş Hesabatı
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Dövr: <strong className="text-slate-800">{formatMonthName(reportData.forMonth)}</strong> | Hazırlanma tarixi:{' '}
                    <strong className="text-slate-800">{formatFullDateAZ(reportData.generatedDate)}</strong>
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start">
                  Cəmi Qrup: {reportData.totalGroups}
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-500">Ümumi Şagird</span>
                  <div className="text-lg font-bold text-slate-900 mt-0.5">
                    {reportData.totalStudentsAll} nəfər
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200">
                  <span className="text-[11px] font-medium text-emerald-700">Ödəyənlər</span>
                  <div className="text-lg font-bold text-emerald-800 mt-0.5">
                    {reportData.totalPaidAll} nəfər
                  </div>
                </div>

                <div className="rounded-xl bg-rose-50/80 p-3.5 border border-rose-200">
                  <span className="text-[11px] font-medium text-rose-700">Gecikdirənlər</span>
                  <div className="text-lg font-bold text-rose-800 mt-0.5">
                    {reportData.totalOverdueAll} nəfər
                  </div>
                </div>

                <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-200">
                  <span className="text-[11px] font-medium text-blue-700">Toplanan / Gözlənilən</span>
                  <div className="text-lg font-bold text-blue-900 mt-0.5">
                    {reportData.totalCollectedAll} / {reportData.totalExpectedAll} AZN
                  </div>
                </div>
              </div>
            </div>

            {/* Tables for each group */}
            <div className="space-y-8">
              {reportData.groups.map((grpData) => (
                <div
                  key={grpData.group.id}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs"
                >
                  {/* Group Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {grpData.group.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fənn: {grpData.group.subject || 'Qeyd olunmayıb'} | Günlər:{' '}
                        {(grpData.group.scheduleDays || []).join(', ') || '—'}{' '}
                        {grpData.group.scheduleTime ? `(${grpData.group.scheduleTime})` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-600 font-medium">
                        Şagird: <strong>{grpData.totalStudents}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {grpData.totalCollected} / {grpData.totalExpectedFee} AZN
                      </span>
                    </div>
                  </div>

                  {/* Students Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3.5 text-center w-10">№</th>
                          <th className="py-2.5 px-3.5">Şagirdin Adı</th>
                          <th className="py-2.5 px-3.5">Əlaqə Nömrəsi</th>
                          <th className="py-2.5 px-3.5">Qeydiyyat Tarixi</th>
                          <th className="py-2.5 px-3.5">Ödəniş Günü</th>
                          <th className="py-2.5 px-3.5">Məbləğ</th>
                          <th className="py-2.5 px-3.5">Ödəniş Vəziyyəti</th>
                          <th className="py-2.5 px-3.5">Qeyd / Qəbz</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {grpData.items.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-slate-400">
                              Bu qrupda hələ ki şagird qeydiyyatdan keçməyib.
                            </td>
                          </tr>
                        ) : (
                          grpData.items.map((item, idx) => {
                            const dayNum = item.student.paymentDayOfMonth || 1;
                            return (
                              <tr
                                key={item.student.id}
                                className="hover:bg-slate-50/80 transition-colors"
                              >
                                <td className="py-2.5 px-3.5 text-center text-slate-400 font-normal">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-3.5 font-bold text-slate-900">
                                  {item.student.name}
                                </td>
                                <td className="py-2.5 px-3.5 text-slate-600">
                                  {item.student.phone || item.student.parentPhone || '—'}
                                </td>
                                <td className="py-2.5 px-3.5 text-slate-600">
                                  {item.student.enrollmentDate
                                    ? formatFullDateAZ(item.student.enrollmentDate)
                                    : '—'}
                                </td>
                                <td className="py-2.5 px-3.5 text-slate-700 font-semibold">
                                  Hər ayın {dayNum}-i
                                </td>
                                <td className="py-2.5 px-3.5 font-bold text-slate-900">
                                  {item.student.monthlyFee || grpData.group.defaultMonthlyFee || 80} AZN
                                </td>
                                <td className="py-2.5 px-3.5">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${item.paymentStatus.badgeClass}`}
                                  >
                                    {item.paymentStatus.label}
                                    {item.isPaid && ` (${item.paidAmount} AZN)`}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3.5 text-slate-500 text-[11px] max-w-xs truncate">
                                  {item.receiptNumber
                                    ? `Qəbz: ${item.receiptNumber}`
                                    : item.student.notes || '—'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Print Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Bu sənəd Müəllim Jurnalı və Şagird Ödənişləri Sistemi tərəfindən {formatFullDateAZ(reportData.generatedDate)} tarixində tərtib edilmişdir.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            PDF çıxarmaq üçün <strong>PDF / Çap Et</strong> düyməsindən "Save as PDF" seçə bilərsiniz.
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

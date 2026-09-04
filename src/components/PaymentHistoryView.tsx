import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Calendar,
  Trash2,
  AlertCircle,
  Banknote,
  FileText
} from 'lucide-react';
import { Group, Student, PaymentRecord } from '../types';
import { formatFullDateAZ, formatMonthName } from '../utils/dateUtils';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface PaymentHistoryViewProps {
  group: Group;
  students: Student[];
  payments: PaymentRecord[];
  onDeletePayment: (paymentId: string) => void;
}

export const PaymentHistoryView: React.FC<PaymentHistoryViewProps> = ({
  group,
  students,
  payments,
  onDeletePayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForMonthFilter, setSelectedForMonthFilter] = useState<string>('all');
  const [paymentToDeleteId, setPaymentToDeleteId] = useState<string | null>(null);

  // Filter payments for this group
  const groupPayments = payments
    .filter((p) => p.groupId === group.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  // Get distinct forMonths
  const distinctMonths = Array.from<string>(
    new Set(groupPayments.map((p) => p.forMonth))
  ).sort((a, b) => b.localeCompare(a));

  const filtered = groupPayments.filter((p) => {
    const student = students.find((s) => s.id === p.studentId);
    const studentName = student?.name.toLowerCase() || '';
    const matchesSearch = studentName.includes(searchQuery.toLowerCase());
    const matchesMonth =
      selectedForMonthFilter === 'all' || p.forMonth === selectedForMonthFilter;
    return matchesSearch && matchesMonth;
  });

  const totalFilteredAmount = filtered.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Top filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/90">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Şagird adı ilə axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          <select
            value={selectedForMonthFilter}
            onChange={(e) => setSelectedForMonthFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-blue-500 focus:outline-none cursor-pointer shadow-xs"
          >
            <option value="all">Bütün Aylar</option>
            {distinctMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 border border-emerald-200/80 px-4 py-2 text-xs">
          <Banknote className="h-4 w-4 text-emerald-600" />
          <span className="text-emerald-800 font-medium">Cəmi:</span>
          <span className="font-bold text-emerald-900 text-sm">{totalFilteredAmount} AZN</span>
          <span className="text-emerald-700/80 font-medium">({filtered.length} qeyd)</span>
        </div>
      </div>

      {/* Payments list table */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-14 text-center px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Heç bir ödəniş qeydi tapılmadı</h3>
            <p className="mt-1 text-xs text-slate-500">
              "Şagirdlər və Ödənişlər" bölməsindən yeni ödəniş qeyd edə bilərsiniz.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-5">Şagird & Hansı Ay Üçün</div>
              <div className="col-span-3">Məbləğ & Üsul</div>
              <div className="col-span-3">Ödəniş Tarixi & Qeyd</div>
              <div className="col-span-1 text-right">Sil</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((payment) => {
                const student = students.find((s) => s.id === payment.studentId);
                return (
                  <div
                    key={payment.id}
                    className="flex flex-col gap-2 p-4 sm:px-5 sm:py-3.5 sm:grid sm:grid-cols-12 sm:items-center hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Receipt className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-slate-900 block truncate">
                          {student?.name || 'Silinmiş şagird'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {formatMonthName(payment.forMonth)} üçün ödəniş
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-2">
                      <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        +{payment.amount} AZN
                      </span>
                      {payment.paymentMethod && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase">
                          {payment.paymentMethod === 'cash' ? 'Nağd' : payment.paymentMethod === 'm10' ? 'M10/Kart' : 'Köçürmə'}
                        </span>
                      )}
                    </div>

                    <div className="sm:col-span-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{formatFullDateAZ(payment.paymentDate)}</span>
                      </div>
                      {payment.note && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 italic">
                          <FileText className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{payment.note}</span>
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => setPaymentToDeleteId(payment.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialogModal
        isOpen={paymentToDeleteId !== null}
        title="Ödəniş qeydini silmək istəyirsiniz?"
        message="Bu ödəniş qeydini silmək istədiyinizə əminsiniz?"
        confirmText="Ödənişi Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          if (paymentToDeleteId) {
            onDeletePayment(paymentToDeleteId);
            setPaymentToDeleteId(null);
          }
        }}
        onClose={() => setPaymentToDeleteId(null)}
      />
    </div>
  );
};

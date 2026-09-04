import React, { useState } from 'react';
import {
  History,
  Receipt,
  Trash2,
  Search,
  Filter,
  CreditCard,
  AlertCircle,
  Calendar,
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
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentRecord | null>(null);

  // Filter payments belonging to current group
  const groupPayments = payments.filter((p) => p.groupId === group.id);

  const filteredPayments = groupPayments.filter((payment) => {
    const student = students.find((s) => s.id === payment.studentId);
    const studentName = student?.name.toLowerCase() || '';

    if (selectedStudentId !== 'all' && payment.studentId !== selectedStudentId) {
      return false;
    }

    if (
      searchQuery &&
      !studentName.includes(searchQuery.toLowerCase()) &&
      !payment.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !payment.note?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Sort by date descending
  filteredPayments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const totalSum = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-5">
      {/* Filter and summary bar */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Şagird və ya qəbz axtar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Student Filter */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Bütün Şagirdlər</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl bg-blue-50 px-4 py-2 border border-blue-100 flex items-center gap-2 self-start md:self-auto">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-800 font-medium">Toplam Ödəniş:</span>
            <span className="text-sm font-bold text-blue-900">{totalSum} AZN</span>
            <span className="text-xs text-blue-600">({filteredPayments.length} qeyd)</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {filteredPayments.length === 0 ? (
          <div className="py-14 text-center px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Ödəniş qeydi tapılmadı</h3>
            <p className="mt-1 text-xs text-slate-500">
              Bu filtr üzrə heç bir ödəniş qeydi qeydə alınmayıb.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ödəniş Tarixi</th>
                  <th className="py-3 px-4">Şagird</th>
                  <th className="py-3 px-4">Aid Olduğu Ay</th>
                  <th className="py-3 px-4">Məbləğ</th>
                  <th className="py-3 px-4">Qəbz №</th>
                  <th className="py-3 px-4">Qeyd</th>
                  <th className="py-3 px-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPayments.map((payment) => {
                  const student = students.find((s) => s.id === payment.studentId);

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-600">
                        {formatFullDateAZ(payment.paymentDate)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student?.name || 'Silinmiş şagird'}
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-semibold">
                        {formatMonthName(payment.forMonth)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {payment.amount} AZN
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {payment.receiptNumber || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {payment.note || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setPaymentToDelete(payment)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Ödəniş qeydini sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Payment */}
      <ConfirmDialogModal
        isOpen={!!paymentToDelete}
        title="Ödəniş Qeydini Sil"
        message={`Bu ${paymentToDelete?.amount} AZN məbləğindəki ödəniş qeydini silmək istədiyinizə əminsiniz?`}
        confirmLabel="Bəli, Sil"
        confirmVariant="danger"
        onConfirm={() => {
          if (paymentToDelete) {
            onDeletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
};

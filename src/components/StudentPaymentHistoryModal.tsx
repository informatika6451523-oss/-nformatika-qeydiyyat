import React from 'react';
import { X, History, Trash2 } from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import { formatFullDateAZ, formatMonthName } from '../utils/dateUtils';

interface StudentPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  payments: PaymentRecord[];
  onDeletePayment: (paymentId: string) => void;
}

export const StudentPaymentHistoryModal: React.FC<StudentPaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  student,
  payments,
  onDeletePayment,
}) => {
  if (!isOpen || !student) return null;

  const studentPayments = payments
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const totalPaid = studentPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ödəniş Tarixçəsi</h3>
              <p className="text-xs text-slate-500">{student.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-600 font-medium">Toplam Ödənilən:</span>
          <span className="text-base font-bold text-emerald-700">{totalPaid} AZN</span>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
          {studentPayments.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Bu şagird üçün hələ heç bir ödəniş qeyd edilməyib.
            </div>
          ) : (
            studentPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50/80 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">
                      {formatMonthName(p.forMonth)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {p.amount} AZN
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Tarix: {formatFullDateAZ(p.paymentDate)}</span>
                    {p.receiptNumber && <span>• Qəbz: {p.receiptNumber}</span>}
                    {p.note && <span>• {p.note}</span>}
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('Bu ödəniş qeydini silmək istədiyinizə əminsiniz?')) {
                      onDeletePayment(p.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Ödənişi sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

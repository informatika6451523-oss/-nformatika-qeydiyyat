import React, { useState } from 'react';
import { X, Calendar, Trash2, Receipt, AlertCircle } from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import { formatFullDateAZ, formatMonthName } from '../utils/dateUtils';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface StudentPaymentHistoryModalProps {
  isOpen: boolean;
  student: Student | null;
  payments: PaymentRecord[];
  onClose: () => void;
  onDeletePayment: (paymentId: string) => void;
}

export const StudentPaymentHistoryModal: React.FC<StudentPaymentHistoryModalProps> = ({
  isOpen,
  student,
  payments,
  onClose,
  onDeletePayment,
}) => {
  const [paymentToDeleteId, setPaymentToDeleteId] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const studentPayments = payments
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div
      id="payment-history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="payment-history-modal-card"
        className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ödəniş Tarixçəsi</h2>
              <p className="text-xs text-slate-500 font-semibold">
                {student.name} • <span className="text-slate-600">Aylıq haqq: {student.monthlyFee} AZN</span>
              </p>
            </div>
          </div>
          <button
            id="close-history-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats summary */}
        <div className="my-4 flex items-center justify-between rounded-xl bg-slate-50/80 p-4 border border-slate-200/70">
          <div>
            <span className="text-xs font-semibold text-slate-500">Ümumi Ödənilmiş Məbləğ:</span>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{totalPaid} AZN</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Ödəniş Sayı:</span>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{studentPayments.length} dəfə</p>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
          {studentPayments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Hələ ki, heç bir ödəniş qeyd olunmayıb</p>
            </div>
          ) : (
            studentPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 hover:border-slate-300 shadow-xs transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      +{p.amount} AZN
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {formatMonthName(p.forMonth)} üçün
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1 font-medium text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatFullDateAZ(p.paymentDate)}</span>
                    </div>
                    {p.paymentMethod && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-semibold text-slate-600">
                        {p.paymentMethod === 'cash' ? 'Nağd' : p.paymentMethod === 'm10' ? 'M10/Kart' : 'Köçürmə'}
                      </span>
                    )}
                  </div>
                  {p.note && <p className="mt-1 text-[11px] text-slate-500 italic">Qeyd: {p.note}</p>}
                </div>

                <button
                  onClick={() => setPaymentToDeleteId(p.id)}
                  title="Ödənişi sil"
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>

      <ConfirmDialogModal
        isOpen={paymentToDeleteId !== null}
        title="Ödənişi silmək istəyirsiniz?"
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

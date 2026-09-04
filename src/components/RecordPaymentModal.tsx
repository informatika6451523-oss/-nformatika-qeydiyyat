import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Receipt, FileText, Check } from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import {
  getCurrentMonthString,
  getTodayDateString,
} from '../utils/dateUtils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentForMonth?: string;
  defaultMonth?: string;
  existingPayment?: PaymentRecord | null;
  onSave?: (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
  onSavePayment?: (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  student,
  currentForMonth,
  defaultMonth,
  existingPayment,
  onSave,
  onSavePayment,
}) => {
  const targetMonth = currentForMonth || defaultMonth || getCurrentMonthString();
  const [forMonth, setForMonth] = useState(targetMonth);
  const [amount, setAmount] = useState<number>(student?.monthlyFee || 80);
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [receiptNumber, setReceiptNumber] = useState('');
  const [note, setNote] = useState('Nağd ödənildi');

  useEffect(() => {
    if (existingPayment) {
      setForMonth(existingPayment.forMonth);
      setAmount(existingPayment.amount);
      setPaymentDate(existingPayment.paymentDate);
      setReceiptNumber(existingPayment.receiptNumber || '');
      setNote(existingPayment.note || '');
    } else if (student) {
      setForMonth(targetMonth);
      setAmount(student.monthlyFee || 80);
      setPaymentDate(getTodayDateString());
      setReceiptNumber(`QBZ-${Date.now().toString().slice(-4)}`);
      setNote('Nağd ödənildi');
    }
  }, [existingPayment, targetMonth, student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const data: Omit<PaymentRecord, 'id' | 'createdAt'> = {
      studentId: student.id,
      groupId: student.groupId,
      amount: Number(amount),
      paymentDate,
      forMonth,
      receiptNumber: receiptNumber.trim() || undefined,
      note: note.trim() || undefined,
    };

    if (onSave) onSave(data);
    else if (onSavePayment) onSavePayment(data);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {existingPayment ? 'Ödənişi Yenilə' : 'Ödəniş Qəbul Et'}
              </h3>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aid Olduğu Ay
              </label>
              <input
                type="month"
                required
                value={forMonth}
                onChange={(e) => setForMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ödəniş Məbləği (AZN) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ödəniş Tarixi
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qəbz Nömrəsi
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Qeyd / Ödəniş üsulu
            </label>
            <div className="flex gap-2 mb-2">
              {['Nağd ödənildi', 'Kartla / Bank köçürməsi', 'Hissə-hissə'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setNote(opt)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    note === opt
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              İmtina
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{existingPayment ? 'Yadda Saxla' : 'Ödənişi Qeyd Et'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

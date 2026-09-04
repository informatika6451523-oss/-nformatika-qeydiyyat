import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Banknote, FileText } from 'lucide-react';
import { Student, PaymentRecord } from '../types';
import { AZ_MONTHS, getTodayDateString } from '../utils/dateUtils';

interface RecordPaymentModalProps {
  isOpen: boolean;
  student: Student | null;
  currentForMonth: string; // YYYY-MM
  onClose: () => void;
  onSave: (payment: Omit<PaymentRecord, 'id' | 'createdAt'>) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  student,
  currentForMonth,
  onClose,
  onSave,
}) => {
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [forMonth, setForMonth] = useState<string>(currentForMonth);
  const [amount, setAmount] = useState<number | ''>(80);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'm10' | 'other'>('cash');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (student) {
      setAmount(student.monthlyFee || 80);
    }
    setPaymentDate(getTodayDateString());
    setForMonth(currentForMonth);
    setNote('');
  }, [student, currentForMonth, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDate || !forMonth || typeof amount !== 'number' || amount <= 0) return;

    onSave({
      studentId: student.id,
      groupId: student.groupId,
      amount,
      paymentDate,
      forMonth,
      paymentMethod,
      note: note.trim() || undefined,
    });

    onClose();
  };

  // Generate list of months for selection: current year - 1 to +1
  const currentYear = new Date().getFullYear();
  const availableMonths: { label: string; value: string }[] = [];
  [currentYear - 1, currentYear, currentYear + 1].forEach((yr) => {
    AZ_MONTHS.forEach((mName, idx) => {
      const mStr = String(idx + 1).padStart(2, '0');
      availableMonths.push({
        label: `${mName} ${yr}`,
        value: `${yr}-${mStr}`,
      });
    });
  });

  return (
    <div
      id="record-payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="record-payment-modal-card"
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ödəniş Qeydiyyatı</h2>
              <p className="text-xs text-slate-500 font-medium">
                Şagird: <span className="font-bold text-slate-800">{student.name}</span>
              </p>
            </div>
          </div>
          <button
            id="close-payment-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Payment Date - exact day and month */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Ödənişin edildiyi tarix (Gün və Ay) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="payment-date-input"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-xs cursor-pointer"
            />
            <p className="mt-1.5 text-[11px] text-slate-400 font-medium">
              Şagirdin ödənişi faktiki etdiyi dəqiq gün və ay
            </p>
          </div>

          {/* For which month fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Hansı ay üçün? <span className="text-rose-500">*</span>
              </label>
              <select
                id="payment-for-month-select"
                value={forMonth}
                onChange={(e) => setForMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-xs cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-slate-400" />
                Məbləğ (AZN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="payment-amount-input"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-xs"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ödəniş Üsulu
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Nağd' },
                { id: 'm10', label: 'M10 / Kart' },
                { id: 'card', label: 'Köçürmə' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`rounded-xl border py-2 text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === opt.id
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-800 ring-2 ring-emerald-100'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Qeyd (İstəyə bağlı)
            </label>
            <input
              type="text"
              id="payment-note-input"
              placeholder="məs: Valideyn ödədi, qəbz nömrəsi və s."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 shadow-xs"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              id="submit-record-payment-btn"
              disabled={!paymentDate || !amount}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              Ödənişi Qeyd Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

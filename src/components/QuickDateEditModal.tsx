import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import { getDayFromDate } from '../utils/dateUtils';

interface QuickDateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSaveDate?: (studentId: string, newDate: string) => void;
  onSave?: (studentId: string, enrollmentDate?: string, paymentDay?: number) => void;
}

export const QuickDateEditModal: React.FC<QuickDateEditModalProps> = ({
  isOpen,
  onClose,
  student,
  onSaveDate,
  onSave,
}) => {
  const [enrollmentDate, setEnrollmentDate] = useState(student?.enrollmentDate || '');
  const [paymentDay, setPaymentDay] = useState<number>(
    student?.paymentDueDay ||
      student?.paymentDayOfMonth ||
      getDayFromDate(student?.enrollmentDate) ||
      1
  );

  useEffect(() => {
    if (student) {
      setEnrollmentDate(student.enrollmentDate || '');
      setPaymentDay(
        student.paymentDueDay ||
          student.paymentDayOfMonth ||
          getDayFromDate(student.enrollmentDate) ||
          1
      );
    }
  }, [student, isOpen]);

  // When enrollment date changes, automatically update payment day (User Request 7)
  const handleEnrollmentDateChange = (val: string) => {
    setEnrollmentDate(val);
    const d = getDayFromDate(val);
    if (d >= 1 && d <= 31) {
      setPaymentDay(d);
    }
  };

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveDate) {
      onSaveDate(student.id, enrollmentDate);
    }
    if (onSave) {
      onSave(student.id, enrollmentDate || undefined, Number(paymentDay) || 1);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ödəniş və Qeydiyyat Tarixi
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kursa Qeydiyyat Tarixi
            </label>
            <input
              type="date"
              required
              value={enrollmentDate}
              onChange={(e) => handleEnrollmentDateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hər Ayın Ödəniş Günü (1 - 31)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="31"
                required
                value={paymentDay}
                onChange={(e) => setPaymentDay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                -i / -si
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-xl border border-blue-100 font-medium">
            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              Qeydiyyat gününə uyğun olaraq ödəniş günü avtomatik <strong>hər ayın {paymentDay}-i</strong> təyin edildi.
            </span>
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
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
            >
              Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

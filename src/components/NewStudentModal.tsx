import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Calendar, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';
import { getTodayDateString, getDayFromDate } from '../utils/dateUtils';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  defaultFee: number;
  onSave?: (studentData: Omit<Student, 'id' | 'createdAt'>) => void;
  onCreateStudent?: (studentData: Omit<Student, 'id' | 'createdAt'>) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  groupId,
  defaultFee,
  onSave,
  onCreateStudent,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(defaultFee || 80);
  const [enrollmentDate, setEnrollmentDate] = useState<string>(getTodayDateString());
  const [paymentDayOfMonth, setPaymentDayOfMonth] = useState<number>(() =>
    getDayFromDate(getTodayDateString())
  );
  const [notes, setNotes] = useState('');

  // Automatically update paymentDayOfMonth whenever enrollmentDate changes (User Request 7)
  useEffect(() => {
    if (enrollmentDate) {
      const day = getDayFromDate(enrollmentDate);
      if (day >= 1 && day <= 31) {
        setPaymentDayOfMonth(day);
      }
    }
  }, [enrollmentDate]);

  // Reset or initialize on modal open
  useEffect(() => {
    if (isOpen) {
      setMonthlyFee(defaultFee || 80);
      const today = getTodayDateString();
      setEnrollmentDate(today);
      setPaymentDayOfMonth(getDayFromDate(today));
    }
  }, [isOpen, defaultFee]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Omit<Student, 'id' | 'createdAt'> = {
      groupId,
      name: name.trim(),
      phone: phone.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      monthlyFee: Number(monthlyFee) || 80,
      enrollmentDate: enrollmentDate || getTodayDateString(),
      paymentDueDay: Number(paymentDayOfMonth) || getDayFromDate(enrollmentDate) || 1,
      paymentDayOfMonth: Number(paymentDayOfMonth) || getDayFromDate(enrollmentDate) || 1,
      notes: notes.trim() || undefined,
    };

    if (onSave) onSave(data);
    else if (onCreateStudent) onCreateStudent(data);

    setName('');
    setPhone('');
    setParentPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Yeni Şagird Əlavə Et</h3>
              <p className="text-xs text-slate-500">
                Şagirdin əlaqə və ödəniş məlumatlarını qeyd edin
              </p>
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
              Şagirdin Adı və Soyadı *
            </label>
            <input
              type="text"
              required
              placeholder="məsələn: Əli Məmmədov"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Şagirdin Əlaqə Nömrəsi
              </label>
              <input
                type="text"
                placeholder="+994 50 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valideynin Nömrəsi
              </label>
              <input
                type="text"
                placeholder="+994 55 000 00 00"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Date & Payment Day Section (Requirement 7) */}
          <div className="rounded-xl bg-blue-50/50 p-3.5 border border-blue-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Kursa Qeydiyyat Tarixi</span>
                </label>
                <input
                  type="date"
                  required
                  value={enrollmentDate}
                  onChange={(e) => setEnrollmentDate(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Hər Ayın Ödəniş Günü</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={paymentDayOfMonth}
                    onChange={(e) => setPaymentDayOfMonth(Number(e.target.value))}
                    className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    -i / -si
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-white/80 p-2 rounded-lg border border-blue-100 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>
                Qeydiyyat gününə uyğun olaraq ödəniş günü avtomatik{' '}
                <strong>hər ayın {paymentDayOfMonth}-i</strong> olaraq təyin edildi.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Aylıq Ödəniş Məbləği (AZN) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qeydlər (İxtiyari)
              </label>
              <input
                type="text"
                placeholder="Məktəb, xüsusi qeyd..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
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
              Şagirdi Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

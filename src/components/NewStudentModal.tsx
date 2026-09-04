import React, { useState } from 'react';
import { X, UserPlus, Phone, Banknote, FileText, Calendar, Clock } from 'lucide-react';
import { Student } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface NewStudentModalProps {
  isOpen: boolean;
  groupId: string;
  defaultFee: number;
  onClose: () => void;
  onSave: (student: Omit<Student, 'id' | 'createdAt'>) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  groupId,
  defaultFee,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(getTodayDateString());
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [phone, setPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number | ''>(defaultFee || 80);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      groupId,
      name: name.trim(),
      enrollmentDate: enrollmentDate || getTodayDateString(),
      paymentDueDay: Number(paymentDueDay) || 5,
      phone: phone.trim() || undefined,
      monthlyFee: typeof monthlyFee === 'number' ? monthlyFee : (defaultFee || 80),
      notes: notes.trim() || undefined,
    });

    setName('');
    setEnrollmentDate(getTodayDateString());
    setPaymentDueDay(5);
    setPhone('');
    setMonthlyFee(defaultFee || 80);
    setNotes('');
    onClose();
  };

  return (
    <div
      id="new-student-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="new-student-modal-card"
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Yeni Şagird Əlavə Et</h2>
              <p className="text-xs text-slate-500 font-medium">Qrupa yeni şagird qeydiyyatı</p>
            </div>
          </div>
          <button
            id="close-new-student-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Şagirdin Adı və Soyadı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="student-name-input"
              required
              autoFocus
              placeholder="məs: Murad Əliyev"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          {/* Registration Date (Ay və gün) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              Kursa Qeydiyyat Tarixi (Ay və Gün) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
            />
            <p className="mt-1 text-[11px] text-slate-400 font-medium">
              Şagirdin adının qarşısında qeydiyyat tarixi kimi göstəriləcək
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-slate-400" />
                Aylıq Haqq (AZN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                id="student-fee-input"
                min="0"
                step="5"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Ödəniş Günü <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 bg-white focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Hər ayın {d}-i
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Əlaqə Nömrəsi (WhatsApp)
            </label>
            <input
              type="tel"
              id="student-phone-input"
              placeholder="050 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Qeydlər (Valideyn, sinif və s.)
            </label>
            <input
              type="text"
              id="student-notes-input"
              placeholder="məs: Anasının nömrəsi, 9-cu sinif..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
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
              id="submit-create-student-btn"
              disabled={!name.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              Əlavə Et
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

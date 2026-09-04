import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Calendar,
  Banknote,
  Phone,
  FileText,
  Clock,
  Check,
  Trash2,
} from 'lucide-react';
import { Student } from '../types';
import { getTodayDateString } from '../utils/dateUtils';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface EditStudentModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSave: (updatedStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onSave,
  onDeleteStudent,
}) => {
  const [name, setName] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number | ''>(80);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setEnrollmentDate(student.enrollmentDate || student.createdAt || getTodayDateString());
      setMonthlyFee(student.monthlyFee || 80);
      setPaymentDueDay(student.paymentDueDay || 5);
      setPhone(student.phone || '');
      setNotes(student.notes || '');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...student,
      name: name.trim(),
      enrollmentDate: enrollmentDate || getTodayDateString(),
      monthlyFee: typeof monthlyFee === 'number' ? monthlyFee : 80,
      paymentDueDay: Number(paymentDueDay) || 5,
      phone: phone.trim() || '',
      notes: notes.trim() || '',
    });
    onClose();
  };

  return (
    <div
      id="edit-student-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Şagird Məlumatlarını Düzəlt</h2>
              <p className="text-xs text-slate-500 font-medium">Qeydiyyat tarixi, ödəniş günü və məlumatlar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Şagirdin Adı və Soyadı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          {/* Registration / Enrollment Date */}
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
            <p className="mt-1 text-[11px] text-slate-500 font-medium">
              Şagirdin kursa qəbul olunduğu ay və gün
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Monthly fee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-slate-400" />
                Aylıq Haqq (AZN) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>

            {/* Payment Due Day */}
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

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Əlaqə Nömrəsi (WhatsApp)
            </label>
            <input
              type="text"
              placeholder="050 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              Ümumi Qeyd / Sinif
            </label>
            <input
              type="text"
              placeholder="məs: 10-cu sinif, valideyn: Aygün xanım..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
            {onDeleteStudent ? (
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Şagirdi Sil</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Yadda Saxla</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialogModal
        isOpen={isConfirmDeleteOpen}
        title="Şagirdi silmək istəyirsiniz?"
        message={`"${student.name}" adlı şagirdi qrupdan silmək istədiyinizə əminsiniz? Bütün əlaqəli ödəniş, davamiyyət və qeydlər də silinəcək.`}
        confirmText="Bəli, Şagirdi Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDeleteStudent?.(student.id);
          onClose();
        }}
        onClose={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};

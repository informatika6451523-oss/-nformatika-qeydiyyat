import React, { useState, useEffect } from 'react';
import { X, Edit2, Calendar, CreditCard, CheckCircle2, Trash2 } from 'lucide-react';
import { Student, Group } from '../types';
import { getDayFromDate } from '../utils/dateUtils';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  groups?: Group[];
  onSave: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  isOpen,
  onClose,
  student,
  groups,
  onSave,
  onDeleteStudent,
}) => {
  const [name, setName] = useState(student?.name || '');
  const [groupId, setGroupId] = useState(student?.groupId || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [monthlyFee, setMonthlyFee] = useState<number>(student?.monthlyFee || 80);
  const [enrollmentDate, setEnrollmentDate] = useState(student?.enrollmentDate || '');
  const [paymentDayOfMonth, setPaymentDayOfMonth] = useState<number>(
    student?.paymentDueDay || student?.paymentDayOfMonth || getDayFromDate(student?.enrollmentDate) || 1
  );
  const [notes, setNotes] = useState(student?.notes || '');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setGroupId(student.groupId);
      setPhone(student.phone || '');
      setParentPhone(student.parentPhone || '');
      setMonthlyFee(student.monthlyFee);
      setEnrollmentDate(student.enrollmentDate || '');
      setPaymentDayOfMonth(
        student.paymentDueDay ||
          student.paymentDayOfMonth ||
          getDayFromDate(student.enrollmentDate) ||
          1
      );
      setNotes(student.notes || '');
    }
  }, [student, isOpen]);

  // When enrollment date changes, automatically update payment day (User Request 7)
  const handleEnrollmentDateChange = (newDate: string) => {
    setEnrollmentDate(newDate);
    const day = getDayFromDate(newDate);
    if (day >= 1 && day <= 31) {
      setPaymentDayOfMonth(day);
    }
  };

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...student,
      name: name.trim(),
      groupId: groupId || student.groupId,
      phone: phone.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      monthlyFee: Number(monthlyFee) || 80,
      enrollmentDate: enrollmentDate || undefined,
      paymentDueDay: Number(paymentDayOfMonth) || 1,
      paymentDayOfMonth: Number(paymentDayOfMonth) || 1,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`"${student.name}" adlı şagirdi silmək istədiyinizə əminsiniz? Bütün ödəniş və davamiyyət qeydləri silinəcək.`)) {
      if (onDeleteStudent) {
        onDeleteStudent(student.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Edit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Şagird Məlumatlarını Yenilə</h3>
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
              Şagirdin Adı və Soyadı *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {groups && groups.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qrup
              </label>
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Şagirdin Nömrəsi
              </label>
              <input
                type="text"
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
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Registration Date & Payment day */}
          <div className="rounded-xl bg-blue-50/50 p-3.5 border border-blue-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Kursa Qeydiyyat Tarixi</span>
                </label>
                <input
                  type="date"
                  value={enrollmentDate}
                  onChange={(e) => handleEnrollmentDateChange(e.target.value)}
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
                Qeydiyyat gününə uyğun olaraq ödəniş günü avtomatik <strong>hər ayın {paymentDayOfMonth}-i</strong> seçildi.
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
                Qeydlər
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
            {onDeleteStudent && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Şagirdi Sil</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 ml-auto">
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
          </div>
        </form>
      </div>
    </div>
  );
};

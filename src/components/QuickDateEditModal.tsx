import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, AlertCircle } from 'lucide-react';
import { Student } from '../types';
import { formatFullDateAZ, getTodayDateString } from '../utils/dateUtils';

interface QuickDateEditModalProps {
  isOpen: boolean;
  student: Student | null;
  onClose: () => void;
  onSaveDate: (studentId: string, newDate: string) => void;
}

export const QuickDateEditModal: React.FC<QuickDateEditModalProps> = ({
  isOpen,
  student,
  onClose,
  onSaveDate,
}) => {
  const [date, setDate] = useState('');

  useEffect(() => {
    if (student) {
      setDate(student.enrollmentDate || student.createdAt || getTodayDateString());
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSaveDate(student.id, date);
      onClose();
    }
  };

  return (
    <div
      id="quick-date-edit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Qeydiyyat Tarixini Dəyiş</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">{student.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Yeni Qeydiyyat Tarixi (İl, Ay və Gün):
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
            />
            {date && (
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-blue-700 bg-blue-50/80 rounded-lg p-2 border border-blue-100">
                  Seçilmiş tarix: <span className="font-bold">{formatFullDateAZ(date)}</span>
                </p>
                {date.split('-')[2] && (
                  <p className="text-[11px] font-medium text-emerald-700 bg-emerald-50/80 rounded-lg px-2 py-1.5 border border-emerald-100 flex items-center gap-1">
                    <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                    Ödəniş günü avtomatik: <strong>Hər ayın {parseInt(date.split('-')[2], 10)}-i</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              30 günlük ödəniş dövrləri və "Ödənişi gecikdirənlər" siyahısı bu qeydiyyat tarixinə əsasən avtomatik yenilənəcək.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              Yadda Saxla
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

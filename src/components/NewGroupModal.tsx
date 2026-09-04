import React, { useState } from 'react';
import { X, Users, BookOpen, Clock, Banknote } from 'lucide-react';
import { Group } from '../types';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: Omit<Group, 'id' | 'createdAt'>) => void;
}

export const NewGroupModal: React.FC<NewGroupModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState<number | ''>(80);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      subject: subject.trim() || undefined,
      schedule: schedule.trim() || undefined,
      defaultMonthlyFee: typeof defaultMonthlyFee === 'number' ? defaultMonthlyFee : undefined,
    });

    setName('');
    setSubject('');
    setSchedule('');
    setDefaultMonthlyFee(80);
    onClose();
  };

  return (
    <div
      id="new-group-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="new-group-modal-card"
        className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Yeni Qrup Yarat</h2>
              <p className="text-xs text-slate-500 font-medium">Tələbələriniz üçün yeni qrup əlavə edin</p>
            </div>
          </div>
          <button
            id="close-new-group-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Qrupun Adı <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="group-name-input"
              required
              autoFocus
              placeholder="məs: Riyaziyyat - Qrup 1 və ya 10-cu sinif"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              Fənn (İstəyə bağlı)
            </label>
            <input
              type="text"
              id="group-subject-input"
              placeholder="məs: Riyaziyyat, İngilis dili, Fizika..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Cədvəl / Saat
              </label>
              <input
                type="text"
                id="group-schedule-input"
                placeholder="məs: B.e / Çər 16:00"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-slate-400" />
                Standart Haqq (AZN)
              </label>
              <input
                type="number"
                id="group-fee-input"
                min="0"
                step="5"
                placeholder="80"
                value={defaultMonthlyFee}
                onChange={(e) => setDefaultMonthlyFee(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>
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
              id="submit-create-group-btn"
              disabled={!name.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              Qrupu Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

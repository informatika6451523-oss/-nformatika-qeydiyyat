import React, { useState } from 'react';
import { X, Users, BookOpen, Clock, Calendar } from 'lucide-react';
import { Group } from '../types';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (groupData: Omit<Group, 'id' | 'createdAt'>) => void;
  onCreateGroup?: (groupData: Omit<Group, 'id' | 'createdAt'>) => void;
}

const WEEK_DAYS = [
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə',
  'Bazar',
];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onCreateGroup,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [defaultMonthlyFee, setDefaultMonthlyFee] = useState(80);
  const [scheduleDays, setScheduleDays] = useState<string[]>(['Bazar ertəsi', 'Cümə']);
  const [scheduleTime, setScheduleTime] = useState('15:00 - 16:30');

  if (!isOpen) return null;

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Omit<Group, 'id' | 'createdAt'> = {
      name: name.trim(),
      subject: subject.trim() || undefined,
      defaultMonthlyFee: Number(defaultMonthlyFee) || 80,
      scheduleDays,
      scheduleTime: scheduleTime.trim() || undefined,
    };

    if (onSave) onSave(data);
    else if (onCreateGroup) onCreateGroup(data);

    setName('');
    setSubject('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Yeni Qrup Yarat</h3>
              <p className="text-xs text-slate-500">Tədris qrupunuzun məlumatlarını qeyd edin</p>
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
              Qrup Adı *
            </label>
            <input
              type="text"
              required
              placeholder="məsələn: Qrup A - İngilis dili"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fənn
              </label>
              <input
                type="text"
                placeholder="İngilis dili, Riyaziyyat..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Standart Aylıq Ödəniş (AZN)
              </label>
              <input
                type="number"
                min="0"
                value={defaultMonthlyFee}
                onChange={(e) => setDefaultMonthlyFee(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Dərs Saatı
            </label>
            <input
              type="text"
              placeholder="15:00 - 16:30"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Dərs Günləri
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.map((day) => {
                const isSelected = scheduleDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
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
              Qrupu Yarat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

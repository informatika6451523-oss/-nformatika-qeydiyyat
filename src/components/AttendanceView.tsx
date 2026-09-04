import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import { Group, Student, AttendanceRecord, AttendanceStatus } from '../types';
import { formatFullDateAZ, getTodayDateString } from '../utils/dateUtils';

interface AttendanceViewProps {
  group: Group;
  students: Student[];
  attendance: AttendanceRecord[];
  onSetAttendance: (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => void;
  onMarkAllPresent: (date: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  group,
  students,
  attendance,
  onSetAttendance,
  onMarkAllPresent,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [noteStudentId, setNoteStudentId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Attendance for selected date in this group
  const dateRecords = attendance.filter(
    (a) => a.groupId === group.id && a.date === selectedDate
  );

  const getStudentStatus = (studentId: string): AttendanceStatus | null => {
    const rec = dateRecords.find((r) => r.studentId === studentId);
    return rec ? rec.status : null;
  };

  const getStudentNote = (studentId: string): string => {
    const rec = dateRecords.find((r) => r.studentId === studentId);
    return rec?.note || '';
  };

  // Stats for the selected day
  const presentCount = students.filter(
    (s) => getStudentStatus(s.id) === 'present'
  ).length;
  const absentCount = students.filter(
    (s) => getStudentStatus(s.id) === 'absent'
  ).length;
  const excusedCount = students.filter(
    (s) => getStudentStatus(s.id) === 'excused'
  ).length;

  // Change date by delta days
  const adjustDate = (deltaDays: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + deltaDays);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleOpenNote = (studentId: string) => {
    setNoteStudentId(studentId);
    setNoteText(getStudentNote(studentId));
  };

  const handleSaveNote = (studentId: string) => {
    const currentStatus = getStudentStatus(studentId) || 'present';
    onSetAttendance(studentId, selectedDate, currentStatus, noteText.trim());
    setNoteStudentId(null);
    setNoteText('');
  };

  return (
    <div className="space-y-5">
      {/* Date selector and Controls Card */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/90 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => adjustDate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Dünən"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 px-1">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer"
            />
            <span className="hidden sm:inline text-xs font-semibold text-slate-500">
              ({formatFullDateAZ(selectedDate)})
            </span>
          </div>

          <button
            onClick={() => adjustDate(1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title="Sabah"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {selectedDate !== getTodayDateString() && (
            <button
              onClick={() => setSelectedDate(getTodayDateString())}
              className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Bu gün
            </button>
          )}
        </div>

        {/* Quick action: Mark all present */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMarkAllPresent(selectedDate)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.99] transition-all cursor-pointer"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Hamını gəldi qeyd et</span>
          </button>
        </div>
      </div>

      {/* Daily attendance summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-center">
          <span className="text-xs font-semibold text-emerald-800">İştirak edir</span>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{presentCount}</p>
        </div>

        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 text-center">
          <span className="text-xs font-semibold text-rose-800">Qaib (Gəlməyib)</span>
          <p className="mt-1 text-2xl font-bold text-rose-900">{absentCount}</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 text-center">
          <span className="text-xs font-semibold text-amber-800">Üzrlü</span>
          <p className="mt-1 text-2xl font-bold text-amber-900">{excusedCount}</p>
        </div>
      </div>

      {/* Student attendance list */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        {students.length === 0 ? (
          <div className="py-14 text-center px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Bu qrupda hələ ki şagird yoxdur</h3>
            <p className="mt-1 text-xs text-slate-500">
              Davamiyyəti qeyd etmək üçün əvvəlcə şagird əlavə edin.
            </p>
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-5">Şagird & Ümumi Davamiyyət</div>
              <div className="col-span-4 text-center">Status Seçimi</div>
              <div className="col-span-3 text-right">Qeyd</div>
            </div>

            <div className="divide-y divide-slate-100">
              {students.map((student, index) => {
                const status = getStudentStatus(student.id);
                const note = getStudentNote(student.id);
                const isEditingThisNote = noteStudentId === student.id;

                // Calculate overall attendance for this student in this group
                const totalLogged = attendance.filter(
                  (a) => a.studentId === student.id && a.groupId === group.id
                ).length;
                const attendedCount = attendance.filter(
                  (a) =>
                    a.studentId === student.id &&
                    a.groupId === group.id &&
                    (a.status === 'present' || a.status === 'excused')
                ).length;
                const rate = totalLogged > 0 ? Math.round((attendedCount / totalLogged) * 100) : 100;

                return (
                  <div
                    key={student.id}
                    className="flex flex-col gap-3 p-4 sm:px-5 sm:py-3.5 sm:grid sm:grid-cols-12 sm:items-center hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Student Name and general rate */}
                    <div className="sm:col-span-5 flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 truncate">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{student.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">
                          Ümumi davamiyyət: <span className="font-bold text-slate-700">{rate}%</span>{' '}
                          ({attendedCount}/{totalLogged} dərs)
                        </p>
                      </div>
                    </div>

                    {/* Middle: Quick Status Buttons */}
                    <div className="sm:col-span-4 flex items-center justify-start sm:justify-center gap-1.5">
                      {/* Present */}
                      <button
                        onClick={() => onSetAttendance(student.id, selectedDate, 'present', note)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          status === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>İştirak edir</span>
                      </button>

                      {/* Absent */}
                      <button
                        onClick={() => onSetAttendance(student.id, selectedDate, 'absent', note)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          status === 'absent'
                            ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Qaib</span>
                      </button>

                      {/* Excused */}
                      <button
                        onClick={() => onSetAttendance(student.id, selectedDate, 'excused', note)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          status === 'excused'
                            ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Üzrlü</span>
                      </button>
                    </div>

                    {/* Right: Notes */}
                    <div className="sm:col-span-3 flex items-center justify-start sm:justify-end">
                      {isEditingThisNote ? (
                        <div className="flex items-center gap-1 w-full max-w-xs">
                          <input
                            type="text"
                            placeholder="Qeyd (məs: Gecikdi)..."
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(student.id);
                              if (e.key === 'Escape') setNoteStudentId(null);
                            }}
                            autoFocus
                            className="w-full rounded-lg border-2 border-indigo-400 px-2 py-1 text-xs text-slate-900 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveNote(student.id)}
                            className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                          >
                            Yadda saxla
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenNote(student.id)}
                          className={`flex items-center gap-1 text-xs rounded-lg px-2.5 py-1 transition-colors cursor-pointer ${
                            note
                              ? 'bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Dərs qeydi əlavə et"
                        >
                          <FileEdit className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[140px]">{note || '+ Qeyd'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

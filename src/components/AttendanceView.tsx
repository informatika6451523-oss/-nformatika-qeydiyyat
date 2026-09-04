import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Group, Student, AttendanceRecord, AttendanceStatus } from '../types';
import {
  getTodayDateString,
  formatFullDateAZ,
} from '../utils/dateUtils';

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

  const shiftDays = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const getStudentStatus = (studentId: string): AttendanceStatus | 'unmarked' => {
    const record = attendance.find(
      (a) =>
        a.groupId === group.id &&
        a.studentId === studentId &&
        a.date === selectedDate
    );
    return record ? record.status : 'unmarked';
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    onSetAttendance(studentId, selectedDate, status);
  };

  // Daily stats
  const dayRecords = attendance.filter(
    (a) => a.groupId === group.id && a.date === selectedDate
  );
  const presentCount = dayRecords.filter((a) => a.status === 'present').length;
  const absentCount = dayRecords.filter((a) => a.status === 'absent').length;
  const lateCount = dayRecords.filter((a) => a.status === 'late').length;
  const excusedCount = dayRecords.filter((a) => a.status === 'excused').length;

  return (
    <div className="space-y-5">
      {/* Date Bar & Controls */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => shiftDays(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Əvvəlki gün"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 px-1">
              <Calendar className="h-5 w-5 text-blue-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs sm:text-sm font-medium text-slate-500 hidden md:inline">
                ({formatFullDateAZ(selectedDate)})
              </span>
            </div>

            <button
              onClick={() => shiftDays(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Növbəti gün"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {selectedDate !== getTodayDateString() && (
              <button
                onClick={() => setSelectedDate(getTodayDateString())}
                className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 cursor-pointer ml-1"
              >
                Bugün
              </button>
            )}
          </div>

          {/* Quick Mark All Present */}
          <button
            onClick={() => onMarkAllPresent(selectedDate)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors cursor-pointer self-start sm:self-center"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Hamısını "İştirak edir" qeyd et</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-200/80">
            <span className="text-emerald-700 font-medium">İştirak edir:</span>
            <div className="text-base font-bold text-emerald-900 mt-0.5">
              {presentCount} nəfər
            </div>
          </div>

          <div className="rounded-xl bg-rose-50/80 p-3 border border-rose-200/80">
            <span className="text-rose-700 font-medium">Qayıb (Gəlməyib):</span>
            <div className="text-base font-bold text-rose-900 mt-0.5">
              {absentCount} nəfər
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-200/80">
            <span className="text-amber-700 font-medium">Gecikib:</span>
            <div className="text-base font-bold text-amber-900 mt-0.5">
              {lateCount} nəfər
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/80 p-3 border border-blue-200/80">
            <span className="text-blue-700 font-medium">Üzrlü:</span>
            <div className="text-base font-bold text-blue-900 mt-0.5">
              {excusedCount} nəfər
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {students.length === 0 ? (
          <div className="py-14 text-center px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              Bu qrupda şagird yoxdur
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Davamiyyət yazmaq üçün əvvəlcə şagird əlavə edin.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student, idx) => {
              const status = getStudentStatus(student.id);

              return (
                <div
                  key={student.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-400 w-5 text-center">
                      {idx + 1}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {student.phone || student.parentPhone || 'Əlaqə qeyd edilməyib'}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>İştirak edir</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Qayıb</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        status === 'late'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Gecikib</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(student.id, 'excused')}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        status === 'excused'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Üzrlü</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

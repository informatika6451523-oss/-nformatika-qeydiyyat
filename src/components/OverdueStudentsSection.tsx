import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CreditCard,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from 'lucide-react';
import { Group, Student, PaymentRecord } from '../types';
import {
  getCurrentMonthString,
  getPaymentDueStatusInfo,
  formatDayAndMonthAZ,
  formatFullDateAZ,
} from '../utils/dateUtils';

interface OverdueStudentsSectionProps {
  currentGroup: Group;
  allGroups: Group[];
  allStudents: Student[];
  allPayments: PaymentRecord[];
  onOpenPaymentModal: (student: Student) => void;
  onOpenReminderModal: (student: Student) => void;
  onOpenEditDateModal: (student: Student) => void;
}

export const OverdueStudentsSection: React.FC<OverdueStudentsSectionProps> = ({
  currentGroup,
  allGroups,
  allStudents,
  allPayments,
  onOpenPaymentModal,
  onOpenReminderModal,
  onOpenEditDateModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState<'current' | 'all'>('current');

  const currentMonth = getCurrentMonthString();

  const targetStudents =
    filterMode === 'current'
      ? allStudents.filter((s) => s.groupId === currentGroup.id)
      : allStudents;

  const overdueList = targetStudents
    .map((student) => {
      const isPaid = allPayments.some(
        (p) => p.studentId === student.id && p.forMonth === currentMonth
      );
      const statusInfo = getPaymentDueStatusInfo(student, currentMonth, isPaid);
      const group = allGroups.find((g) => g.id === student.groupId) || currentGroup;
      return {
        student,
        group,
        isPaid,
        statusInfo,
      };
    })
    .filter((item) => !item.isPaid && item.statusInfo.status === 'overdue');

  if (overdueList.length === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-rose-950">
                Ödənişi Gecikdirən Şagirdlər
              </h3>
              <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {overdueList.length} nəfər
              </span>
            </div>
            <p className="text-[11px] text-rose-700/90 mt-0.5">
              Qeydiyyat gününə əsasən cari ay ödəniş vaxtı tamamlanmış şagirdlər
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-lg bg-white/80 p-0.5 border border-rose-200 text-xs">
            <button
              onClick={() => setFilterMode('current')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterMode === 'current'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Cari Qrup
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Bütün Qruplar
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 divide-y divide-rose-100 rounded-xl bg-white border border-rose-200/80 overflow-hidden shadow-2xs">
          {overdueList.map(({ student, group, statusInfo }) => (
            <div
              key={student.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:px-4 gap-3 hover:bg-rose-50/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs mt-0.5">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {student.name}
                    </span>
                    {filterMode === 'all' && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {group.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-0.5">
                    <span className="text-rose-700 font-semibold">
                      {statusInfo.label} (Hər ayın {statusInfo.dueDay}-i)
                    </span>
                    <span>•</span>
                    <span>Məbləğ: {student.monthlyFee || 80} AZN</span>
                    {student.phone && (
                      <>
                        <span>•</span>
                        <span>Əlaqə: {student.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onOpenPaymentModal(student)}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer"
                  title="Ödənişi Qəbul Et"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Ödəniş Al</span>
                </button>

                <button
                  onClick={() => onOpenReminderModal(student)}
                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-2xs transition-colors cursor-pointer"
                  title="WhatsApp xatırlatması hazırla"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Xatırlat</span>
                </button>

                <button
                  onClick={() => onOpenEditDateModal(student)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Ödəniş gününü və ya qeydiyyat tarixini dəyiş"
                >
                  <Calendar className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

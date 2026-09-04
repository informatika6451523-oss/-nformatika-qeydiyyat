import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  Edit2,
  Bell,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Users,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { Student, PaymentRecord, Group } from '../types';
import {
  formatDayAndMonthAZ,
  formatFullDateAZ,
  getStudent30DayCycleInfo,
  getTodayDateString,
  Student30DayCycleInfo,
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

interface OverdueStudentItem {
  student: Student;
  groupName: string;
  cycleInfo: Student30DayCycleInfo;
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
  const [filterScope, setFilterScope] = useState<'current' | 'all'>('current');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const todayStr = getTodayDateString();

  // Filter students by scope (current group or all groups)
  const targetStudents =
    filterScope === 'current'
      ? allStudents.filter((s) => s.groupId === currentGroup.id)
      : allStudents;

  // Find students whose 30-day cycle is overdue
  const overdueList: OverdueStudentItem[] = [];

  targetStudents.forEach((student) => {
    const studentPayments = allPayments.filter((p) => p.studentId === student.id);
    const cycleInfo = getStudent30DayCycleInfo(
      student.enrollmentDate || student.createdAt,
      studentPayments,
      todayStr
    );

    if (cycleInfo.isOverdue) {
      const grp = allGroups.find((g) => g.id === student.groupId);
      overdueList.push({
        student,
        groupName: grp ? grp.name : 'Qrup',
        cycleInfo,
      });
    }
  });

  // Sort by most days overdue descending
  overdueList.sort((a, b) => b.cycleInfo.daysOverdue - a.cycleInfo.daysOverdue);

  // Quick WhatsApp message sender
  const handleQuickWhatsApp = (student: Student, cycleInfo: Student30DayCycleInfo) => {
    if (!student.phone) {
      onOpenReminderModal(student);
      return;
    }
    const cleanPhone = student.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('994')
      ? cleanPhone
      : cleanPhone.startsWith('0')
      ? `994${cleanPhone.slice(1)}`
      : `994${cleanPhone}`;

    const message = `Salam, hörmətli ${student.name}. Nəzərinizə çatdırmaq istərdik ki, kursa qeydiyyat tarixinizdən (${formatDayAndMonthAZ(
      student.enrollmentDate || student.createdAt
    )}) hesablanan 30 günlük ödəniş müddəti ${cycleInfo.daysOverdue} gündür gecikir. Zəhmət olmasa ${student.monthlyFee} AZN məbləğində ödənişi təmin edəsiniz. Təşəkkürlər!`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      id="overdue-students-section"
      className={`rounded-2xl transition-all duration-200 border shadow-xs ${
        overdueList.length > 0
          ? 'bg-gradient-to-b from-rose-50/70 via-white to-white border-rose-200/90'
          : 'bg-white border-slate-200/80'
      }`}
    >
      {/* Header bar */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between border-b border-rose-100/60">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              overdueList.length > 0
                ? 'bg-rose-100/80 text-rose-700 border-rose-200 shadow-xs'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            {overdueList.length > 0 ? (
              <AlertTriangle className="h-5 w-5 animate-pulse" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Ödənişi Gecikdirənlər
              </h2>
              {overdueList.length > 0 ? (
                <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                  {overdueList.length} şagird gecikir
                </span>
              ) : (
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  Gecikən yoxdur
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Qeydiyyat tarixindən hər 30 gündən bir ödənişi etməyən şagirdlər
            </p>
          </div>
        </div>

        {/* Filter controls and Collapse button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center rounded-xl bg-slate-100/90 p-1 text-xs border border-slate-200/70 shadow-2xs">
            <button
              onClick={() => setFilterScope('current')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterScope === 'current'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cari Qrup
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                filterScope === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bütün Qruplar
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Bölməni yığ' : 'Bölməni aç'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {overdueList.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-4 text-emerald-900">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="text-xs sm:text-sm font-medium">
                <span className="font-bold">Əla! </span>
                {filterScope === 'current'
                  ? `"${currentGroup.name}" qrupunda`
                  : 'Heç bir qrupda'}{' '}
                qeydiyyat tarixindən 30 günlük ödəniş müddətini gecikdirən şagird yoxdur.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {overdueList.map(({ student, groupName, cycleInfo }) => {
                  const registrationDateDisplay = formatDayAndMonthAZ(
                    student.enrollmentDate || student.createdAt
                  );
                  const fullRegistrationDate = formatFullDateAZ(
                    student.enrollmentDate || student.createdAt
                  );

                  return (
                    <div
                      key={student.id}
                      id={`overdue-student-card-${student.id}`}
                      className="flex flex-col justify-between rounded-xl border border-rose-200 bg-white p-4 shadow-xs hover:border-rose-300 hover:shadow-sm transition-all"
                    >
                      <div>
                        {/* Top: Student Name, Group Tag, and Overdue Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 truncate">
                                {student.name}
                              </span>
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                                {groupName}
                              </span>
                            </div>

                            {/* Clickable Registration Date badge with edit trigger */}
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200/90 px-2 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs"
                                title={`Qeydiyyat tarixi: ${fullRegistrationDate}`}
                              >
                                <Calendar className="h-3 w-3 text-blue-500" />
                                <span>Qeydiyyat: {registrationDateDisplay}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => onOpenEditDateModal(student)}
                                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                                title="Qeydiyyat tarixini düzəlt / dəyiş"
                              >
                                <Edit2 className="h-2.5 w-2.5" />
                                <span>Tarixi Dəyiş</span>
                              </button>
                            </div>
                          </div>

                          {/* Overdue Days Badge */}
                          <div className="shrink-0 text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-extrabold text-rose-700 border border-rose-200 shadow-2xs">
                              <Clock className="h-3 w-3 text-rose-600" />
                              {cycleInfo.daysOverdue > 0
                                ? `${cycleInfo.daysOverdue} gün gecikir`
                                : 'Bu gün son gündür'}
                            </span>
                          </div>
                        </div>

                        {/* Calculation details: 30-day deadline, fee, last payment */}
                        <div className="mt-3 rounded-lg bg-rose-50/50 p-2.5 border border-rose-100/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-700 font-medium">
                            <span className="text-slate-500">30 günlük son tarix:</span>
                            <span className="font-bold text-rose-900">
                              {cycleInfo.formattedDueDate} ({cycleInfo.dueDate})
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700 font-medium">
                            <span className="text-slate-500">Aylıq ödəniş məbləği:</span>
                            <span className="font-bold text-slate-900">{student.monthlyFee} AZN</span>
                          </div>

                          <div className="flex items-center justify-between text-slate-700 font-medium">
                            <span className="text-slate-500">Son qeydə alınan ödəniş:</span>
                            <span className="font-semibold text-slate-800">
                              {cycleInfo.lastPaymentDate
                                ? `${cycleInfo.formattedLastPaymentDate} (${cycleInfo.totalPaymentsCount} dəfə)`
                                : 'Heç ödəniş edilməyib (0 dəfə)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-slate-100 flex-wrap">
                        <button
                          onClick={() => onOpenPaymentModal(student)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-2xs transition-colors cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Ödəniş Qeyd Et</span>
                        </button>

                        <button
                          onClick={() => onOpenReminderModal(student)}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800 transition-colors cursor-pointer"
                          title="Ödəniş xatırlatması şablonu"
                        >
                          <Bell className="h-3.5 w-3.5 text-amber-600" />
                          <span>Xatırlat</span>
                        </button>

                        {student.phone && (
                          <button
                            onClick={() => handleQuickWhatsApp(student, cycleInfo)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-2 text-xs font-bold text-emerald-800 transition-colors cursor-pointer"
                            title="Birbaşa WhatsApp ilə xatırlatma göndər"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>WhatsApp</span>
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
      )}
    </div>
  );
};

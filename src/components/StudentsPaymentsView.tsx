import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  CreditCard,
  Edit2,
  Check,
  X,
  Trash2,
  Receipt,
  Phone,
  Calendar,
  AlertCircle,
  FileText,
  Bell,
  Clock,
  MessageSquare,
  History,
  MoreVertical,
} from 'lucide-react';
import { Group, Student, PaymentRecord, StudentNote } from '../types';
import {
  formatMonthName,
  formatFullDateAZ,
  formatDayAndMonthAZ,
  shiftMonth,
  getCurrentMonthString,
  getPaymentDueStatusInfo,
  getTodayDateString,
} from '../utils/dateUtils';
import { OverdueStudentsSection } from './OverdueStudentsSection';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface StudentsPaymentsViewProps {
  group: Group;
  allGroups: Group[];
  students: Student[];
  allStudents: Student[];
  payments: PaymentRecord[];
  notes: StudentNote[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenNewStudentModal: () => void;
  onOpenPaymentModal: (student: Student) => void;
  onOpenHistoryModal: (student: Student) => void;
  onOpenNotesModal: (student: Student) => void;
  onOpenReminderModal: (student: Student) => void;
  onOpenEditStudentModal: (student: Student) => void;
  onOpenEditDateModal: (student: Student) => void;
  onRenameStudent: (studentId: string, newName: string) => void;
  onUpdateStudentEnrollmentDate: (studentId: string, newDate: string) => void;
  onUpdateStudentFee: (studentId: string, newFee: number) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeletePayment: (paymentId: string) => void;
  onOpenReportModal?: () => void;
}

export const StudentsPaymentsView: React.FC<StudentsPaymentsViewProps> = ({
  group,
  allGroups,
  students,
  allStudents,
  payments,
  notes,
  selectedMonth,
  onSelectMonth,
  onOpenNewStudentModal,
  onOpenPaymentModal,
  onOpenHistoryModal,
  onOpenNotesModal,
  onOpenReminderModal,
  onOpenEditStudentModal,
  onOpenEditDateModal,
  onRenameStudent,
  onUpdateStudentEnrollmentDate,
  onUpdateStudentFee,
  onDeleteStudent,
  onDeletePayment,
  onOpenReportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'overdue'>('all');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Month payment calculations
  const totalStudents = students.length;

  const studentPaymentStatusList = students.map((student) => {
    const studentPayment = payments.find(
      (p) => p.studentId === student.id && p.forMonth === selectedMonth
    );
    const isPaid = !!studentPayment && studentPayment.amount > 0;
    const statusInfo = getPaymentDueStatusInfo(student, selectedMonth, isPaid);

    return {
      student,
      payment: studentPayment,
      isPaid,
      statusInfo,
    };
  });

  const paidStudentsCount = studentPaymentStatusList.filter((s) => s.isPaid).length;
  const unpaidStudents = studentPaymentStatusList.filter((s) => !s.isPaid);
  const overdueStudents = unpaidStudents.filter((s) => s.statusInfo.status === 'overdue');
  const dueSoonStudents = unpaidStudents.filter(
    (s) => s.statusInfo.status === 'due_soon' || s.statusInfo.status === 'due_today'
  );

  const totalCollected = studentPaymentStatusList.reduce(
    (acc, curr) => acc + (curr.payment?.amount || 0),
    0
  );

  const totalExpected = students.reduce(
    (acc, curr) => acc + (curr.monthlyFee || group.defaultMonthlyFee || 80),
    0
  );

  const filteredStudents = studentPaymentStatusList.filter(({ student, isPaid, statusInfo }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phone && student.phone.includes(searchQuery)) ||
      (student.parentPhone && student.parentPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (statusFilter === 'paid') return isPaid;
    if (statusFilter === 'due') return !isPaid;
    if (statusFilter === 'overdue') return !isPaid && statusInfo.status === 'overdue';

    return true;
  });

  const startRename = (student: Student) => {
    setEditingStudentId(student.id);
    setTempName(student.name);
  };

  const saveRename = (studentId: string) => {
    if (tempName.trim()) {
      onRenameStudent(studentId, tempName.trim());
    }
    setEditingStudentId(null);
  };

  return (
    <div className="space-y-5">
      {/* Overdue alert component at top */}
      <OverdueStudentsSection
        currentGroup={group}
        allGroups={allGroups}
        allStudents={allStudents}
        allPayments={payments}
        onOpenPaymentModal={onOpenPaymentModal}
        onOpenReminderModal={onOpenReminderModal}
        onOpenEditDateModal={onOpenEditDateModal}
      />

      {/* Month Navigation & Summary Bar */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-2xs border border-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Month Selector */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectMonth(shiftMonth(selectedMonth, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Əvvəlki ay"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 px-1">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                {formatMonthName(selectedMonth)}
              </span>
              {selectedMonth !== getCurrentMonthString() && (
                <button
                  onClick={() => onSelectMonth(getCurrentMonthString())}
                  className="rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer ml-1"
                >
                  Cari ay
                </button>
              )}
            </div>

            <button
              onClick={() => onSelectMonth(shiftMonth(selectedMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Növbəti ay"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Quick summary stats */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200/70">
              <span className="text-slate-500 font-medium">Ödəyənlər:</span>{' '}
              <span className="font-bold text-slate-800">
                {paidStudentsCount} / {totalStudents}
              </span>{' '}
              <span className="text-slate-500 font-semibold">
                ({totalStudents > 0 ? Math.round((paidStudentsCount / totalStudents) * 100) : 0}%)
              </span>
            </div>

            <div className="rounded-xl bg-emerald-50/80 px-3.5 py-2 border border-emerald-200/80">
              <span className="text-emerald-800 font-medium">Toplanan:</span>{' '}
              <span className="font-bold text-emerald-900 text-sm">{totalCollected} AZN</span>
              {totalExpected > 0 && (
                <span className="text-emerald-700/80"> / {totalExpected} AZN</span>
              )}
            </div>
          </div>
        </div>

        {/* Mini progress bar */}
        {totalStudents > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
              <span>Aylıq yığım faizi</span>
              <span>
                {Math.round((paidStudentsCount / totalStudents) * 100)}% ({paidStudentsCount} nəfər ödəyib)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((paidStudentsCount / totalStudents) * 100)
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action and Search bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Şagird axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 text-xs shadow-2xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-2.5 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Hamısı ({totalStudents})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`rounded-lg px-2.5 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'paid'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Ödəyənlər ({paidStudentsCount})
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`rounded-lg px-2.5 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'due'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Ödəməyənlər ({unpaidStudents.length})
            </button>
            {overdueStudents.length > 0 && (
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`rounded-lg px-2.5 py-1.5 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Gecikənlər ({overdueStudents.length})
              </button>
            )}
          </div>
        </div>

        {/* Buttons: Hesabat + Yeni Şagird */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenReportModal && (
            <button
              id="view-group-report-btn"
              onClick={onOpenReportModal}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs active:scale-[0.99] transition-all cursor-pointer"
              title="Qruplar və şagirdlər üzrə PDF və Word hesabatı çıxar"
            >
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Hesabat</span>
            </button>
          )}

          <button
            id="add-new-student-btn"
            onClick={onOpenNewStudentModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Yeni Şagird Əlavə Et</span>
          </button>
        </div>
      </div>

      {/* Students List Card */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        {filteredStudents.length === 0 ? (
          <div className="py-14 text-center px-4">
            <AlertCircle className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              {searchQuery || statusFilter !== 'all'
                ? 'Axtarışa və ya filtrə uyğun şagird tapılmadı'
                : 'Bu qrupda hələ ki şagird yoxdur'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Filtr və ya axtarış sözünü dəyişməyə çalışın.'
                : 'Yuxarıdakı "Yeni Şagird Əlavə Et" düyməsindən istifadə edərək şagirdlərinizi daxil edin.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredStudents.map(({ student, payment, isPaid, statusInfo }) => {
              const studentNotesCount = notes.filter((n) => n.studentId === student.id).length;
              const dueDay = student.paymentDayOfMonth || 1;

              return (
                <div
                  key={student.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left info: Name & Contacts */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                      {student.name.charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      {editingStudentId === student.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="rounded-lg border border-blue-500 px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(student.id);
                              if (e.key === 'Escape') setEditingStudentId(null);
                            }}
                          />
                          <button
                            onClick={() => saveRename(student.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudentId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {student.name}
                          </h4>
                          <button
                            onClick={() => startRename(student)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            title="Adı dəyiş"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      {/* Details row: Phones & enrollment */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {student.phone}
                          </span>
                        )}
                        {student.parentPhone && (
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">Valideyn:</span> {student.parentPhone}
                          </span>
                        )}
                        {student.enrollmentDate && (
                          <button
                            onClick={() => onOpenEditDateModal(student)}
                            className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer"
                            title="Qeydiyyat tarixini dəyiş"
                          >
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span>Qeydiyyat: {formatFullDateAZ(student.enrollmentDate)}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle info: Payment Day & Status Badge */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0">
                    {/* Payment day badge */}
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400 font-medium">Ödəniş Günü</div>
                      <button
                        onClick={() => onOpenEditDateModal(student)}
                        className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Ödəniş gününü dəyiş"
                      >
                        Hər ayın {dueDay}-i
                      </button>
                    </div>

                    {/* Fee amount */}
                    <div className="text-left sm:text-right">
                      <div className="text-[11px] text-slate-400 font-medium">Aylıq Haqq</div>
                      <div className="text-xs font-bold text-slate-900">
                        {student.monthlyFee || group.defaultMonthlyFee || 80} AZN
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="min-w-32">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusInfo.badgeClass}`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : statusInfo.status === 'overdue' ? (
                          <AlertCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {statusInfo.label}
                          {isPaid && ` (${payment?.amount} AZN)`}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      onClick={() => onOpenPaymentModal(student)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold shadow-2xs transition-colors cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      title={isPaid ? 'Ödənişi redaktə et və ya yenilə' : 'Ödənişi Qəbul Et'}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>{isPaid ? 'Ödənilib' : 'Ödəniş Al'}</span>
                    </button>

                    <button
                      onClick={() => onOpenHistoryModal(student)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="Ödəniş Tarixçəsi"
                    >
                      <History className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onOpenReminderModal(student)}
                      className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl cursor-pointer"
                      title="WhatsApp Xatırlatması"
                    >
                      <Bell className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onOpenNotesModal(student)}
                      className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"
                      title="Şagird Qeydləri"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {studentNotesCount > 0 && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </button>

                    <button
                      onClick={() => onOpenEditStudentModal(student)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title="Şagird məlumatlarına düzəliş et"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      title="Şagirdi sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Student Modal */}
      <ConfirmDialogModal
        isOpen={!!studentToDelete}
        title="Şagirdi Sil"
        message={`"${studentToDelete?.name}" adlı şagirdi silmək istədiyinizə əminsiniz? Bu əməliyyat şagirdin ödəniş və davamiyyət qeydlərini də təmizləyəcək.`}
        confirmLabel="Bəli, Sil"
        confirmVariant="danger"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />
    </div>
  );
};

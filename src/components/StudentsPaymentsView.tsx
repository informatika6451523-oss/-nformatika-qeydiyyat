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
  AlertTriangle,
  BookOpen,
  SlidersHorizontal,
  Settings
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'overdue'>('all');

  // For in-place student renaming
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // For in-place registration date editing
  const [editingDateStudentId, setEditingDateStudentId] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState('');

  // Confirmation modals state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [paymentToDeleteId, setPaymentToDeleteId] = useState<string | null>(null);

  // Payments for selected month in this group
  const monthPayments = payments.filter(
    (p) => p.groupId === group.id && p.forMonth === selectedMonth
  );

  // Calculate statistics
  const totalStudents = students.length;
  const paidStudentsCount = students.filter((s) =>
    monthPayments.some((p) => p.studentId === s.id)
  ).length;
  const unpaidStudents = students.filter(
    (s) => !monthPayments.some((p) => p.studentId === s.id)
  );

  const overdueStudents = unpaidStudents.filter((s) => {
    const status = getPaymentDueStatusInfo(selectedMonth, s.paymentDueDay, false);
    return status.status === 'overdue';
  });

  const dueSoonStudents = unpaidStudents.filter((s) => {
    const status = getPaymentDueStatusInfo(selectedMonth, s.paymentDueDay, false);
    return status.status === 'due_soon';
  });

  const totalCollected = monthPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpected = students.reduce((sum, s) => sum + (s.monthlyFee || 0), 0);

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isPaid = monthPayments.some((p) => p.studentId === s.id);
    if (statusFilter === 'paid') return isPaid;
    if (statusFilter === 'due') return !isPaid;
    if (statusFilter === 'overdue') {
      if (isPaid) return false;
      const status = getPaymentDueStatusInfo(selectedMonth, s.paymentDueDay, false);
      return status.status === 'overdue';
    }
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

  const cancelRename = () => {
    setEditingStudentId(null);
    setTempName('');
  };

  const startEditDate = (student: Student) => {
    setEditingDateStudentId(student.id);
    setTempDate(student.enrollmentDate || student.createdAt || getTodayDateString());
  };

  const saveEditDate = (studentId: string) => {
    if (tempDate) {
      onUpdateStudentEnrollmentDate(studentId, tempDate);
    }
    setEditingDateStudentId(null);
  };

  const cancelEditDate = () => {
    setEditingDateStudentId(null);
    setTempDate('');
  };

  return (
    <div className="space-y-5">
      {/* Üstdə "Ödənişi Gecikdirənlər" Bölməsi (Qeydiyyat tarixindən hər 30 gündən bir) */}
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
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200/90">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Month Selector */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectMonth(shiftMonth(selectedMonth, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
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
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
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
              <span>Aylıq yığım irəliləyişi</span>
              <span>
                {Math.round((paidStudentsCount / totalStudents) * 100)}% ({paidStudentsCount} şagird)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((paidStudentsCount / totalStudents) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Automated Reminder Alert Banner if any student is overdue or due soon */}
      {(overdueStudents.length > 0 || dueSoonStudents.length > 0) && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
              <Bell className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Ödəniş Xatırlatması Sistemi
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Bu ay üçün{' '}
                {overdueStudents.length > 0 && (
                  <span className="font-bold text-rose-700">
                    {overdueStudents.length} şagirdin ödəniş vaxtı gecikir
                  </span>
                )}
                {overdueStudents.length > 0 && dueSoonStudents.length > 0 && ' və '}
                {dueSoonStudents.length > 0 && (
                  <span className="font-bold text-amber-700">
                    {dueSoonStudents.length} şagirdin son ödəniş günü yaxınlaşır
                  </span>
                )}
                . Şagird və ya valideynə avtomatlaşdırılmış xatırlatma göndərə bilərsiniz.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const target = overdueStudents[0] || dueSoonStudents[0];
                if (target) onOpenReminderModal(target);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-500 transition-colors cursor-pointer"
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Xatırlatma Göndər</span>
            </button>
          </div>
        </div>
      )}

      {/* Action and Search bar with Status Filter */}
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
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
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
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-slate-200 text-xs shadow-xs overflow-x-auto">
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

        <button
          id="add-new-student-btn"
          onClick={onOpenNewStudentModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Yeni Şagird Əlavə Et</span>
        </button>
      </div>

      {/* Students List / Table Card */}
      <div className="overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm">
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
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-3 inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Bütün şagirdləri göstər
              </button>
            )}
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={onOpenNewStudentModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                İlk şagirdi əlavə et
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-5">Qeydiyyat Tarixi & Şagird</div>
              <div className="col-span-4">{formatMonthName(selectedMonth)} Statusu (Ödənilib / Ödənməyib)</div>
              <div className="col-span-3 text-right">Əməliyyatlar & Qeydlər</div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredStudents.map((student, index) => {
                const studentMonthPayment = monthPayments.find((p) => p.studentId === student.id);
                const isPaid = !!studentMonthPayment;
                const isRenaming = editingStudentId === student.id;
                const statusInfo = getPaymentDueStatusInfo(
                  selectedMonth,
                  student.paymentDueDay,
                  isPaid
                );

                const studentNotesCount = notes.filter((n) => n.studentId === student.id).length;
                const registrationDateDisplay = formatDayAndMonthAZ(
                  student.enrollmentDate || student.createdAt
                );

                return (
                  <div
                    key={student.id}
                    id={`student-row-${student.id}`}
                    className="flex flex-col gap-3 p-4 sm:px-5 sm:py-3.5 lg:grid lg:grid-cols-12 lg:items-center hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Left: Index, Kursa qeydiyyat tarixi (ay və gün), Name & Rename, Contact info */}
                    <div className="lg:col-span-5 flex items-start sm:items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 mt-0.5 sm:mt-0">
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        {/* Name and Enrollment Date display */}
                        {isRenaming ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(student.id);
                                if (e.key === 'Escape') cancelRename();
                              }}
                              autoFocus
                              className="rounded-lg border-2 border-blue-500 px-2 py-0.5 text-sm font-bold text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => saveRename(student.id)}
                              className="rounded-md bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 cursor-pointer"
                              title="Yadda saxla"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={cancelRename}
                              className="rounded-md bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 cursor-pointer"
                              title="Ləğv et"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap group">
                            {/* Kursa qeydiyyat olunduğu ay və gün - şagirdin adının önündə və düzəliş edilə bilən */}
                            {editingDateStudentId === student.id ? (
                              <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-lg border border-blue-200">
                                <input
                                  type="date"
                                  value={tempDate}
                                  onChange={(e) => setTempDate(e.target.value)}
                                  className="rounded border border-blue-400 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveEditDate(student.id)}
                                  className="rounded bg-emerald-600 p-1 text-white hover:bg-emerald-700 cursor-pointer"
                                  title="Tarixi yadda saxla"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditDate}
                                  className="rounded bg-slate-200 p-1 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                  title="Ləğv et"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 group/date">
                                <button
                                  type="button"
                                  onClick={() => onOpenEditDateModal(student)}
                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/90 px-2 py-0.5 text-[11px] font-bold text-blue-700 shadow-2xs transition-colors cursor-pointer"
                                  title={`Kursa qeydiyyat tarixi: ${student.enrollmentDate || student.createdAt}. Dəyişmək üçün klikləyin`}
                                >
                                  <Calendar className="h-3 w-3 text-blue-500" />
                                  <span>Qeydiyyat: {registrationDateDisplay}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => startEditDate(student)}
                                  className="rounded p-0.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer opacity-80 hover:opacity-100"
                                  title="Qeydiyyat tarixini dərhal düzəlt"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}

                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {student.name}
                            </span>

                            <button
                              onClick={() => startRename(student)}
                              title="Şagirdin adını tez dəyiş"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Secondary details: Fee, Due Day, Phone */}
                        <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">
                            Aylıq: <span className="text-slate-900">{student.monthlyFee} AZN</span>
                          </span>

                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            • <Clock className="h-3 w-3 text-slate-400" />
                            Ödəniş günü: Hər ayın {student.paymentDueDay || 5}-i
                          </span>

                          {student.phone && (
                            <span className="flex items-center gap-1 text-slate-500">
                              • <Phone className="h-3 w-3 text-slate-400" /> {student.phone}
                            </span>
                          )}

                          {student.notes && (
                            <span className="flex items-center gap-1 text-slate-400" title={student.notes}>
                              • <FileText className="h-3 w-3" /> {student.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Payment status for selected month (Paid vs Due) */}
                    <div className="lg:col-span-4">
                      {isPaid ? (
                        <div className="inline-block rounded-xl bg-emerald-50/90 border border-emerald-200 px-3 py-1.5 shadow-2xs">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs font-bold text-emerald-800">
                              Ödənilib ({studentMonthPayment.amount} AZN)
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-emerald-700">
                            Ödəniş tarixi:{' '}
                            <span className="font-semibold">
                              {formatFullDateAZ(studentMonthPayment.paymentDate)}
                            </span>
                            {studentMonthPayment.paymentMethod && (
                              <span className="ml-1 opacity-80">
                                ({studentMonthPayment.paymentMethod === 'cash' ? 'Nağd' : studentMonthPayment.paymentMethod === 'm10' ? 'M10/Kart' : 'Köçürmə'})
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={`inline-block rounded-xl border px-3 py-1.5 shadow-2xs ${statusInfo.badgeClass}`}>
                          <div className="flex items-center gap-1.5">
                            {statusInfo.status === 'overdue' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                            ) : statusInfo.status === 'due_soon' ? (
                              <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="text-xs font-bold">
                              Status: {statusInfo.label}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] opacity-85">
                            Son tarix: <span className="font-semibold">{statusInfo.formattedDueDate}</span> • Məbləğ: <span className="font-semibold">{student.monthlyFee} AZN</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Actions: Payment, Reminder, Notes, Edit, History, Delete */}
                    <div className="lg:col-span-3 flex flex-wrap items-center justify-start lg:justify-end gap-1.5">
                      {isPaid ? (
                        <button
                          onClick={() => setPaymentToDeleteId(studentMonthPayment.id)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Ödənişi geri qaytar / sil"
                        >
                          Ödənişi sil
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onOpenPaymentModal(student)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                            title="Ödənişi qeyd et"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            <span>Ödəniş Qeyd Et</span>
                          </button>

                          {/* Reminder button */}
                          <button
                            onClick={() => onOpenReminderModal(student)}
                            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer border ${
                              statusInfo.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : statusInfo.status === 'due_soon'
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Ödəniş xatırlatması hazırla və göndər"
                          >
                            <Bell className="h-3.5 w-3.5" />
                            <span>Xatırlat</span>
                          </button>
                        </>
                      )}

                      {/* Notes button */}
                      <button
                        onClick={() => onOpenNotesModal(student)}
                        className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          studentNotesCount > 0
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Şagirdin qeydlərini aç və əlavə et"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Qeydlər</span>
                        {studentNotesCount > 0 && (
                          <span className="rounded-full bg-indigo-600 px-1.5 text-[10px] text-white font-bold">
                            {studentNotesCount}
                          </span>
                        )}
                      </button>

                      {/* Edit full details */}
                      <button
                        onClick={() => onOpenEditStudentModal(student)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Şagird məlumatlarını redaktə et (Qeydiyyat tarixi, ödəniş günü və s.)"
                      >
                        <Settings className="h-4 w-4" />
                      </button>

                      {/* History */}
                      <button
                        onClick={() => onOpenHistoryModal(student)}
                        className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                        title="Bütün ödəniş tarixçəsi"
                      >
                        <Receipt className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setStudentToDelete(student)}
                        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Şagirdi qrupdan sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Student Deletion */}
      <ConfirmDialogModal
        isOpen={studentToDelete !== null}
        title="Şagirdi qrupdan silmək istəyirsiniz?"
        message={`"${studentToDelete?.name}" adlı şagirdi bu qrupdan silmək istədiyinizə əminsiniz? Şagirdə aid olan ödəniş, davamiyyət və qeyd məlumatları da təmizlənəcək.`}
        confirmText="Bəli, Şagirdi Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />

      {/* Confirmation Modal for Payment Deletion */}
      <ConfirmDialogModal
        isOpen={paymentToDeleteId !== null}
        title="Ödəniş qeydini silmək istəyirsiniz?"
        message="Bu ay üçün edilmiş ödəniş qeydini silmək istədiyinizə əminsiniz? Şagird yenidən ödəniş borclu kimi görünəcək."
        confirmText="Ödənişi Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          if (paymentToDeleteId) {
            onDeletePayment(paymentToDeleteId);
            setPaymentToDeleteId(null);
          }
        }}
        onClose={() => setPaymentToDeleteId(null)}
      />
    </div>
  );
};

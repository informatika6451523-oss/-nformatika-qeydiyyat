import React, { useState, useEffect } from 'react';
import {
  Sidebar
} from './components/Sidebar';
import { GroupHeader } from './components/GroupHeader';
import { StudentsPaymentsView } from './components/StudentsPaymentsView';
import { AttendanceView } from './components/AttendanceView';
import { PaymentHistoryView } from './components/PaymentHistoryView';
import { NewGroupModal } from './components/NewGroupModal';
import { NewStudentModal } from './components/NewStudentModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { StudentPaymentHistoryModal } from './components/StudentPaymentHistoryModal';
import { StudentNotesModal } from './components/StudentNotesModal';
import { PaymentReminderModal } from './components/PaymentReminderModal';
import { EditStudentModal } from './components/EditStudentModal';
import { QuickDateEditModal } from './components/QuickDateEditModal';
import { CloudAccountModal } from './components/CloudAccountModal';
import {
  Group,
  Student,
  PaymentRecord,
  AttendanceRecord,
  AttendanceStatus,
  ActiveTab,
  NoteCategory,
  StudentNote,
} from './types';
import { loadAppData, saveAppData, AppData } from './utils/storage';
import { getCurrentMonthString, getTodayDateString } from './utils/dateUtils';
import { type User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  checkHasCloudData,
  uploadLocalDataToCloud,
  subscribeToUserCloudData,
  fetchUserCloudData,
  cloudSaveGroup,
  cloudDeleteGroup,
  cloudSaveStudent,
  cloudDeleteStudent,
  cloudSavePayment,
  cloudDeletePayment,
  cloudSaveAttendance,
  cloudSaveNote,
  cloudDeleteNote,
} from './utils/firebase';
import { Users, Plus, BookOpen, Sparkles } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => {
    const initial = loadAppData();
    return initial.groups.length > 0 ? initial.groups[0].id : null;
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('students_payments');

  // Firebase Auth and Cloud Sync state
  const [user, setUser] = useState<User | null>(null);
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('İndi');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Modals state
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null);
  const [historyModalStudent, setHistoryModalStudent] = useState<Student | null>(null);
  const [notesModalStudent, setNotesModalStudent] = useState<Student | null>(null);
  const [reminderModalStudent, setReminderModalStudent] = useState<Student | null>(null);
  const [editStudentModalStudent, setEditStudentModalStudent] = useState<Student | null>(null);
  const [quickDateModalStudent, setQuickDateModalStudent] = useState<Student | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSyncStatus('synced');
      }
    });

    return () => unsubscribe();
  }, []);

  // Firebase Cloud Data real-time synchronization
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    let unsubscribeSync: (() => void) | null = null;

    const initCloud = async () => {
      setSyncStatus('syncing');
      try {
        const hasData = await checkHasCloudData(user.uid);
        if (!hasData) {
          // Upload local data to Firestore if cloud is brand new and local data has entries
          const currentLocal = loadAppData();
          if (currentLocal.groups.length > 0 || currentLocal.students.length > 0) {
            await uploadLocalDataToCloud(user.uid, currentLocal);
          }
        } else {
          // Cloud already has data (e.g. from spouse's phone) - load immediately
          const cloudData = await fetchUserCloudData(user.uid);
          if (cloudData && isMounted) {
            setData(cloudData);
            saveAppData(cloudData);
          }
        }

        unsubscribeSync = subscribeToUserCloudData(user.uid, (cloudPartial) => {
          if (!isMounted) return;
          setData((prev) => {
            const updated: AppData = {
              groups: cloudPartial.groups !== undefined ? cloudPartial.groups : prev.groups,
              students: cloudPartial.students !== undefined ? cloudPartial.students : prev.students,
              payments: cloudPartial.payments !== undefined ? cloudPartial.payments : prev.payments,
              attendance: cloudPartial.attendance !== undefined ? cloudPartial.attendance : prev.attendance,
              notes: cloudPartial.notes !== undefined ? cloudPartial.notes : prev.notes,
            };
            saveAppData(updated);
            return updated;
          });
          setSyncStatus('synced');
          const now = new Date();
          setLastSyncedTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        });
      } catch (err) {
        console.error('Bulud sinxronizasiyası baş tutmadı:', err);
        setSyncStatus('error');
      }
    };

    initCloud();

    return () => {
      isMounted = false;
      if (unsubscribeSync) unsubscribeSync();
    };
  }, [user]);

  // Sync to localStorage whenever data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Keep selectedGroupId valid if groups change
  useEffect(() => {
    if (selectedGroupId && !data.groups.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(data.groups.length > 0 ? data.groups[0].id : null);
    } else if (!selectedGroupId && data.groups.length > 0) {
      setSelectedGroupId(data.groups[0].id);
    }
  }, [data.groups, selectedGroupId]);

  const activeGroup = data.groups.find((g) => g.id === selectedGroupId) || null;
  const activeStudents = activeGroup
    ? data.students.filter((s) => s.groupId === activeGroup.id)
    : [];

  // 1. Group handlers
  const handleCreateGroup = (newGroupData: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...newGroupData,
      id: `group_${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setData((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
    setSelectedGroupId(newGroup.id);
    if (user) {
      cloudSaveGroup(user.uid, newGroup);
    }
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    setData((prev) => {
      const updatedGroups = prev.groups.map((g) =>
        g.id === groupId ? { ...g, name: newName } : g
      );
      const updatedGroup = updatedGroups.find((g) => g.id === groupId);
      if (user && updatedGroup) {
        cloudSaveGroup(user.uid, updatedGroup);
      }
      return {
        ...prev,
        groups: updatedGroups,
      };
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setData((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
      students: prev.students.filter((s) => s.groupId !== groupId),
      payments: prev.payments.filter((p) => p.groupId !== groupId),
      attendance: prev.attendance.filter((a) => a.groupId !== groupId),
    }));
    if (user) {
      cloudDeleteGroup(groupId);
    }
  };

  // 2. Student handlers
  const handleCreateStudent = (newStudentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `student_${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setData((prev) => ({
      ...prev,
      students: [...prev.students, newStudent],
    }));
    if (user) {
      cloudSaveStudent(user.uid, newStudent);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    }));
    if (user) {
      cloudSaveStudent(user.uid, updatedStudent);
    }
  };

  const handleRenameStudent = (studentId: string, newName: string) => {
    setData((prev) => {
      const updatedStudents = prev.students.map((s) =>
        s.id === studentId ? { ...s, name: newName } : s
      );
      const target = updatedStudents.find((s) => s.id === studentId);
      if (user && target) {
        cloudSaveStudent(user.uid, target);
      }
      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  const handleUpdateStudentEnrollmentDate = (studentId: string, newDate: string) => {
    setData((prev) => {
      const updatedStudents = prev.students.map((s) =>
        s.id === studentId ? { ...s, enrollmentDate: newDate } : s
      );
      const target = updatedStudents.find((s) => s.id === studentId);
      if (user && target) {
        cloudSaveStudent(user.uid, target);
      }
      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  const handleUpdateStudentFee = (studentId: string, newFee: number) => {
    setData((prev) => {
      const updatedStudents = prev.students.map((s) =>
        s.id === studentId ? { ...s, monthlyFee: newFee } : s
      );
      const target = updatedStudents.find((s) => s.id === studentId);
      if (user && target) {
        cloudSaveStudent(user.uid, target);
      }
      return {
        ...prev,
        students: updatedStudents,
      };
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
      payments: prev.payments.filter((p) => p.studentId !== studentId),
      attendance: prev.attendance.filter((a) => a.studentId !== studentId),
      notes: prev.notes.filter((n) => n.studentId !== studentId),
    }));
    if (user) {
      cloudDeleteStudent(studentId);
    }
  };

  // 3. Notes handlers
  const handleAddNote = (studentId: string, category: NoteCategory, content: string) => {
    const now = new Date();
    const dateStr = `${getTodayDateString()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newNote: StudentNote = {
      id: `note_${Date.now()}`,
      studentId,
      category,
      content,
      createdAt: dateStr,
    };
    setData((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));
    if (user) {
      cloudSaveNote(user.uid, newNote);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
    if (user) {
      cloudDeleteNote(noteId);
    }
  };

  // 4. Payment handlers
  const handleRecordPayment = (paymentData: Omit<PaymentRecord, 'id' | 'createdAt'>) => {
    // Remove existing payment for same student and same forMonth to avoid duplicates
    const filteredExisting = data.payments.filter(
      (p) => !(p.studentId === paymentData.studentId && p.forMonth === paymentData.forMonth)
    );

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `payment_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      payments: [...filteredExisting, newPayment],
    }));
    if (user) {
      cloudSavePayment(user.uid, newPayment);
    }
  };

  const handleDeletePayment = (paymentId: string) => {
    setData((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== paymentId),
    }));
    if (user) {
      cloudDeletePayment(paymentId);
    }
  };

  // 5. Attendance handlers
  const handleSetAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    note?: string
  ) => {
    if (!activeGroup) return;

    let targetRecord: AttendanceRecord;

    setData((prev) => {
      const existingIndex = prev.attendance.findIndex(
        (a) => a.studentId === studentId && a.date === date && a.groupId === activeGroup.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev.attendance];
        targetRecord = {
          ...updated[existingIndex],
          status,
          note,
        };
        updated[existingIndex] = targetRecord;
        return { ...prev, attendance: updated };
      } else {
        targetRecord = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          studentId,
          groupId: activeGroup.id,
          date,
          status,
          note,
        };
        return { ...prev, attendance: [...prev.attendance, targetRecord] };
      }
    });

    if (user) {
      // @ts-ignore
      cloudSaveAttendance(user.uid, targetRecord);
    }
  };

  const handleMarkAllPresent = (date: string) => {
    if (!activeGroup || activeStudents.length === 0) return;

    const allPresentRecords = activeStudents.map((s) => ({
      id: `att_${Date.now()}_${s.id}`,
      studentId: s.id,
      groupId: activeGroup.id,
      date,
      status: 'present' as AttendanceStatus,
    }));

    setData((prev) => {
      const otherRecords = prev.attendance.filter(
        (a) => !(a.groupId === activeGroup.id && a.date === date)
      );

      return {
        ...prev,
        attendance: [...otherRecords, ...allPresentRecords],
      };
    });

    if (user) {
      allPresentRecords.forEach((r) => cloudSaveAttendance(user.uid, r));
    }
  };

  const handleRefreshData = async () => {
    if (user) {
      setSyncStatus('syncing');
      try {
        const cloudData = await fetchUserCloudData(user.uid);
        if (cloudData) {
          setData(cloudData);
          saveAppData(cloudData);
        }
        setSyncStatus('synced');
        const now = new Date();
        setLastSyncedTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      } catch (err) {
        console.error('Buluddan yeniləmə xətası:', err);
        setSyncStatus('error');
      }
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Left Sidebar - Groups list */}
      <Sidebar
        groups={data.groups}
        students={data.students}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(id) => setSelectedGroupId(id)}
        onOpenNewGroupModal={() => setIsNewGroupModalOpen(true)}
        onRenameGroup={handleRenameGroup}
        onDeleteGroup={handleDeleteGroup}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        user={user}
        syncStatus={syncStatus}
        onOpenCloudModal={() => setIsCloudModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Banner shown if user has not yet signed in with Google */}
        {!user && (
          <div
            id="cloud-sync-reminder-banner"
            className="bg-amber-500/10 border-b border-amber-200/80 px-4 py-2.5 sm:px-6 flex items-center justify-between text-xs text-amber-950 shrink-0"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]">
                !
              </span>
              <p className="leading-snug">
                <strong>Telefonlar arasında eyni qeydləri görmək üçün:</strong> Hər iki telefonda{' '}
                <strong>informatika6451523@gmail.com</strong> Google hesabı ilə daxil olun.
              </p>
            </div>
            <button
              id="banner-signin-btn"
              onClick={() => setIsCloudModalOpen(true)}
              className="ml-3 shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 shadow-xs transition-colors cursor-pointer"
            >
              Daxil Ol
            </button>
          </div>
        )}

        {activeGroup ? (
          <>
            {/* Active Group Header */}
            <GroupHeader
              group={activeGroup}
              studentCount={activeStudents.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onRenameGroup={handleRenameGroup}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              user={user}
              syncStatus={syncStatus}
              onOpenCloudModal={() => setIsCloudModalOpen(true)}
            />

            {/* Tab Views */}
            <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'students_payments' && (
                <StudentsPaymentsView
                  group={activeGroup}
                  allGroups={data.groups}
                  students={activeStudents}
                  allStudents={data.students}
                  payments={data.payments}
                  notes={data.notes}
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                  onOpenNewStudentModal={() => setIsNewStudentModalOpen(true)}
                  onOpenPaymentModal={(student) => setPaymentModalStudent(student)}
                  onOpenHistoryModal={(student) => setHistoryModalStudent(student)}
                  onOpenNotesModal={(student) => setNotesModalStudent(student)}
                  onOpenReminderModal={(student) => setReminderModalStudent(student)}
                  onOpenEditStudentModal={(student) => setEditStudentModalStudent(student)}
                  onOpenEditDateModal={(student) => setQuickDateModalStudent(student)}
                  onRenameStudent={handleRenameStudent}
                  onUpdateStudentEnrollmentDate={handleUpdateStudentEnrollmentDate}
                  onUpdateStudentFee={handleUpdateStudentFee}
                  onDeleteStudent={handleDeleteStudent}
                  onDeletePayment={handleDeletePayment}
                />
              )}

              {activeTab === 'attendance' && (
                <AttendanceView
                  group={activeGroup}
                  students={activeStudents}
                  attendance={data.attendance}
                  onSetAttendance={handleSetAttendance}
                  onMarkAllPresent={handleMarkAllPresent}
                />
              )}

              {activeTab === 'payment_history' && (
                <PaymentHistoryView
                  group={activeGroup}
                  students={data.students}
                  payments={data.payments}
                  onDeletePayment={handleDeletePayment}
                />
              )}
            </main>
          </>
        ) : (
          /* Empty state when no group exists or is selected */
          <div className="flex flex-1 items-center justify-center p-6 text-center">
            <div className="max-w-md rounded-2xl bg-white p-8 border border-slate-200/80 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Qrup Seçilməyib</h2>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                Şagirdlərinizi, davamiyyəti və ödənişləri idarə etmək üçün sol tərəfdən mövcud qrupu
                seçin və ya yeni qrup əlavə edin.
              </p>
              <button
                onClick={() => setIsNewGroupModalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Yeni Qrup Yarat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewGroupModal
        isOpen={isNewGroupModalOpen}
        onClose={() => setIsNewGroupModalOpen(false)}
        onSave={handleCreateGroup}
      />

      {activeGroup && (
        <NewStudentModal
          isOpen={isNewStudentModalOpen}
          groupId={activeGroup.id}
          defaultFee={activeGroup.defaultMonthlyFee || 80}
          onClose={() => setIsNewStudentModalOpen(false)}
          onSave={handleCreateStudent}
        />
      )}

      <RecordPaymentModal
        isOpen={!!paymentModalStudent}
        student={paymentModalStudent}
        currentForMonth={selectedMonth}
        onClose={() => setPaymentModalStudent(null)}
        onSave={handleRecordPayment}
      />

      <StudentPaymentHistoryModal
        isOpen={!!historyModalStudent}
        student={historyModalStudent}
        payments={data.payments}
        onClose={() => setHistoryModalStudent(null)}
        onDeletePayment={handleDeletePayment}
      />

      <StudentNotesModal
        isOpen={!!notesModalStudent}
        student={notesModalStudent}
        notes={data.notes}
        onClose={() => setNotesModalStudent(null)}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {activeGroup && (
        <PaymentReminderModal
          isOpen={!!reminderModalStudent}
          student={reminderModalStudent}
          group={activeGroup}
          selectedMonth={selectedMonth}
          isPaid={
            !!reminderModalStudent &&
            data.payments.some(
              (p) => p.studentId === reminderModalStudent.id && p.forMonth === selectedMonth
            )
          }
          onClose={() => setReminderModalStudent(null)}
        />
      )}

      <EditStudentModal
        isOpen={!!editStudentModalStudent}
        student={editStudentModalStudent}
        onClose={() => setEditStudentModalStudent(null)}
        onSave={handleUpdateStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      <QuickDateEditModal
        isOpen={!!quickDateModalStudent}
        student={quickDateModalStudent}
        onClose={() => setQuickDateModalStudent(null)}
        onSaveDate={handleUpdateStudentEnrollmentDate}
      />

      <CloudAccountModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        user={user}
        syncStatus={syncStatus}
        lastSyncedTime={lastSyncedTime}
        appData={data}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
}

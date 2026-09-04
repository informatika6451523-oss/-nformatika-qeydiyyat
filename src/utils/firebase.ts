import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  collection,
} from 'firebase/firestore';
import { AppData } from './storage';
import { Group, Student, PaymentRecord, AttendanceRecord, StudentNote } from '../types';

const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA_DEMO_KEY_TEACHER_JOURNAL_APP',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'teacher-journal-az.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'teacher-journal-az',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'teacher-journal-az.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google ilə daxil olma xətası:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

export async function checkHasCloudData(userId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'main');
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch {
    return false;
  }
}

export async function uploadLocalDataToCloud(userId: string, data: AppData): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'main');
    await setDoc(docRef, {
      groups: data.groups,
      students: data.students,
      payments: data.payments,
      attendance: data.attendance,
      notes: data.notes,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Buluda yükləmə xətası:', err);
  }
}

export const cloudSaveAllData = uploadLocalDataToCloud;

export async function fetchUserCloudData(userId: string): Promise<AppData | null> {
  try {
    const docRef = doc(db, 'users', userId, 'data', 'main');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        groups: data.groups || [],
        students: data.students || [],
        payments: data.payments || [],
        attendance: data.attendance || [],
        notes: data.notes || [],
      };
    }
  } catch (err) {
    console.error('Buluddan oxuma xətası:', err);
  }
  return null;
}

export function subscribeToUserCloudData(
  userId: string,
  callback: (data: Partial<AppData>) => void
): () => void {
  const docRef = doc(db, 'users', userId, 'data', 'main');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        callback({
          groups: d.groups,
          students: d.students,
          payments: d.payments,
          attendance: d.attendance,
          notes: d.notes,
        });
      }
    },
    (err) => {
      console.warn('Sinxronizasiya xətası:', err);
    }
  );
}

export async function cloudSaveGroup(userId: string, group: Group): Promise<void> {
  try {
    const cloud = (await fetchUserCloudData(userId)) || {
      groups: [],
      students: [],
      payments: [],
      attendance: [],
      notes: [],
    };
    const updatedGroups = cloud.groups.some((g) => g.id === group.id)
      ? cloud.groups.map((g) => (g.id === group.id ? group : g))
      : [...cloud.groups, group];
    await uploadLocalDataToCloud(userId, { ...cloud, groups: updatedGroups });
  } catch (err) {
    console.error('Qrupu buluda yazma xətası:', err);
  }
}

export async function cloudDeleteGroup(userId: string, groupId: string): Promise<void> {
  try {
    const cloud = await fetchUserCloudData(userId);
    if (!cloud) return;
    const updatedGroups = cloud.groups.filter((g) => g.id !== groupId);
    const updatedStudents = cloud.students.filter((s) => s.groupId !== groupId);
    await uploadLocalDataToCloud(userId, {
      ...cloud,
      groups: updatedGroups,
      students: updatedStudents,
    });
  } catch (err) {
    console.error('Qrupu buluddan silmə xətası:', err);
  }
}

export async function cloudSaveStudent(userId: string, student: Student): Promise<void> {
  try {
    const cloud = (await fetchUserCloudData(userId)) || {
      groups: [],
      students: [],
      payments: [],
      attendance: [],
      notes: [],
    };
    const updatedStudents = cloud.students.some((s) => s.id === student.id)
      ? cloud.students.map((s) => (s.id === student.id ? student : s))
      : [...cloud.students, student];
    await uploadLocalDataToCloud(userId, { ...cloud, students: updatedStudents });
  } catch (err) {
    console.error('Şagirdi buluda yazma xətası:', err);
  }
}

export async function cloudDeleteStudent(userId: string, studentId: string): Promise<void> {
  try {
    const cloud = await fetchUserCloudData(userId);
    if (!cloud) return;
    const updatedStudents = cloud.students.filter((s) => s.id !== studentId);
    const updatedPayments = cloud.payments.filter((p) => p.studentId !== studentId);
    await uploadLocalDataToCloud(userId, {
      ...cloud,
      students: updatedStudents,
      payments: updatedPayments,
    });
  } catch (err) {
    console.error('Şagirdi buluddan silmə xətası:', err);
  }
}

export async function cloudSavePayment(userId: string, payment: PaymentRecord): Promise<void> {
  try {
    const cloud = (await fetchUserCloudData(userId)) || {
      groups: [],
      students: [],
      payments: [],
      attendance: [],
      notes: [],
    };
    const updatedPayments = cloud.payments.some((p) => p.id === payment.id)
      ? cloud.payments.map((p) => (p.id === payment.id ? payment : p))
      : [...cloud.payments, payment];
    await uploadLocalDataToCloud(userId, { ...cloud, payments: updatedPayments });
  } catch (err) {
    console.error('Ödənişi buluda yazma xətası:', err);
  }
}

export async function cloudDeletePayment(userId: string, paymentId: string): Promise<void> {
  try {
    const cloud = await fetchUserCloudData(userId);
    if (!cloud) return;
    const updatedPayments = cloud.payments.filter((p) => p.id !== paymentId);
    await uploadLocalDataToCloud(userId, { ...cloud, payments: updatedPayments });
  } catch (err) {
    console.error('Ödənişi buluddan silmə xətası:', err);
  }
}

export async function cloudSaveAttendance(
  userId: string,
  attendance: AttendanceRecord
): Promise<void> {
  try {
    const cloud = (await fetchUserCloudData(userId)) || {
      groups: [],
      students: [],
      payments: [],
      attendance: [],
      notes: [],
    };
    const existingIndex = cloud.attendance.findIndex(
      (a) =>
        a.groupId === attendance.groupId &&
        a.studentId === attendance.studentId &&
        a.date === attendance.date
    );
    let updatedAttendance = [...cloud.attendance];
    if (existingIndex >= 0) {
      updatedAttendance[existingIndex] = attendance;
    } else {
      updatedAttendance.push(attendance);
    }
    await uploadLocalDataToCloud(userId, { ...cloud, attendance: updatedAttendance });
  } catch (err) {
    console.error('Davamiyyəti buluda yazma xətası:', err);
  }
}

export async function cloudSaveNote(userId: string, note: StudentNote): Promise<void> {
  try {
    const cloud = (await fetchUserCloudData(userId)) || {
      groups: [],
      students: [],
      payments: [],
      attendance: [],
      notes: [],
    };
    const updatedNotes = cloud.notes.some((n) => n.id === note.id)
      ? cloud.notes.map((n) => (n.id === note.id ? note : n))
      : [...cloud.notes, note];
    await uploadLocalDataToCloud(userId, { ...cloud, notes: updatedNotes });
  } catch (err) {
    console.error('Qeydi buluda yazma xətası:', err);
  }
}

export async function cloudDeleteNote(userId: string, noteId: string): Promise<void> {
  try {
    const cloud = await fetchUserCloudData(userId);
    if (!cloud) return;
    const updatedNotes = cloud.notes.filter((n) => n.id !== noteId);
    await uploadLocalDataToCloud(userId, { ...cloud, notes: updatedNotes });
  } catch (err) {
    console.error('Qeydi buluddan silmə xətası:', err);
  }
}

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Group, Student, PaymentRecord, AttendanceRecord, StudentNote } from '../types';
import { AppData } from './storage';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Ensure user is always prompted to select their Google account / add another account
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with configured database ID if available
const databaseId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Sign in helper with Google
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google ilə giriş xətası:', error);
    throw error;
  }
}

// Sign in with Email and Password
export async function loginWithEmailPassword(email: string, pass: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error('E-poçt ilə daxil olma xətası:', error);
    throw error;
  }
}

// Register with Email and Password
export async function registerWithEmailPassword(email: string, pass: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error('E-poçt ilə qeydiyyat xətası:', error);
    throw error;
  }
}

// Password reset
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('Şifrə sıfırlama xətası:', error);
    throw error;
  }
}

// Sign out
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Çıxış xətası:', error);
  }
}

// Clean object helper: remove undefined keys so Firestore never rejects them
export function cleanDoc<T extends Record<string, any>>(obj: T): any {
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      result[key] = val;
    }
  }
  return result;
}

// Cloud persistence functions
export async function cloudSaveGroup(userId: string, group: Group): Promise<void> {
  try {
    await setDoc(doc(db, 'groups', group.id), cleanDoc({
      ...group,
      userId,
    }));
  } catch (err) {
    console.error('Qrupu buludda saxlamaq mümkün olmadı:', err);
  }
}

export async function cloudDeleteGroup(groupId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'groups', groupId));

    const studentsSnap = await getDocs(query(collection(db, 'students'), where('groupId', '==', groupId)));
    studentsSnap.forEach((d) => batch.delete(d.ref));

    const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('groupId', '==', groupId)));
    paymentsSnap.forEach((d) => batch.delete(d.ref));

    const attSnap = await getDocs(query(collection(db, 'attendance'), where('groupId', '==', groupId)));
    attSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (err) {
    console.error('Qrupu buluddan silmək mümkün olmadı:', err);
  }
}

export async function cloudSaveStudent(userId: string, student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), cleanDoc({
      ...student,
      userId,
    }));
  } catch (err) {
    console.error('Şagirdi buludda saxlamaq mümkün olmadı:', err);
  }
}

export async function cloudDeleteStudent(studentId: string): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'students', studentId));

    const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('studentId', '==', studentId)));
    paymentsSnap.forEach((d) => batch.delete(d.ref));

    const attSnap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', studentId)));
    attSnap.forEach((d) => batch.delete(d.ref));

    const notesSnap = await getDocs(query(collection(db, 'studentNotes'), where('studentId', '==', studentId)));
    notesSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (err) {
    console.error('Şagirdi buluddan silmək mümkün olmadı:', err);
  }
}

export async function cloudSavePayment(userId: string, payment: PaymentRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'payments', payment.id), cleanDoc({
      ...payment,
      userId,
    }));
  } catch (err) {
    console.error('Ödənişi buludda saxlamaq mümkün olmadı:', err);
  }
}

export async function cloudDeletePayment(paymentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'payments', paymentId));
  } catch (err) {
    console.error('Ödənişi buluddan silmək mümkün olmadı:', err);
  }
}

export async function cloudSaveAttendance(userId: string, record: AttendanceRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'attendance', record.id), cleanDoc({
      ...record,
      userId,
    }));
  } catch (err) {
    console.error('Davamiyyəti buludda saxlamaq mümkün olmadı:', err);
  }
}

export async function cloudSaveNote(userId: string, note: StudentNote): Promise<void> {
  try {
    await setDoc(doc(db, 'studentNotes', note.id), cleanDoc({
      ...note,
      userId,
    }));
  } catch (err) {
    console.error('Qeydi buludda saxlamaq mümkün olmadı:', err);
  }
}

export async function cloudDeleteNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'studentNotes', noteId));
  } catch (err) {
    console.error('Qeydi buluddan silmək mümkün olmadı:', err);
  }
}

// Batch sync all local data to cloud (used on first connect if cloud is empty)
export async function uploadLocalDataToCloud(userId: string, data: AppData): Promise<void> {
  try {
    const batch = writeBatch(db);

    data.groups.forEach((g) => {
      batch.set(doc(db, 'groups', g.id), cleanDoc({ ...g, userId }));
    });

    data.students.forEach((s) => {
      batch.set(doc(db, 'students', s.id), cleanDoc({ ...s, userId }));
    });

    data.payments.forEach((p) => {
      batch.set(doc(db, 'payments', p.id), cleanDoc({ ...p, userId }));
    });

    data.attendance.forEach((a) => {
      batch.set(doc(db, 'attendance', a.id), cleanDoc({ ...a, userId }));
    });

    data.notes.forEach((n) => {
      batch.set(doc(db, 'studentNotes', n.id), cleanDoc({ ...n, userId }));
    });

    await batch.commit();
  } catch (err) {
    console.error('Yerli məlumatları buluda köçürmək mümkün olmadı:', err);
  }
}

// Check if user has existing cloud data
export async function checkHasCloudData(_userId?: string): Promise<boolean> {
  try {
    const [groupsSnap, studentsSnap] = await Promise.all([
      getDocs(collection(db, 'groups')),
      getDocs(collection(db, 'students')),
    ]);
    return !groupsSnap.empty || !studentsSnap.empty;
  } catch (err) {
    console.error('Bulud məlumatlarını yoxlamaq xətası:', err);
    return false;
  }
}

// Fetch complete user data directly from cloud
export async function fetchUserCloudData(_userId?: string): Promise<AppData | null> {
  try {
    const [groupsSnap, studentsSnap, paymentsSnap, attSnap, notesSnap] = await Promise.all([
      getDocs(collection(db, 'groups')),
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'payments')),
      getDocs(collection(db, 'attendance')),
      getDocs(collection(db, 'studentNotes')),
    ]);

    const hasAny =
      !groupsSnap.empty ||
      !studentsSnap.empty ||
      !paymentsSnap.empty ||
      !attSnap.empty ||
      !notesSnap.empty;

    if (!hasAny) return null;

    return {
      groups: groupsSnap.docs.map((d) => d.data() as Group),
      students: studentsSnap.docs.map((d) => d.data() as Student),
      payments: paymentsSnap.docs.map((d) => d.data() as PaymentRecord),
      attendance: attSnap.docs.map((d) => d.data() as AttendanceRecord),
      notes: notesSnap.docs.map((d) => d.data() as StudentNote),
    };
  } catch (err) {
    console.error('Buluddan məlumatları oxumaq xətası:', err);
    return null;
  }
}

// Real-time listener for user data in cloud
export function subscribeToUserCloudData(
  _userId: string,
  onData: (cloudData: Partial<AppData>) => void
): () => void {
  const unsubscribers: Unsubscribe[] = [];

  // Groups
  unsubscribers.push(
    onSnapshot(collection(db, 'groups'), (snapshot) => {
      const groups: Group[] = snapshot.docs.map((d) => d.data() as Group);
      onData({ groups });
    }, (err) => console.error('Qruplar dinləyicisi xətası:', err))
  );

  // Students
  unsubscribers.push(
    onSnapshot(collection(db, 'students'), (snapshot) => {
      const students: Student[] = snapshot.docs.map((d) => d.data() as Student);
      onData({ students });
    }, (err) => console.error('Şagirdlər dinləyicisi xətası:', err))
  );

  // Payments
  unsubscribers.push(
    onSnapshot(collection(db, 'payments'), (snapshot) => {
      const payments: PaymentRecord[] = snapshot.docs.map((d) => d.data() as PaymentRecord);
      onData({ payments });
    }, (err) => console.error('Ödənişlər dinləyicisi xətası:', err))
  );

  // Attendance
  unsubscribers.push(
    onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const attendance: AttendanceRecord[] = snapshot.docs.map((d) => d.data() as AttendanceRecord);
      onData({ attendance });
    }, (err) => console.error('Davamiyyət dinləyicisi xətası:', err))
  );

  // Notes
  unsubscribers.push(
    onSnapshot(collection(db, 'studentNotes'), (snapshot) => {
      const notes: StudentNote[] = snapshot.docs.map((d) => d.data() as StudentNote);
      onData({ notes });
    }, (err) => console.error('Qeydlər dinləyicisi xətası:', err))
  );

  return () => {
    unsubscribers.forEach((u) => u());
  };
}

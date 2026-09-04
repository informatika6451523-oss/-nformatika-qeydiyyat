import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  LogIn,
  LogOut,
  UploadCloud,
  DownloadCloud,
  FileDown,
  FileUp,
  ExternalLink,
  Mail,
  KeyRound,
  History,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { type User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  getFirebaseAuthErrorMessage,
  logOut,
  cloudSaveAllData,
} from '../utils/firebase';
import {
  loadAppData,
  saveAppData,
  getRecoverableBackups,
  RecoverableBackup,
  AppData,
} from '../utils/storage';

interface CloudAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  syncStatus: 'syncing' | 'synced' | 'error';
  lastSyncedTime: string;
  appData?: AppData;
  onRefreshData?: () => Promise<void>;
  onForceSyncUp?: () => Promise<void>;
  onForceSyncDown?: () => Promise<void>;
  onRestoreData?: (restoredData: AppData) => void;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus: _syncStatus,
  lastSyncedTime,
  appData,
  onRefreshData,
  onForceSyncUp,
  onForceSyncDown,
  onRestoreData,
}) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('email');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('informatika6451523@gmail.com');
  const [password, setPassword] = useState('');
  const [teacherName, setTeacherName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Backup & Recovery state
  const [backups, setBackups] = useState<RecoverableBackup[]>([]);
  const [hasScannedBackups, setHasScannedBackups] = useState(false);

  useEffect(() => {
    if (isOpen) {
      scanForBackups();
    }
  }, [isOpen]);

  const scanForBackups = () => {
    try {
      const found = getRecoverableBackups();
      setBackups(found);
      setHasScannedBackups(true);
    } catch (err) {
      console.error('Ehtiyat məlumatları axtarış xətası:', err);
    }
  };

  if (!isOpen) return null;

  // 1. Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await signInWithGoogle();
      setActionMessage({
        text: 'Google ilə uğurla daxil oldunuz! Məlumatlarınız buludla sinxronlaşır.',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      setActionMessage({
        text: friendlyMsg,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email & Password Sign-In / Sign-Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setActionMessage({ text: 'Zəhmət olmasa e-poçt və şifrəni daxil edin.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setActionMessage({ text: 'Şifrə ən azı 6 simvoldan ibarət olmalıdır.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setActionMessage(null);
    try {
      if (isSignUpMode) {
        await signUpWithEmail(email, password, teacherName);
        setActionMessage({
          text: 'Yeni hesabınız uğurla yaradıldı və daxil olundu! Bütün məlumatlarınız sinxronlaşır.',
          type: 'success',
        });
      } else {
        await signInWithEmail(email, password);
        setActionMessage({
          text: 'Hesaba uğurla daxil oldunuz! Məlumatlar sinxronlaşdırılır.',
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      const friendlyMsg = getFirebaseAuthErrorMessage(err);
      setActionMessage({
        text: friendlyMsg,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Open in new tab (bypasses iframe restrictions)
  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank');
    } catch {
      alert('Brauzer parametrlərində yeni pəncərənin açılmasına icazə verin.');
    }
  };

  // 4. Sign Out
  const handleSignOut = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await logOut();
      setActionMessage({ text: 'Hesabdan çıxıldı.', type: 'info' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Cloud upload / download
  const handleManualUpload = async () => {
    setIsLoading(true);
    try {
      if (onForceSyncUp) {
        await onForceSyncUp();
      } else if (user && appData) {
        await cloudSaveAllData(user.uid, appData);
      }
      setActionMessage({ text: 'Cihazdakı bütün məlumatlar uğurla buluda yükləndi!', type: 'success' });
    } catch {
      setActionMessage({ text: 'Buluda yükləmə zamanı xəta baş verdi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualDownload = async () => {
    setIsLoading(true);
    try {
      if (onForceSyncDown) {
        await onForceSyncDown();
      } else if (onRefreshData) {
        await onRefreshData();
      }
      setActionMessage({ text: 'Məlumatlar buluddan uğurla yeniləndi!', type: 'success' });
    } catch {
      setActionMessage({ text: 'Buluddan oxuma zamanı xəta baş verdi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Restore a found backup from browser storage
  const handleRestoreBackup = (backup: RecoverableBackup) => {
    if (!window.confirm(`"${backup.sourceLabel}" mənbəyindəki ${backup.studentCount} şagird və ${backup.groupCount} qrup bərpa edilsin?`)) {
      return;
    }

    try {
      saveAppData(backup.data);
      if (onRestoreData) {
        onRestoreData(backup.data);
      }
      setActionMessage({
        text: `Köhnə məlumatlar uğurla bərpa edildi! (${backup.studentCount} şagird yükləndi)`,
        type: 'success',
      });
    } catch (err) {
      console.error('Bərpa xətası:', err);
      setActionMessage({ text: 'Məlumatları bərpa edərkən xəta baş verdi.', type: 'error' });
    }
  };

  // 7. File export/import
  const handleExportBackup = () => {
    const data = appData || loadAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Muellim_Jurnali_Ehtiyat_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.groups || parsed.students) {
          saveAppData(parsed);
          if (onRestoreData) {
            onRestoreData(parsed);
          }
          setActionMessage({
            text: 'Fayldakı məlumatlar uğurla qəbul edildi və tətbiqə yükləndi!',
            type: 'success',
          });
        } else {
          alert('Fayl formatı düzgün deyil.');
        }
      } catch {
        alert('Fayl oxunarkən xəta baş verdi.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Giriş, Sinxronizasiya və Məlumat Bərpası
              </h3>
              <p className="text-xs text-slate-500">
                Telefon və kompüterdə eyni məlumatları saxlamaq üçün
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
          {/* Notification / Action Message */}
          {actionMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : actionMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">{actionMessage.text}</div>
            </div>
          )}

          {/* Account Status Card */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-3 w-3 rounded-full ${
                    user
                      ? 'bg-emerald-500 ring-4 ring-emerald-100'
                      : 'bg-amber-400 ring-4 ring-amber-100'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {user ? 'Hesab Aktivdir' : 'Daxil Olunmayıb'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {user ? user.email : 'Məlumatlar yalnız bu brauzerin yaddaşında saxlanılır'}
                  </div>
                </div>
              </div>

              {user && (
                <span className="text-[10px] text-slate-400 font-medium">
                  Sinxron: {lastSyncedTime}
                </span>
              )}
            </div>

            {user ? (
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualUpload}
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>Buluda Yüklə</span>
                  </button>

                  <button
                    onClick={handleManualDownload}
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <DownloadCloud className="h-4 w-4" />
                    <span>Buluddan Yenilə</span>
                  </button>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Hesabdan Çıx</span>
                </button>
              </div>
            ) : (
              /* Auth Methods Tabs & Forms */
              <div className="pt-2 space-y-3">
                <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authMethod === 'email'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>E-poçt və Şifrə ilə (Tövsiyə)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod('google')}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authMethod === 'google'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Google ilə</span>
                  </button>
                </div>

                {authMethod === 'email' ? (
                  <form onSubmit={handleEmailAuth} className="space-y-2.5">
                    {isSignUpMode && (
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Adınız və Soyadınız (Müəllim)
                        </label>
                        <input
                          type="text"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          placeholder="Məs: Orxan Müəllim"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        E-poçt ünvanı
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="informatika6451523@gmail.com"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Şifrə (ən azı 6 simvol)
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>{isSignUpMode ? 'Hesab Yarat və Daxil Ol' : 'Daxil Ol'}</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => setIsSignUpMode(!isSignUpMode)}
                        className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                      >
                        {isSignUpMode
                          ? 'Artıq hesabınız var? Daxil olun'
                          : 'İlk dəfə daxil olursunuz? Yeni hesab yaradın'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Google ilə Bir Kliklə Daxil Ol</span>
                    </button>

                    <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        İframe və brauzer pop-up bloklaması səbəbindən Google açılmırsa, tətbiqi birbaşa yeni tabda aça bilərsiniz:
                        <div className="mt-1.5">
                          <button
                            type="button"
                            onClick={handleOpenInNewTab}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            <span>Tətbiqi Yeni Pəncərədə Aç</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Köhnə Məlumatları Bərpa Et (Data Recovery) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Köhnə Şagird Məlumatlarının Bərpası
                </h4>
              </div>
              <button
                type="button"
                onClick={scanForBackups}
                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Yenidən Axtar</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Əgər əvvəl əlavə etdiyiniz şagirdlərin adı silinib yenilərlə əvəzlənibsə, brauzer yaddaşında saxlanılan köhnə nüsxələri aşağıdan bərpa edə bilərsiniz:
            </p>

            {hasScannedBackups && backups.length > 0 ? (
              <div className="space-y-2">
                {backups.map((b, idx) => (
                  <div
                    key={`${b.key}-${idx}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>{b.studentCount} şagird, {b.groupCount} qrup</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {b.studentNames.length > 0
                          ? `Şagirdlər: ${b.studentNames.join(', ')}...`
                          : 'Şagird qeydləri'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreBackup(b)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer self-start sm:self-center"
                    >
                      <span>Bərpa Et</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 text-center border border-dashed border-slate-200">
                Aktiv yaddaşdan fərqli başqa ehtiyat açarı tapılmadı.
              </div>
            )}
          </div>

          {/* Section: Fayl kimi Ehtiyat Nüsxə (JSON) */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div className="text-xs font-bold text-slate-700">Fayl kimi nüsxələmə (Rezerv):</div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <FileDown className="h-4 w-4 text-blue-600" />
                <span>Nüsxə Yüklə (JSON)</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-semibold shadow-2xs cursor-pointer">
                <FileUp className="h-4 w-4 text-emerald-600" />
                <span>Nüsxəni Bərpa Et</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

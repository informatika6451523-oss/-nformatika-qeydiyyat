import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  LogIn,
  LogOut,
  ShieldCheck,
  Smartphone,
  Laptop,
  Database,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  HelpCircle,
  Globe
} from 'lucide-react';
import { type User } from 'firebase/auth';
import {
  loginWithGoogle,
  loginWithEmailPassword,
  registerWithEmailPassword,
  sendPasswordReset,
  logoutUser,
  uploadLocalDataToCloud,
  checkHasCloudData,
} from '../utils/firebase';
import { AppData } from '../utils/storage';

interface CloudAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  syncStatus: 'syncing' | 'synced' | 'error';
  lastSyncedTime: string;
  appData: AppData;
  onRefreshData: () => Promise<void>;
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus,
  lastSyncedTime,
  appData,
  onRefreshData,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('google');

  // Email/Password form state
  const [emailInput, setEmailInput] = useState('informatika6451523@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Unauthorized domain error state
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname =
    (typeof window !== 'undefined' && window.location.hostname)
      ? window.location.hostname
      : 'ais-pre-c5lytqv5hkfooliz6y577x-872526125664.europe-west2.run.app';
  const sharedHostname = 'ais-pre-c5lytqv5hkfooliz6y577x-872526125664.europe-west2.run.app';

  const isGoogleUser = user && !user.isAnonymous && user.email;

  const handleCopyText = async (textToCopy: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopiedDomain(true);
        setTimeout(() => setCopiedDomain(false), 3000);
        return;
      }
    } catch {
      // Fallback below
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 3000);
    } catch (err) {
      console.error('Kopyalama xətası:', err);
    }
  };

  const handleCopyDomain = () => {
    handleCopyText(currentHostname);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setUnauthorizedDomain(null);
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        const hasData = await checkHasCloudData(loggedUser.uid);
        if (hasData) {
          await onRefreshData();
          setSuccessMsg(`"${loggedUser.email}" hesabı qoşuldu və buluddakı qeydlər yeniləndi!`);
        } else {
          await uploadLocalDataToCloud(loggedUser.uid, appData);
          setSuccessMsg(`"${loggedUser.email}" hesabı uğurla qoşuldu və qeydləriniz buluda köçürüldü!`);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setUnauthorizedDomain(currentHostname);
        setErrorMsg(
          `Firebase bu domeni (${currentHostname}) icazəli domen kimi tanımadı. Zəhmət olmasa aşağıdakı "E-poçt və Şifrə ilə Giriş" bölməsindən istifadə edin və ya Firebase konsolunda bu domeni əlavə edin.`
        );
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Brauzer popup pəncərəsini blokladı. Zəhmət olmasa tətbiqi yeni pəncərədə açıb yenidən yoxlayın.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg('Google ilə giriş xətası: ' + (err.message || 'Xəta'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Zəhmət olmasa e-poçt ünvanınızı daxil edin.');
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setErrorMsg('Şifrə ən azı 6 simvoldan ibarət olmalıdır.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let loggedUser: User;
      if (isRegisterMode) {
        loggedUser = await registerWithEmailPassword(emailInput, passwordInput);
      } else {
        loggedUser = await loginWithEmailPassword(emailInput, passwordInput);
      }

      const hasData = await checkHasCloudData(loggedUser.uid);
      if (hasData) {
        await onRefreshData();
        setSuccessMsg(`"${loggedUser.email}" hesabı ilə daxil oldunuz və ən son qeydlər yükləndi!`);
      } else {
        await uploadLocalDataToCloud(loggedUser.uid, appData);
        setSuccessMsg(`"${loggedUser.email}" hesabı yaradıldı və qeydləriniz buluda köçürüldü!`);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        if (!isRegisterMode) {
          setErrorMsg(
            'Bu e-poçt və ya şifrə ilə istifadəçi tapılmadı. Əgər hələ şifrə yaratmamısınızsa, aşağıdakı "Yeni Şifrə ilə Hesab Yarat" linkinə toxunun.'
          );
        } else {
          setErrorMsg('Məlumatlar düzgün deyil. Zəhmət olmasa yenidən yoxlayın.');
        }
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Bu e-poçt artıq qeydiyyatdan keçib. Zəhmət olmasa "Daxil Ol" rejimini seçib şifrənizi yazın.');
        setIsRegisterMode(false);
      } else if (err.code === 'auth/wrong-password') {
        setErrorMsg('Daxil edilən şifrə yalnışdır. Şifrənizi unutmusunuzsa "Şifrəni unutdum" düyməsindən istifadə edin.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Şifrə çox zəifdir. Ən azı 6 simvol daxil edin.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Firebase konsolunda Email/Password girişi aktivləşdirilməyib. Firebase Console -> Authentication -> Sign-in method -> Email/Password aktiv edin.'
        );
      } else {
        setErrorMsg('Giriş xətası: ' + (err.message || 'Bilinməyən xəta'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!emailInput.trim()) {
      setErrorMsg('Şifrə bərpa linki göndərmək üçün e-poçt ünvanınızı daxil edin.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await sendPasswordReset(emailInput);
      setSuccessMsg(`Şifrə sıfırlama linki "${emailInput}" ünvanına göndərildi. E-poçtunuzu yoxlayın.`);
    } catch (err: any) {
      setErrorMsg('Şifrə sıfırlama xətası: ' + (err.message || 'Xəta'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await logoutUser();
      setSuccessMsg('Hesabdan çıxış edildi.');
    } catch (err: any) {
      setErrorMsg('Çıxış zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (user) {
        await onRefreshData();
        setSuccessMsg('Ən son məlumatlar buluddan uğurla yeniləndi!');
      } else {
        setErrorMsg('Sinxronizasiya üçün əvvəlcə daxil olun.');
      }
    } catch (err: any) {
      setErrorMsg('Sinxronizasiya zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="cloud-account-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="cloud-account-modal-container"
        className="relative my-6 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-xs">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Bulud Yaddaşı & 2 Telefon Sinxronizasiyası</h3>
              <p className="text-xs text-blue-100">Google Firebase Firestore & Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Status Box */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500 block">Bulud Statusu</span>
              <div className="flex items-center gap-1.5 mt-1">
                {syncStatus === 'synced' ? (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-xs font-bold text-slate-800">Aktiv & Sinxron</span>
                  </>
                ) : syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="h-3 w-3 text-blue-500 animate-spin shrink-0" />
                    <span className="text-xs font-bold text-slate-800">Yenilənir...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-rose-500 shrink-0" />
                    <span className="text-xs font-bold text-rose-700">Offline rejim</span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="text-[11px] font-medium text-slate-500 block">Son Sinxronizasiya</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Database className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800">{lastSyncedTime}</span>
              </div>
            </div>
          </div>

          {/* User Account Details or Login Section */}
          {isGoogleUser ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Qoşulmuş Hesab</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="h-3 w-3" />
                  Sinxron Aktivdir
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 border border-slate-200">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.displayName || 'İstifadəçi'}</p>
                    <p className="text-[11px] text-slate-600 font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1.5 rounded-lg border border-rose-200/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Çıxış
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Yoldaşınızın telefonunda da bu eyni hesaba ({user.email}) daxil olduqda, hər ikinizin etdiyi bütün dəyişikliklər avtomatik sinxronlaşır.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Smartphone className="h-4 w-4 text-blue-600" />
                  <span>Telefonlar Arası Giriş Üsulu</span>
                </div>
              </div>

              {/* ALWAYS-VISIBLE PROMINENT DOMAIN COPY CARD */}
              <div className="rounded-xl border-2 border-blue-400 bg-linear-to-r from-blue-50 to-indigo-50 p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">Firebase üçün İcazəli Domen</span>
                  </div>
                  <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md">
                    Google Girişi
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 leading-tight">
                  Google ilə giriş üçün Firebase Konsolunda bu domeni əlavə etmək lazımdır:
                </p>

                <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-blue-200 shadow-2xs">
                  <code className="text-xs font-mono font-bold text-blue-900 break-all flex-1 select-all">
                    {currentHostname}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentHostname)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-white transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedDomain ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedDomain ? 'Kopyalandı!' : 'Domeni Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* Login Method Tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  E-poçt və Şifrə (Zəmanətli)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setErrorMsg(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all cursor-pointer ${
                    authMethod === 'google'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  Google ilə Giriş
                </button>
              </div>

              {/* METHOD 1: Email and Password (Recommended, no domain restrictions) */}
              {authMethod === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="rounded-lg bg-blue-50/80 p-2.5 text-[11px] text-blue-900 border border-blue-100 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Tövsiyə olunan üsul:</strong> E-poçt və şifrə ilə giriş heç bir domen və ya brauzer məhdudiyyəti olmadan hər iki telefonda 100% sabit işləyir.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">E-poçt Ünvanı</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="informatika6451523@gmail.com"
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {isRegisterMode ? 'Yeni Şifrə Təyin Edin' : 'Şifrə'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={isRegisterMode ? 'Ən azı 6 simvollu şifrə' : 'Şifrənizi yazın'}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer underline"
                    >
                      {isRegisterMode ? 'Artıq hesabım var: Daxil Ol' : 'İlk dəfədir? Yeni Şifrə ilə Hesab Yarat'}
                    </button>

                    {!isRegisterMode && (
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Şifrəni unutdum
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4" />
                    {loading
                      ? 'Yoxlanılır...'
                      : isRegisterMode
                      ? 'Hesab Yarat və Sinxronlaşdır'
                      : 'Daxil Ol və Sinxronlaşdır'}
                  </button>
                </form>
              )}

              {/* METHOD 2: Google Sign-in with unauthorized-domain guidance */}
              {authMethod === 'google' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Google hesabınızla tək toxunuşla daxil olun. (Firebase layihənizdə bu veb-domen təsdiqlənmiş olmalıdır).
                  </p>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    {loading ? 'Giriş edilir...' : 'Google ilə Daxil Ol'}
                  </button>

                  {/* Detailed Firebase Domain Authorization Card - ALWAYS VISIBLE */}
                  <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 space-y-3 text-xs text-amber-950">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>Google ilə Giriş üçün Firebase-də Domen Təsdiqi:</span>
                    </div>

                    <p className="leading-relaxed text-[11px] text-amber-900/90">
                      Google OAuth təhlükəsizliyinə görə aşağıdakı domen Firebase layihənizdə qeydiyyatdan keçməlidir:
                    </p>

                    <div className="space-y-2">
                      <div className="rounded-lg bg-white p-2 border border-amber-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Cari Domen (Brauzer / Kompüter):</span>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono font-bold text-slate-800 break-all flex-1 select-all">
                            {currentHostname}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyText(currentHostname)}
                            className="inline-flex items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors shrink-0 cursor-pointer shadow-xs"
                          >
                            {copiedDomain ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {copiedDomain ? 'Kopyalandı!' : 'Domeni Kopyala'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-2 border border-amber-200 shadow-2xs">
                        <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Paylaşım Domeni (Telefonlar üçün):</span>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-mono font-bold text-slate-800 break-all flex-1 select-all">
                            {sharedHostname}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyText(sharedHostname)}
                            className="inline-flex items-center gap-1 rounded-md bg-slate-700 hover:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white transition-colors shrink-0 cursor-pointer shadow-xs"
                          >
                            <Copy className="h-3 w-3" />
                            Kopyala
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-amber-950 font-medium">
                      <p className="font-bold text-amber-900">Firebase Konsolunda 3 Sadə Addım:</p>
                      <ol className="list-decimal pl-4 space-y-1 leading-relaxed">
                        <li><strong>console.firebase.google.com</strong> saytına daxil olun.</li>
                        <li>Sol menyudan <strong>Authentication ➔ Settings ➔ Authorized Domains</strong> bölməsinə keçin.</li>
                        <li><strong>"Add Domain"</strong> düyməsinə basıb yuxarıdan kopyaladığınız domeni yapışdırın və yadda saxlayın.</li>
                      </ol>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('email');
                          setErrorMsg(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Domen gözləmədən "E-poçt və Şifrə" ilə dərhal daxil olun
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2 Phones / Shared Account Instructions */}
          <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/70 to-blue-50/70 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <Smartphone className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>2 Telefonda Eyni Hesabla Birgə İstifadə Qaydası</span>
            </div>
            <p className="text-xs text-indigo-900/85 leading-relaxed">
              Siz və yoldaşınız ayrı-ayrı vaxtlarda daxil olub qeyd apardıqda məlumatların ortaq görünməsi üçün:
            </p>
            <ol className="text-xs text-indigo-950 space-y-1.5 pl-4 list-decimal leading-relaxed">
              <li>
                <strong>Hər iki telefonun brauzerində</strong> tətbiqi açın.
              </li>
              <li>
                Hər iki telefonda yuxarıdakı <strong>E-poçt və Şifrə</strong> (və ya Google) ilə eyni <strong>informatika6451523@gmail.com</strong> hesabına daxil olun.
              </li>
              <li>
                Biri yeni şagird, qrup, ödəniş və ya davamiyyət qeyd etdikdə məlumatlar birbaşa Google bulud bazasında (Firebase) saxlanılır.
              </li>
              <li>
                Digər telefon tətbiqi açdıqda ən son qeydləri dərhal görür. İstədiyiniz an aşağıdakı <strong>"İndi Sinxronlaşdır"</strong> düyməsinə toxunaraq ən son qeydləri yeniləyə bilərsiniz.
              </li>
            </ol>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={handleManualSync}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200/70 hover:bg-blue-100/70 transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              İndi Sinxronlaşdır
            </button>

            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

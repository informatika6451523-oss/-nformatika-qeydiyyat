import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  Smartphone,
  Laptop,
  LogIn,
  LogOut,
  UploadCloud,
  DownloadCloud,
  FileDown,
  FileUp,
} from 'lucide-react';
import { type User } from 'firebase/auth';
import { signInWithGoogle, logOut, cloudSaveAllData } from '../utils/firebase';
import { loadAppData, saveAppData } from '../utils/storage';
import { AppData } from '../utils/storage';

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
}

export const CloudAccountModal: React.FC<CloudAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  syncStatus,
  lastSyncedTime,
  appData,
  onRefreshData,
  onForceSyncUp,
  onForceSyncDown,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await signInWithGoogle();
      setActionMessage('Uğurla daxil oldunuz! Məlumatlarınız avtomatik sinxronlaşır.');
    } catch (err: any) {
      console.error(err);
      setActionMessage('Daxil olarkən xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      await logOut();
      setActionMessage('Hesabdan çıxıldı.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualUpload = async () => {
    setIsLoading(true);
    try {
      if (onForceSyncUp) {
        await onForceSyncUp();
      } else if (user && appData) {
        await cloudSaveAllData(user.uid, appData);
      }
      setActionMessage('Cihazdakı bütün məlumatlar uğurla buluda yükləndi!');
    } catch {
      setActionMessage('Buluda yükləmə zamanı xəta baş verdi.');
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
      setActionMessage('Məlumatlar buluddan uğurla yeniləndi!');
    } catch {
      setActionMessage('Buluddan oxuma zamanı xəta baş verdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportBackup = () => {
    const data = appData || loadAppData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Muellim_Jurnali_Yaddas_${new Date().toISOString().slice(0, 10)}.json`;
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
        if (parsed.groups && parsed.students) {
          saveAppData(parsed);
          window.location.reload();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bulud və Cihazlararası Sinxronizasiya
              </h3>
              <p className="text-xs text-slate-500">
                Telefon və kompüter arasında eyni məlumatların saxlanması
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

        {/* Explanation banner */}
        <div className="mt-4 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100 flex items-start gap-3">
          <div className="flex items-center gap-1 text-blue-600 shrink-0 mt-0.5">
            <Laptop className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            Google hesabınızla daxil olduqda, həm telefonunuzdan, həm də kompüterinizdən əlavə etdiyiniz şagirdlər, qruplar və ödənişlər daimi yadda saxlanılır və avtomatik eyniləşdirilir.
          </p>
        </div>

        {actionMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Account state card */}
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-3 w-3 rounded-full ${
                  user ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-400 ring-4 ring-amber-100'
                }`}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {user ? 'Hesab Aktivdir' : 'Daxil olunmayıb (Lokal Rejim)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {user ? user.email : 'Məlumatlar yalnız bu brauzerdə saxlanılır'}
                </div>
              </div>
            </div>

            {user && (
              <span className="text-[10px] text-slate-400 font-medium">
                Son sinxron: {lastSyncedTime}
              </span>
            )}
          </div>

          <div className="pt-2">
            {user ? (
              <div className="space-y-2">
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
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>Google ilə Daxil Ol və Sinxronlaşdır</span>
              </button>
            )}
          </div>
        </div>

        {/* Offline Backup & Restore Option */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="text-xs font-bold text-slate-700">Fayl kimi nüsxələmə (Rezerv):</div>
          <div className="flex items-center gap-2">
            <button
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

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
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

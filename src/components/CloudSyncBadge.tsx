import React from 'react';
import { Cloud, CheckCircle2, RefreshCw, User as UserIcon } from 'lucide-react';
import { type User } from 'firebase/auth';

interface CloudSyncBadgeProps {
  user: User | null;
  syncStatus: 'syncing' | 'synced' | 'error';
  onClick: () => void;
  compact?: boolean;
}

export const CloudSyncBadge: React.FC<CloudSyncBadgeProps> = ({
  user,
  syncStatus,
  onClick,
  compact = false,
}) => {
  const isGoogleUser = user && !user.isAnonymous && user.email;

  if (compact) {
    return (
      <button
        onClick={onClick}
        title="Bulud yaddaşı və sinxronizasiya məlumatı"
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
      >
        <span className="relative flex h-2 w-2">
          {syncStatus === 'syncing' ? (
            <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          )}
        </span>
        <Cloud className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-[11px] font-bold text-slate-800 hidden sm:inline">
          Bulud: Aktiv
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full rounded-xl border border-slate-700/80 bg-slate-900/90 p-2.5 text-xs text-slate-300 hover:bg-slate-800/90 hover:border-slate-600 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
          <Cloud className="h-3.5 w-3.5 text-blue-400" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </div>
        <div className="text-left overflow-hidden">
          <p className="text-[11px] font-bold text-white truncate">
            {isGoogleUser ? user.displayName || user.email : 'Bulud Bazası (Aktiv)'}
          </p>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-2.5 w-2.5" />
            Google Firestore
          </p>
        </div>
      </div>
      <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shrink-0">
        Yaddaş
      </span>
    </button>
  );
};

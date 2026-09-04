import React, { useState } from 'react';
import {
  Menu,
  FileText,
  Users,
  CalendarCheck,
  History,
  Cloud,
  CloudOff,
  RefreshCw,
  Edit2,
  Check,
  X,
  CreditCard,
} from 'lucide-react';
import { Group, ActiveTab } from '../types';
import { type User } from 'firebase/auth';

interface GroupHeaderProps {
  group: Group;
  studentCount: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onOpenMobileMenu: () => void;
  user: User | null;
  syncStatus: 'syncing' | 'synced' | 'error';
  onOpenCloudModal: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  studentCount,
  activeTab,
  onTabChange,
  onRenameGroup,
  onOpenMobileMenu,
  user,
  syncStatus,
  onOpenCloudModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(group.name);

  const handleSave = () => {
    if (newName.trim()) {
      onRenameGroup(group.id, newName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNewName(group.name);
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto">
        {/* Left: Mobile Menu Button + Group Title Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  className="rounded-lg border border-blue-500 px-2.5 py-1 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <button
                  onClick={handleSave}
                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {group.name}
                </h1>
                <button
                  onClick={() => {
                    setNewName(group.name);
                    setIsEditing(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                  title="Qrup adını dəyiş"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{group.subject || 'Fənn qeyd edilməyib'}</span>
              <span>•</span>
              <span>{studentCount} şagird</span>
              {group.scheduleDays && group.scheduleDays.length > 0 && (
                <>
                  <span>•</span>
                  <span>{group.scheduleDays.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions & Cloud Sync Status */}
        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <button
            onClick={onOpenCloudModal}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer border ${
              user
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-600" />
            ) : user ? (
              <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-amber-600" />
            )}
            <span className="hidden sm:inline">
              {user ? 'Bulud Sinxron' : 'Buluda Qoşul'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 mt-3.5 border-t border-slate-100 pt-2.5 max-w-7xl mx-auto overflow-x-auto">
        <button
          onClick={() => onTabChange('students_payments')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students_payments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Şagirdlər və Ödənişlər</span>
        </button>

        <button
          onClick={() => onTabChange('attendance')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          <span>Davamiyyət Jurnalı</span>
        </button>

        <button
          onClick={() => onTabChange('payment_history')}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payment_history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Ödəniş Tarixçəsi</span>
        </button>
      </div>
    </header>
  );
};

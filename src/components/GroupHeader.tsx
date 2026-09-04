import React, { useState } from 'react';
import {
  Menu,
  Edit2,
  Check,
  X,
  Users,
  CreditCard,
  CalendarCheck,
  Receipt,
  BookOpen,
  Clock,
} from 'lucide-react';
import { Group, ActiveTab } from '../types';
import { type User } from 'firebase/auth';
import { CloudSyncBadge } from './CloudSyncBadge';

interface GroupHeaderProps {
  group: Group;
  studentCount: number;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onOpenMobileMenu: () => void;
  user?: User | null;
  syncStatus?: 'syncing' | 'synced' | 'error';
  onOpenCloudModal?: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  studentCount,
  activeTab,
  onTabChange,
  onRenameGroup,
  onOpenMobileMenu,
  user,
  syncStatus = 'synced',
  onOpenCloudModal,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(group.name);

  const startRename = () => {
    setTempName(group.name);
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    if (tempName.trim()) {
      onRenameGroup(group.id, tempName.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setTempName(group.name);
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4.5 sticky top-0 z-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Mobile hamburger & Group title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden cursor-pointer transition-colors"
            title="Qruplar menyusunu aç"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            {isRenaming ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename();
                    if (e.key === 'Escape') handleCancelRename();
                  }}
                  autoFocus
                  className="rounded-xl border-2 border-blue-600 px-3 py-1 text-base sm:text-lg font-bold text-slate-900 focus:outline-none shadow-xs"
                />
                <button
                  onClick={handleSaveRename}
                  className="rounded-lg bg-emerald-600 p-2 text-white hover:bg-emerald-700 cursor-pointer transition-colors"
                  title="Yadda saxla"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelRename}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                  title="Ləğv et"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {group.name}
                </h2>
                <button
                  onClick={startRename}
                  title="Qrupun adını dəyiş"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Sub-info chips */}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                {studentCount} şagird
              </span>
              {group.subject && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/60 px-2 py-0.5 font-medium text-slate-600">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" /> {group.subject}
                </span>
              )}
              {group.schedule && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-slate-200/60 px-2 py-0.5 font-medium text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> {group.schedule}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Cloud Sync badge & Navigation Tabs */}
        <div className="flex items-center gap-2.5">
          {onOpenCloudModal && (
            <CloudSyncBadge
              user={user || null}
              syncStatus={syncStatus}
              onClick={onOpenCloudModal}
              compact={true}
            />
          )}

          {/* Navigation Tabs - Segmented Pill Control */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200/70 overflow-x-auto">
          <button
            onClick={() => onTabChange('students_payments')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'students_payments'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span>Şagirdlər & Ödənişlər</span>
          </button>

          <button
            onClick={() => onTabChange('attendance')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Davamiyyət Jurnalı</span>
          </button>

          <button
            onClick={() => onTabChange('payment_history')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'payment_history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="h-3.5 w-3.5 text-emerald-600" />
            <span>Bütün Ödənişlər</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

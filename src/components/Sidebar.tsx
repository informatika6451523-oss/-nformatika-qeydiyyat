import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Cloud,
  CloudOff,
  RefreshCw,
  FileText,
  Calendar,
} from 'lucide-react';
import { Group, Student } from '../types';
import { type User } from 'firebase/auth';

interface SidebarProps {
  groups: Group[];
  students: Student[];
  selectedGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onOpenNewGroupModal: () => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user: User | null;
  syncStatus: 'syncing' | 'synced' | 'error';
  onOpenCloudModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  groups,
  students,
  selectedGroupId,
  onSelectGroup,
  onOpenNewGroupModal,
  onRenameGroup,
  onDeleteGroup,
  isOpenMobile,
  onCloseMobile,
  user,
  syncStatus,
  onOpenCloudModal,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeMenuGroupId, setActiveMenuGroupId] = useState<string | null>(null);

  const startRename = (grp: Group) => {
    setEditingGroupId(grp.id);
    setEditName(grp.name);
    setActiveMenuGroupId(null);
  };

  const handleSaveRename = (grpId: string) => {
    if (editName.trim()) {
      onRenameGroup(grpId, editName.trim());
    }
    setEditingGroupId(null);
  };

  const handleCancelRename = () => {
    setEditingGroupId(null);
    setEditName('');
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100 w-72 sm:w-80 shrink-0 select-none border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">
              Müəllim Jurnalı
            </h1>
            <p className="text-[11px] text-slate-400">Şagird və Ödəniş Sistemi</p>
          </div>
        </div>

        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Cloud Sync Status Pill */}
      <div className="px-4 pt-3 pb-1">
        <button
          onClick={onOpenCloudModal}
          className="w-full flex items-center justify-between rounded-xl bg-slate-800/80 hover:bg-slate-800 px-3 py-2 text-xs border border-slate-700/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {syncStatus === 'syncing' ? (
              <RefreshCw className="h-3.5 w-3.5 text-amber-400 animate-spin" />
            ) : user ? (
              <Cloud className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <CloudOff className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span className="text-slate-300 font-medium truncate max-w-40 text-left">
              {user ? user.email || 'Bulud Aktivdir' : 'Bulud Hesabına Daxil Ol'}
            </span>
          </div>
          <span
            className={`h-2 w-2 rounded-full ${
              user ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
        </button>
      </div>

      {/* Groups Section Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Qruplar ({groups.length})
        </span>
        <button
          onClick={onOpenNewGroupModal}
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
          title="Yeni Qrup Əlavə Et"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Yeni Qrup</span>
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 py-1">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            Hələ heç bir qrup yaradılmayıb. Yuxarıdakı "Yeni Qrup" düyməsinə klikləyin.
          </div>
        ) : (
          groups.map((grp) => {
            const isSelected = grp.id === selectedGroupId;
            const count = students.filter((s) => s.groupId === grp.id).length;

            if (editingGroupId === grp.id) {
              return (
                <div
                  key={grp.id}
                  className="flex items-center gap-1 rounded-xl bg-slate-800 p-1.5"
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white border border-slate-700 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(grp.id);
                      if (e.key === 'Escape') handleCancelRename();
                    }}
                  />
                  <button
                    onClick={() => handleSaveRename(grp.id)}
                    className="p-1 text-emerald-400 hover:bg-slate-700 rounded-md cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleCancelRename}
                    className="p-1 text-slate-400 hover:bg-slate-700 rounded-md cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={grp.id}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                onClick={() => {
                  onSelectGroup(grp.id);
                  if (isOpenMobile) onCloseMobile();
                }}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="truncate">{grp.name}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {grp.subject || 'Fənn qeyd edilməyib'} • {count} şagird
                  </span>
                </div>

                <div
                  className="relative flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      setActiveMenuGroupId(
                        activeMenuGroupId === grp.id ? null : grp.id
                      )
                    }
                    className={`p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity cursor-pointer ${
                      isSelected
                        ? 'hover:bg-blue-700 text-white'
                        : 'hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuGroupId === grp.id && (
                    <div className="absolute right-0 top-7 z-30 w-36 rounded-xl bg-slate-800 p-1 shadow-xl border border-slate-700 text-xs">
                      <button
                        onClick={() => startRename(grp)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-200 hover:bg-slate-700 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Adı dəyiş</span>
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `"${grp.name}" qrupunu və ona aid məlumatları silmək istədiyinizə əminsiniz?`
                            )
                          ) {
                            onDeleteGroup(grp.id);
                          }
                          setActiveMenuGroupId(null);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Qrupu sil</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:flex-col h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

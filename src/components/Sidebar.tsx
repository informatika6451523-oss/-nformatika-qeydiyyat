import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Group, Student } from '../types';
import { type User } from 'firebase/auth';
import { CloudSyncBadge } from './CloudSyncBadge';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface SidebarProps {
  groups: Group[];
  students: Student[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onOpenNewGroupModal: () => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onDeleteGroup: (groupId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  user?: User | null;
  syncStatus?: 'syncing' | 'synced' | 'error';
  onOpenCloudModal?: () => void;
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
  syncStatus = 'synced',
  onOpenCloudModal,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [tempGroupName, setTempGroupName] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const startRename = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setTempGroupName(group.name);
  };

  const saveRename = (groupId: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (tempGroupName.trim()) {
      onRenameGroup(groupId, tempGroupName.trim());
    }
    setEditingGroupId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroupId(null);
    setTempGroupName('');
  };

  const handleDelete = (group: Group, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToDelete(group);
  };

  const content = (
    <div className="flex h-full w-72 flex-col bg-slate-900 text-slate-100 border-r border-slate-800 selection:bg-blue-600 selection:text-white">
      {/* App Branding */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Repetitor Jurnalı</h1>
            <p className="text-[11px] font-medium text-slate-400">Tədris & Ödəniş Sistemi</p>
          </div>
        </div>
        {isOpenMobile && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Add New Group Button */}
      <div className="p-4 pb-2">
        <button
          id="sidebar-new-group-btn"
          onClick={() => {
            onOpenNewGroupModal();
            if (isOpenMobile) onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-[0.99] transition-all cursor-pointer ring-1 ring-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Qrup Əlavə Et</span>
        </button>
      </div>

      {/* Search Groups (if more than 2 groups) */}
      {groups.length > 2 && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Qruplarda axtar..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              className="w-full rounded-xl bg-slate-800/90 border border-slate-700/70 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-2 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Qruplarım</span>
          <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            {groups.length}
          </span>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Users className="mx-auto h-7 w-7 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400">
              {groupSearch ? 'Axtarışa uyğun qrup tapılmadı' : 'Hələ qrup yaradılmayıb'}
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isSelected = selectedGroupId === group.id;
            const isRenaming = editingGroupId === group.id;
            const groupStudents = students.filter((s) => s.groupId === group.id);

            return (
              <div
                key={group.id}
                id={`group-item-${group.id}`}
                onClick={() => {
                  if (!isRenaming) {
                    onSelectGroup(group.id);
                    if (isOpenMobile) onCloseMobile();
                  }
                }}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer text-xs transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                {/* Left info & Rename Input */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <BookOpen
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />

                  {isRenaming ? (
                    <div
                      className="flex items-center gap-1 flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={tempGroupName}
                        onChange={(e) => setTempGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(group.id, e);
                          if (e.key === 'Escape') setEditingGroupId(null);
                        }}
                        autoFocus
                        className="w-full rounded-lg bg-slate-950 border border-blue-400 px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={(e) => saveRename(group.id, e)}
                        className="rounded-md p-1 text-emerald-400 hover:bg-slate-800"
                        title="Yadda saxla"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-800"
                        title="Ləğv et"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold">{group.name}</div>
                      {group.subject && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {group.subject}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right badges & Rename / Delete actions */}
                {!isRenaming && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-blue-500/40 text-white'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                      title={`${groupStudents.length} şagird`}
                    >
                      {groupStudents.length}
                    </span>

                    {/* Hover action buttons: Rename & Delete */}
                    <div className="hidden items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={(e) => startRename(group, e)}
                        title="Qrupun adını dəyiş"
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>

                      <button
                        onClick={(e) => handleDelete(group, e)}
                        title="Qrupu sil"
                        className="rounded-md p-1 text-slate-400 hover:bg-red-950 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info: Total stats and Cloud Sync badge */}
      <div className="border-t border-slate-800 p-4 bg-slate-950/50 space-y-3">
        {onOpenCloudModal && (
          <CloudSyncBadge
            user={user || null}
            syncStatus={syncStatus}
            onClick={onOpenCloudModal}
          />
        )}

        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Ümumi Şagird:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">{students.length} nəfər</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Qruplar:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">{groups.length} qrup</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:flex shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative flex w-72 max-w-[80vw] flex-1 flex-col z-10">{content}</div>
        </div>
      )}

      {/* Delete Group Confirmation Modal */}
      <ConfirmDialogModal
        isOpen={groupToDelete !== null}
        title="Qrupu silmək istəyirsiniz?"
        message={
          groupToDelete
            ? students.filter((s) => s.groupId === groupToDelete.id).length > 0
              ? `"${groupToDelete.name}" qrupunda ${
                  students.filter((s) => s.groupId === groupToDelete.id).length
                } şagird var. Qrupu və tərkibindəki bütün şagirdləri, ödənişləri silmək istədiyinizə əminsiniz?`
              : `"${groupToDelete.name}" qrupunu silmək istədiyinizə əminsiniz?`
            : ''
        }
        confirmText="Bəli, Qrupu Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          if (groupToDelete) {
            onDeleteGroup(groupToDelete.id);
            setGroupToDelete(null);
          }
        }}
        onClose={() => setGroupToDelete(null)}
      />
    </>
  );
};

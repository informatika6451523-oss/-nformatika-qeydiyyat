import React, { useState } from 'react';
import { X, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Student, StudentNote, NoteCategory } from '../types';
import { formatFullDateAZ } from '../utils/dateUtils';

interface StudentNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  notes: StudentNote[];
  onAddNote: (studentId: string, category: NoteCategory, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const CATEGORY_LABELS: Record<NoteCategory, { label: string; badge: string }> = {
  general: { label: 'Ümumi', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  academic: { label: 'Tədris / Nəticə', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  payment: { label: 'Ödəniş', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  behavior: { label: 'Davamiyyət / Davranış', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export const StudentNotesModal: React.FC<StudentNotesModalProps> = ({
  isOpen,
  onClose,
  student,
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('general');

  if (!isOpen || !student) return null;

  const studentNotes = notes.filter((n) => n.studentId === student.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote(student.id, category, content.trim());
    setContent('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Şagird Qeydləri</h3>
              <p className="text-xs text-slate-500">{student.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add note input */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <textarea
            placeholder="Şagird haqqında yeni qeyd yazın..."
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white resize-none"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(Object.keys(CATEGORY_LABELS) as NoteCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {CATEGORY_LABELS[cat].label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Əlavə Et</span>
            </button>
          </div>
        </form>

        {/* Notes list */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 border-t border-slate-100 pt-3">
          {studentNotes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Bu şagird üçün hələ qeyd yoxdur.
            </div>
          ) : (
            studentNotes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 relative group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      CATEGORY_LABELS[note.category]?.badge || ''
                    }`}
                  >
                    {CATEGORY_LABELS[note.category]?.label || 'Ümumi'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">
                      {formatFullDateAZ(note.createdAt || note.date || '')}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                      title="Qeydi sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-800 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
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

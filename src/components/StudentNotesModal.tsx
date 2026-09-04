import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  GraduationCap,
  Smile,
  FileText,
  AlertCircle,
  Tag
} from 'lucide-react';
import { Student, StudentNote, NoteCategory } from '../types';
import { ConfirmDialogModal } from './ConfirmDialogModal';

interface StudentNotesModalProps {
  isOpen: boolean;
  student: Student | null;
  notes: StudentNote[];
  onClose: () => void;
  onAddNote: (studentId: string, category: NoteCategory, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

const CATEGORIES: { id: NoteCategory; label: string; icon: React.FC<any>; color: string; bg: string; border: string }[] = [
  {
    id: 'academic',
    label: 'Akademik Nailiyyət',
    icon: GraduationCap,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  {
    id: 'behavioral',
    label: 'Davranış & İntizam',
    icon: Smile,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  {
    id: 'general',
    label: 'Ümumi Qeyd',
    icon: FileText,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200'
  }
];

export const StudentNotesModal: React.FC<StudentNotesModalProps> = ({
  isOpen,
  student,
  notes,
  onClose,
  onAddNote,
  onDeleteNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('academic');
  const [content, setContent] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const studentNotes = notes
    .filter((n) => n.studentId === student.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredNotes = filterCategory === 'all'
    ? studentNotes
    : studentNotes.filter((n) => n.category === filterCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddNote(student.id, selectedCategory, content.trim());
    setContent('');
  };

  const getCategoryInfo = (cat: NoteCategory) => {
    return CATEGORIES.find((c) => c.id === cat) || CATEGORIES[2];
  };

  return (
    <div
      id="student-notes-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Şagird Qeydləri</h2>
              <p className="text-xs text-slate-500 font-medium">
                {student.name} • Kateqoriyalı sərbəst qeydlər jurnalı
              </p>
            </div>
          </div>
          <button
            id="close-notes-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Note Section */}
        <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              Kateqoriya Seçin:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `${cat.bg} ${cat.color} ring-2 ring-blue-400/50 shadow-xs`
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Şagird haqqında sərbəst qeydinizi yazın (məs: dərsi qavraması, ev tapşırığı, davranış və ya valideynlə əlaqə)..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-xs resize-none"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-medium">
              Qeyd tarixi avtomatik saxlanılacaq
            </span>
            <button
              type="submit"
              disabled={!content.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Qeydi Saxla</span>
            </button>
          </div>
        </form>

        {/* Filter bar & List Header */}
        <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Əvvəlki Qeydlər</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              {studentNotes.length}
            </span>
          </div>

          {/* Filter options */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hamısı
            </button>
            <button
              onClick={() => setFilterCategory('academic')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterCategory === 'academic'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Akademik
            </button>
            <button
              onClick={() => setFilterCategory('behavioral')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterCategory === 'behavioral'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Davranış
            </button>
            <button
              onClick={() => setFilterCategory('general')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterCategory === 'general'
                  ? 'bg-slate-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Ümumi
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Bu kateqoriyada qeyd tapılmadı</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Yuxarıdakı paneldən şagird üçün ilk qeydinizi əlavə edin.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const catInfo = getCategoryInfo(note.category);
              const CatIcon = catInfo.icon;
              return (
                <div
                  key={note.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${catInfo.bg} ${catInfo.color} ${catInfo.border}`}
                    >
                      <CatIcon className="h-3 w-3" />
                      <span>{catInfo.label}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                        <Calendar className="h-3 w-3" />
                        {note.createdAt}
                      </span>
                      <button
                        onClick={() => setNoteToDeleteId(note.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Qeydi sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Bağla
          </button>
        </div>
      </div>

      <ConfirmDialogModal
        isOpen={noteToDeleteId !== null}
        title="Qeydi silmək istəyirsiniz?"
        message="Bu qeydi silmək istədiyinizə əminsiniz?"
        confirmText="Qeydi Sil"
        cancelText="İmtina et"
        variant="danger"
        onConfirm={() => {
          if (noteToDeleteId) {
            onDeleteNote(noteToDeleteId);
            setNoteToDeleteId(null);
          }
        }}
        onClose={() => setNoteToDeleteId(null)}
      />
    </div>
  );
};

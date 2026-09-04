import React, { useState } from 'react';
import { X, Bell, MessageSquare, Copy, Check, Send } from 'lucide-react';
import { Student, Group } from '../types';
import { formatMonthName, getDayFromDate } from '../utils/dateUtils';

interface PaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  group: Group;
  selectedMonth: string;
  isPaid?: boolean;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  onClose,
  student,
  group,
  selectedMonth,
  isPaid,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !student) return null;

  const monthName = formatMonthName(selectedMonth);
  const dueDay =
    student.paymentDueDay ||
    student.paymentDayOfMonth ||
    getDayFromDate(student.enrollmentDate) ||
    1;
  const fee = student.monthlyFee || group.defaultMonthlyFee || 80;

  const defaultMessage = `Salam, hörmətli valideyn.

${student.name}-in ${group.name} üzrə ${monthName} ayı üçün hazırlıq dərslərinin aylıq ödəniş günü (hər ayın ${dueDay}-i) çatmışdır.

Aylıq məbləğ: ${fee} AZN

Zəhmət olmasa, ödənişi ən yaxın zamanda təmin etməyinizi xahiş edirik.
Təşəkkür edirik!`;

  const [message, setMessage] = useState(defaultMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = (student.parentPhone || student.phone || '')
    .replace(/\s+/g, '')
    .replace(/[^\d+]/g, '');

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(message);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ödəniş Xatırlatması
              </h3>
              <p className="text-xs text-slate-500">{student.name} üçün xatırlatma mətni</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isPaid && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Bu şagird artıq {monthName} ayı üçün ödəniş edib.</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>Nömrə: <strong>{student.parentPhone || student.phone || 'Qeyd olunmayıb'}</strong></span>
            <span>Aylıq gün: <strong>Hər ayın {dueDay}-i</strong></span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mesaj mətni (Redaktə edilə bilər)
            </label>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white resize-none font-sans"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Mətni Kopyala</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Bağla
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-2xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>WhatsApp ilə Göndər</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

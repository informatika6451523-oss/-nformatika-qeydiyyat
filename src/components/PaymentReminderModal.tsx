import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Send,
  Copy,
  Check,
  Calendar,
  AlertTriangle,
  Clock,
  MessageSquare,
  ExternalLink,
  Phone,
  Banknote
} from 'lucide-react';
import { Student, Group } from '../types';
import {
  formatMonthName,
  getPaymentDueStatusInfo,
} from '../utils/dateUtils';

interface PaymentReminderModalProps {
  isOpen: boolean;
  student: Student | null;
  group: Group;
  selectedMonth: string;
  isPaid: boolean;
  onClose: () => void;
}

export const PaymentReminderModal: React.FC<PaymentReminderModalProps> = ({
  isOpen,
  student,
  group,
  selectedMonth,
  isPaid,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const statusInfo = student
    ? getPaymentDueStatusInfo(selectedMonth, student.paymentDueDay, isPaid)
    : null;

  // Build the automated message whenever student or month changes
  useEffect(() => {
    if (!student || !statusInfo) return;

    const monthName = formatMonthName(selectedMonth);
    const dueDate = statusInfo.formattedDueDate;
    const fee = student.monthlyFee;
    const isOverdue = statusInfo.status === 'overdue';

    let text = '';
    if (isOverdue) {
      text = `Hörmətli valideyn / şagird, ${student.name} üçün ${monthName} ayı üzrə təhsil haqqı ödənişinin (${fee} AZN) son tarixi (${dueDate}) artıq keçmişdir. Zəhmət olmasa ödənişi ən qısa zamanda həyata keçirməyiniz xahiş olunur. Əvvəlcədən təşəkkür edirik!`;
    } else if (statusInfo.status === 'due_soon') {
      text = `Salam, hörmətli valideyn / şagird. ${student.name} üçün ${monthName} ayı üzrə təhsil haqqı (${fee} AZN) ödənişinin son tarixi ${dueDate}-dir. Xatırladırıq ki, ödənişi vaxtında etməyiniz xahiş olunur. Təşəkkür edirik!`;
    } else {
      text = `Salam, hörmətli valideyn / şagird. ${student.name} üçün ${monthName} ayı üzrə təhsil haqqı (${fee} AZN) ödənişinin son tarixi ${dueDate}-dir. Zəhmət olmasa ödənişi nəzərə alasınız. Təşəkkür edirik!`;
    }

    setCustomMessage(text);
    setCopied(false);
  }, [student, selectedMonth, statusInfo?.status, statusInfo?.formattedDueDate]);

  if (!isOpen || !student || !statusInfo) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleWhatsApp = () => {
    // Format phone if student has one
    let phoneParam = '';
    if (student.phone) {
      const cleaned = student.phone.replace(/[^0-9]/g, '');
      if (cleaned.startsWith('0')) {
        phoneParam = `994${cleaned.slice(1)}`;
      } else if (cleaned.length === 9) {
        phoneParam = `994${cleaned}`;
      } else {
        phoneParam = cleaned;
      }
    }

    const encoded = encodeURIComponent(customMessage);
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank');
  };

  return (
    <div
      id="payment-reminder-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              statusInfo.status === 'overdue'
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Ödəniş Xatırlatması</h2>
              <p className="text-xs text-slate-500 font-medium">
                {student.name} • {formatMonthName(selectedMonth)} ayı üçün
              </p>
            </div>
          </div>
          <button
            id="close-reminder-modal-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student status cards */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              Son Ödəniş Tarixi
            </span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {statusInfo.formattedDueDate}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              (Hər ayın {student.paymentDueDay || 5}-i)
            </span>
          </div>

          <div className={`rounded-xl p-3.5 border ${
            statusInfo.status === 'overdue'
              ? 'bg-rose-50/70 border-rose-200 text-rose-800'
              : statusInfo.status === 'due_soon'
              ? 'bg-amber-50/70 border-amber-200 text-amber-800'
              : 'bg-blue-50/70 border-blue-200 text-blue-800'
          }`}>
            <span className="text-[11px] font-semibold flex items-center gap-1 opacity-90">
              {statusInfo.status === 'overdue' ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              Cari Status
            </span>
            <p className="text-sm font-bold mt-1">
              {statusInfo.label}
            </p>
            <span className="text-[10px] font-medium opacity-80">
              Məbləğ: {student.monthlyFee} AZN
            </span>
          </div>
        </div>

        {student.phone && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Əlaqə nömrəsi:</span>
            <span>{student.phone}</span>
          </div>
        )}

        {/* Message preview / edit */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              Avtomatlaşdırılmış Xatırlatma Mesajı
            </label>
            <span className="text-[11px] text-slate-400">Dəyişdirilə bilər</span>
          </div>
          <textarea
            rows={4}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 leading-relaxed focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs resize-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Mesaj Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Mesajı Kopyala</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>WhatsApp ilə Göndər</span>
          </button>
        </div>
      </div>
    </div>
  );
};

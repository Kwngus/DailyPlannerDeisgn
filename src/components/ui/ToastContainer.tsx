"use client";

import { useToastStore } from "@/store/toastStore";
import { X, RotateCcw, CheckCircle, AlertCircle, Info } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "bg-[var(--text)] text-[var(--bg)]",
  error: "bg-red-600 text-white",
  info: "bg-[var(--text)] text-[var(--bg)]",
};

export default function ToastContainer() {
  const { toasts, hide } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`flex items-center justify-center gap-3 px-4 py-3 rounded-2xl shadow-lg
              pointer-events-auto min-w-[200px] max-w-[320px]
              animate-[slideUp_0.2s_cubic-bezier(0.34,1.56,0.64,1)]
              ${COLORS[toast.type]}`}
          >
            <Icon size={16} className="flex-shrink-0 opacity-90" aria-hidden="true" />
            <span className="text-sm font-medium text-center">{toast.message}</span>

            {toast.undoAction && (
              <button
                onClick={() => {
                  toast.undoAction?.();
                  hide(toast.id);
                }}
                className="flex items-center gap-1 text-xs font-bold opacity-80
                           hover:opacity-100 border border-white/30 rounded-lg px-2 py-1
                           transition-opacity flex-shrink-0"
              >
                <RotateCcw size={11} aria-hidden="true" />
                되돌리기
              </button>
            )}

            <button
              onClick={() => hide(toast.id)}
              aria-label="알림 닫기"
              className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

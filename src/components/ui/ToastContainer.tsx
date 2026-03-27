"use client";

import { useToastStore } from "@/store/toastStore";
import { X, RotateCcw, CheckCircle, AlertCircle, Info } from "lucide-react";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: "bg-[#1A1714] text-[#FFFFFF]",
  error: "bg-red-600 text-[#FFFFFF]",
  info: "bg-blue-600 text-[#FFFFFF]",
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
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg
              pointer-events-auto min-w-[200px] max-w-[320px]
              animate-[slideUp_0.2s_cubic-bezier(0.34,1.56,0.64,1)]
              ${COLORS[toast.type]}`}
          >
            <Icon size={16} className="flex-shrink-0 opacity-90" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>

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
                <RotateCcw size={11} />
                되돌리기
              </button>
            )}

            <button
              onClick={() => hide(toast.id)}
              className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

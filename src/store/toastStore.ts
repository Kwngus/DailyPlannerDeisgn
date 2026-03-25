import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  undoAction?: () => void;
};

type ToastStore = {
  toasts: Toast[];
  show: (message: string, type?: ToastType, undoAction?: () => void) => void;
  hide: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (message, type = "success", undoAction) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, type, undoAction }] }));
    setTimeout(
      () => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      },
      undoAction ? 4000 : 2500,
    );
  },

  hide: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

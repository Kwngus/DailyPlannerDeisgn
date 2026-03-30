"use client";

import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function Fab({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="일정 추가"
      className="fixed bottom-7 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all" style={{ background: "var(--point)", color: "var(--point-fg)" }}
    >
      <Plus size={24} aria-hidden="true" />
    </button>
  );
}

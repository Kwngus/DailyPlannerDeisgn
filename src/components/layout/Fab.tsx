"use client";

import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function Fab({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-7 right-6 w-14 h-14 bg-[#1A1714] text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-[#3D3430] hover:scale-105 active:scale-95 transition-all"
    >
      <Plus size={24} />
    </button>
  );
}

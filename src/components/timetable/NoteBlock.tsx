"use client";

import { Pencil } from "lucide-react";
import type { Event } from "@/types";

type Props = {
  event: Event;
  leftPct: number;  // 시간 행 안에서 위치 (0~100%)
  onClick: (event: Event) => void;
};

export default function NoteBlock({ event, leftPct, onClick }: Props) {
  return (
    <div
      className="absolute inset-y-0 flex items-center gap-0.5 cursor-pointer group select-none"
      style={{ left: `${leftPct}%`, zIndex: 10 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <Pencil
        size={9}
        className="shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors"
      />
      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors leading-tight whitespace-nowrap">
        {event.title}
      </span>
    </div>
  );
}

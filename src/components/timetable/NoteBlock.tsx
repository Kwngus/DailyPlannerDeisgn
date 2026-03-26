"use client";

import { Pencil } from "lucide-react";
import type { Event } from "@/types";

type Props = {
  event: Event;
  leftPct: number;
  widthPct: number;
  onClick: (event: Event) => void;
};

export default function NoteBlock({ event, leftPct, widthPct, onClick }: Props) {
  return (
    <div
      className="absolute inset-y-0 flex items-center justify-center gap-1 cursor-pointer group select-none"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        border: "1px dashed #9CA3AF",
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      <Pencil size={9} className="shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors leading-tight truncate">
        {event.title}
      </span>
    </div>
  );
}

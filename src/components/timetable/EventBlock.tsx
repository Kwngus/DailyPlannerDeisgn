"use client";

import type { Event } from "@/types";
import { minToTime } from "@/lib/timeUtils";
import { useSettingsStore } from "@/store/settingsStore";

type Props = {
  event: Event;
  leftPct: number;   // 시간 행 안에서 시작 위치 (0~100%)
  widthPct: number;  // 시간 행 안에서 차지하는 너비 (0~100%)
  isFirst: boolean;  // 시작 행인지 여부 (연속 행은 형광펜만 표시)
  onClick: (event: Event) => void;
};

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FALLBACK = { bg: "rgba(255,210,80,0.45)", border: "rgba(200,160,0,0.7)" };

export default function EventBlock({ event, leftPct, widthPct, isFirst, onClick }: Props) {
  const { timeFormat } = useSettingsStore();
  const cancelled = event.is_cancelled ?? false;
  const color = event.category?.color
    ? {
        bg: hexToRgba(event.category.color, cancelled ? 0.18 : 0.45),
        border: hexToRgba(event.category.color, cancelled ? 0.35 : 0.85),
      }
    : {
        bg: cancelled ? "rgba(255,210,80,0.18)" : FALLBACK.bg,
        border: cancelled ? "rgba(200,160,0,0.35)" : FALLBACK.border,
      };

  return (
    <div
      className="absolute top-[3px] bottom-[3px] rounded-md px-2 py-1 cursor-pointer transition-all hover:brightness-95 hover:scale-[0.98] select-none overflow-hidden"
      style={{
        left: `${leftPct}%`,
        width: `max(${widthPct}%, 28px)`,
        background: color.bg,
        borderTop: `3px solid ${color.border}`,
        zIndex: 10,
        opacity: cancelled ? 0.6 : 1,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {isFirst && (
        <>
          <div className={`text-xs font-semibold truncate leading-tight ${cancelled ? "line-through" : ""}`}>
            {event.title}
          </div>
          <div className="text-[0.65rem] opacity-60 leading-tight whitespace-nowrap">
            {minToTime(event.start_min, timeFormat)}–{minToTime(event.end_min, timeFormat)}
          </div>
        </>
      )}

      {/* 취소선 — 블록 전체를 가로지르는 선 */}
      {cancelled && (
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            top: "50%",
            height: "1.5px",
            background: color.border,
          }}
        />
      )}
    </div>
  );
}

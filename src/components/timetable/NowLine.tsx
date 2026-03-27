"use client";

import { useEffect, useState } from "react";
import { ROW_HEIGHT, getHourStart } from "@/lib/timeUtils";

type Position = { topPx: number; leftPct: number };

function calcPosition(): Position | null {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const hourStart = getHourStart();

  // 표시 범위 밖 (hourStart 이전 2시간)
  if (hour > 1 && hour < hourStart) return null;

  const hourIndex =
    hour >= hourStart ? hour - hourStart : 24 - hourStart + hour;

  return {
    topPx: hourIndex * ROW_HEIGHT,
    leftPct: (minute / 60) * 100,
  };
}

export default function NowLine() {
  const [pos, setPos] = useState<Position | null>(null);

  useEffect(() => {
    setPos(calcPosition());
    const id = setInterval(() => setPos(calcPosition()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (pos === null) return null;

  return (
    <div
      className="absolute z-10 pointer-events-none"
      style={{
        top: `${pos.topPx}px`,
        left: `${pos.leftPct}%`,
        height: `${ROW_HEIGHT}px`,
        width: "2px",
        transform: "translateX(-1px)",
      }}
    >
      {/* 상단 원형 점 */}
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{ top: "0", left: "-3px", background: "var(--point)" }}
      />
      {/* 수직선 */}
      <div className="w-full h-full" style={{ background: "var(--point)", opacity: 0.85 }} />
    </div>
  );
}

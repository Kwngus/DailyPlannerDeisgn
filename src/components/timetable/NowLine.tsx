"use client";

import { useEffect, useState } from "react";
import { ROW_HEIGHT, HOUR_START } from "@/lib/timeUtils";

function calcTop(): number | null {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  // 02~04시는 표시 안 함
  if (hour > 1 && hour < HOUR_START) return null;
  const minutesSinceStart =
    hour >= HOUR_START
      ? (hour - HOUR_START) * 60 + minute
      : (24 - HOUR_START + hour) * 60 + minute;
  return (minutesSinceStart / 60) * ROW_HEIGHT;
}

export default function NowLine() {
  const [topPx, setTopPx] = useState<number | null>(null);

  useEffect(() => {
    setTopPx(calcTop());
    const id = setInterval(() => setTopPx(calcTop()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (topPx === null) return null;

  return (
    <div
      className="absolute left-0 right-0 z-10 pointer-events-none"
      style={{ top: `${topPx}px` }}
    >
      {/* 왼쪽 원형 점 */}
      <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500" style={{ top: '-5px', left: '-4px' }} />
      {/* 수평선 */}
      <div className="w-full h-[2px] bg-red-500" />
    </div>
  );
}

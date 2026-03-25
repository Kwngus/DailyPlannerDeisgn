"use client";

import { useEffect, useState } from "react";
import { getNowLinePos, ROW_HEIGHT } from "@/lib/timeUtils";

export default function NowLine() {
  const [pos, setPos] = useState(getNowLinePos());

  useEffect(() => {
    const interval = setInterval(() => {
      setPos(getNowLinePos());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!pos) return null;

  return (
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        top: `${pos.topPx + 3}px`,
        height: `${ROW_HEIGHT - 6}px`,
        left: `${pos.leftPct}%`,
      }}
    >
      {/* 빨간 점 */}
      <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-red-500" />
      {/* 수직 선 */}
      <div className="w-[1.5px] h-full bg-red-500" />
    </div>
  );
}

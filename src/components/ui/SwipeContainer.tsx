"use client";

import { useRef, useState } from "react";
import { useSwipe } from "@/lib/hooks/useSwipe";

type Props = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function SwipeContainer({
  onSwipeLeft,
  onSwipeRight,
  children,
  className = "",
}: Props) {
  const [offset, setOffset] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const isHorizRef = useRef<boolean | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizRef.current = null;
    setTransitioning(false);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (startXRef.current === null || startYRef.current === null) return;

    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;

    // 방향 결정 (최초 1회)
    if (isHorizRef.current === null) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isHorizRef.current = true;
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        isHorizRef.current = false;
      }
      return;
    }

    if (!isHorizRef.current) return;

    // 가로 스와이프 중 — 살짝 따라오는 시각 효과 (저항감 있게)
    const resist = Math.sign(dx) * Math.min(Math.abs(dx) * 0.25, 40);
    setOffset(resist);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (startXRef.current === null) return;

    const dx = e.changedTouches[0].clientX - startXRef.current;

    setTransitioning(true);
    setOffset(0);

    if (isHorizRef.current && Math.abs(dx) >= 50) {
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }

    startXRef.current = null;
    startYRef.current = null;
    isHorizRef.current = null;
  }

  return (
    <div
      className={`${className} touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateX(${offset}px)`,
        transition: transitioning ? "transform 0.2s ease" : "none",
      }}
    >
      {children}
    </div>
  );
}

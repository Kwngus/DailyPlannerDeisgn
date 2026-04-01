"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { destination: string };

export default function SplashScreen({ destination }: Props) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), 1800);
    const navTimer  = setTimeout(() => router.push(destination), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [destination, router]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "#1A1714",
        transition: "opacity 0.4s ease-out",
        opacity: exiting ? 0 : 1,
      }}
    >
      {/* 배경 글로우 */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(247,245,240,0.12) 0%, transparent 70%)",
          animation: "splashGlow 2.4s ease-in-out infinite",
        }}
      />

      {/* 로고 영역 */}
      <div className="relative flex flex-col items-center gap-5 z-10">
        {/* ✦ 심볼 */}
        <div
          style={{
            animation: "splashSymbol 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
          }}
        >
          <span
            className="select-none"
            style={{
              fontSize: 72,
              lineHeight: 1,
              color: "#F7F5F0",
              textShadow:
                "0 0 40px rgba(247,245,240,0.35), 0 0 80px rgba(247,245,240,0.12)",
              fontFamily: "serif",
            }}
          >
            ✦
          </span>
        </div>

        {/* Planner 텍스트 */}
        <div
          style={{
            animation: "splashTitle 0.6s ease-out 0.65s both",
          }}
          className="flex flex-col items-center gap-2"
        >
          <span
            style={{
              fontSize: 28,
              letterSpacing: "0.22em",
              color: "#F7F5F0",
              fontWeight: 300,
              fontFamily:
                '"Pretendard Variable", "Pretendard", -apple-system, sans-serif',
            }}
          >
            PLANNER
          </span>

          {/* 구분선 */}
          <div
            style={{
              width: 32,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(247,245,240,0.4), transparent)",
            }}
          />
        </div>

        {/* 서브타이틀 */}
        <span
          style={{
            animation: "splashSub 0.6s ease-out 1.0s both",
            fontSize: 11,
            letterSpacing: "0.35em",
            color: "#6B6560",
            textTransform: "uppercase",
          }}
        >
          Daily · Weekly · Monthly
        </span>
      </div>

      {/* 하단 로딩 바 */}
      <div
        className="absolute flex items-end gap-1"
        style={{
          bottom: 64,
          animation: "splashSub 0.4s ease-out 1.1s both",
        }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: 14 + (i === 2 ? 6 : i === 1 || i === 3 ? 3 : 0),
              borderRadius: 999,
              background: "#F7F5F0",
              animation: `splashDot 0.9s ease-in-out ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* 버전 */}
      <span
        className="absolute"
        style={{
          bottom: 28,
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "#3D3430",
          animation: "splashSub 0.4s ease-out 1.2s both",
        }}
      >
        v1.0
      </span>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-56px)] px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">😵</div>
        <h2
          className="font-serif text-2xl mb-2"
          style={{ color: "var(--text)" }}
        >
          앱 오류가 발생했어요
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {error.message || "일시적인 문제가 발생했습니다. 다시 시도해주세요."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-[#1A1714] text-white text-sm font-semibold
                       hover:bg-[#3D3430] transition-colors"
          >
            <RefreshCw size={14} />
            다시 시도
          </button>
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                       border text-sm font-semibold transition-colors
                       hover:bg-gray-50 dark:hover:bg-[#2C2820]"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            <Home size={14} />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h2
          className="font-serif text-2xl mb-2"
          style={{ color: "var(--text)" }}
        >
          문제가 발생했어요
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl
                     bg-[#1A1714] text-white text-sm font-semibold
                     hover:bg-[#3D3430] transition-colors"
        >
          <RefreshCw size={15} />
          다시 시도
        </button>
      </div>
    </div>
  );
}

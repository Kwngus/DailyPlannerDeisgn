"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function RealtimeIndicator() {
  const [status, setStatus] = useState<"connecting" | "connected" | "error">(
    "connecting",
  );
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel("connection-check").subscribe((s) => {
      if (s === "SUBSCRIBED") setStatus("connected");
      if (s === "CHANNEL_ERROR") setStatus("error");
      if (s === "CLOSED") setStatus("error");
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // connected 상태에서는 표시 안 함
  if (status === "connected") return null;

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50
      flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
      shadow-md transition-all animate-[slideUp_0.2s_ease]
      ${
        status === "connecting"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-600"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          status === "connecting" ? "bg-yellow-500 animate-pulse" : "bg-red-500"
        }`}
      />
      {status === "connecting" ? "연결 중..." : "연결 끊김"}
    </div>
  );
}

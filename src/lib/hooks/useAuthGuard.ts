"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";

export function useAuthGuard() {
  const supabase = createClient();
  const router = useRouter();
  const { show } = useToastStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
      }
      if (event === "TOKEN_REFRESHED") {
        // 토큰 갱신 성공 — 별도 처리 없음
      }
    });
    return () => subscription.unsubscribe();
  }, []);
}

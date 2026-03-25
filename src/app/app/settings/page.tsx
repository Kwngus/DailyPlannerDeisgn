"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useFontSize, type FontSize } from "@/hooks/useFontSize";

const FONT_SIZE_LABELS: Record<FontSize, string> = {
  small: "소",
  medium: "중",
  large: "대",
};

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fontSize, setFontSize] = useFontSize();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6">설정</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* 글씨 크기 */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
            글씨 크기
          </p>
          <div className="flex gap-2">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-colors
                  ${fontSize === size
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 bg-[#F7F5F0] text-gray-600 hover:border-gray-400"}`}
              >
                {FONT_SIZE_LABELS[size]}
              </button>
            ))}
          </div>
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  );
}

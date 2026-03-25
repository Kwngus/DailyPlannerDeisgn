"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] =
  [
    { value: "light", label: "라이트", icon: <Sun size={16} /> },
    { value: "dark", label: "다크", icon: <Moon size={16} /> },
    { value: "system", label: "시스템", icon: <Monitor size={16} /> },
  ];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useThemeStore();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6 text-[var(--text)]">
        설정
      </h2>

      {/* 테마 설정 */}
      <div
        className="rounded-2xl border overflow-hidden mb-4 bg-[var(--surface)] border-[var(--border)]"
      >
        <div
          className="px-5 py-3 border-b border-[var(--border)]"
        >
          <p
            className="text-xs font-bold uppercase tracking-widest text-[#8A847C]"
          >
            테마
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border-2 text-xs font-semibold transition-all text-[var(--text)] ${
                  theme === opt.value
                    ? "border-[var(--accent)] bg-[var(--bg)]"
                    : "border-[var(--border)] bg-transparent"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 로그아웃 */}
      <div
        className="rounded-2xl border overflow-hidden bg-[var(--surface)] border-[var(--border)]"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
    </div>
  );
}

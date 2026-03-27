"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogOut, Sun, Moon, Monitor } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";
import type {
  TimeFormat,
  WeekStart,
  FontSize,
  DefaultView,
} from "@/store/settingsStore";

type Theme = "light" | "dark" | "system";

const SECTION = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-2xl border overflow-hidden mb-4"
    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
  >
    <div
      className="px-5 py-3 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
    </div>
    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  </div>
);

const ROW = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between px-5 py-4">
    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
      {label}
    </span>
    <div className="flex items-center gap-1">{children}</div>
  </div>
);

const CHIPS = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex gap-1">
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: value === o.value ? "var(--accent)" : "var(--border)",
          color: value === o.value ? "var(--accent-fg)" : "var(--text-muted)",
        }}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useThemeStore();
  const {
    defaultView,
    setDefaultView,
    weekStart,
    setWeekStart,
    timeFormat,
    setTimeFormat,
    fontSize,
    setFontSize,
    timetableStart,
    setTimetableStart,
  } = useSettingsStore();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6" style={{ color: "var(--text)" }}>
        설정
      </h2>

      {/* 화면 */}
      <SECTION title="화면">
        <ROW label="테마">
          <CHIPS<Theme>
            options={[
              { value: "light", label: "라이트" },
              { value: "dark", label: "다크" },
              { value: "system", label: "시스템" },
            ]}
            value={theme}
            onChange={setTheme}
          />
        </ROW>
        <ROW label="폰트 크기">
          <CHIPS<FontSize>
            options={[
              { value: "small", label: "小" },
              { value: "medium", label: "中" },
              { value: "large", label: "大" },
            ]}
            value={fontSize}
            onChange={(v) => {
              setFontSize(v);
              const sizeMap = {
                small: "1rem",
                medium: "1.125rem",
                large: "1.25rem",
              };
              document.documentElement.style.setProperty(
                "--base-font-size",
                sizeMap[v],
              );
            }}
          />
        </ROW>
      </SECTION>

      {/* 플래너 */}
      <SECTION title="플래너">
        <ROW label="기본 뷰">
          <CHIPS<DefaultView>
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
            value={defaultView}
            onChange={setDefaultView}
          />
        </ROW>
        <ROW label="주 시작 요일">
          <CHIPS<WeekStart>
            options={[
              { value: "sun", label: "일요일" },
              { value: "mon", label: "월요일" },
            ]}
            value={weekStart}
            onChange={setWeekStart}
          />
        </ROW>
        <ROW label="시간 형식">
          <CHIPS<TimeFormat>
            options={[
              { value: "24h", label: "24시간" },
              { value: "12h", label: "12시간" },
            ]}
            value={timeFormat}
            onChange={setTimeFormat}
          />
        </ROW>
        <ROW label="타임테이블 시작">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={timetableStart}
              onChange={(e) => setTimetableStart(Number(e.target.value))}
              className="w-28"
            />
            <span
              className="text-sm font-semibold w-10 text-right"
              style={{ color: "var(--text)" }}
            >
              {String(timetableStart).padStart(2, "0")}:00
            </span>
          </div>
        </ROW>
      </SECTION>

      {/* 계정 */}
      <SECTION title="계정">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </SECTION>
    </div>
  );
}

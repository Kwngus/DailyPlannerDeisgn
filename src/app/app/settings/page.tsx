"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogOut } from "lucide-react";
import { useThemeStore, BG_THEMES, POINT_COLORS } from "@/store/themeStore";
import type { BgThemeId, PointColorId, CustomBgTheme } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { TimeFormat, WeekStart, FontSize, DefaultView } from "@/store/settingsStore";

type Theme = "light" | "dark" | "system";

const SECTION = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    className="rounded-2xl border overflow-hidden mb-4"
    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
  >
    <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
    </div>
    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
      {children}
    </div>
  </div>
);

const ROW = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between px-5 py-4">
    <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
    <div className="flex items-center gap-1">{children}</div>
  </div>
);

const CHIPS = <T extends string>({
  options, value, onChange,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) => (
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

/** 배경 테마 미니 프리뷰 */
function ThemePreview({ id }: { id: Exclude<BgThemeId, "custom"> }) {
  if (id === "glass") {
    return (
      <div
        className="w-full rounded-lg overflow-hidden flex relative"
        style={{
          height: "52px",
          background: "linear-gradient(135deg, #93c5fd 0%, #c4b5fd 45%, #f9a8d4 100%)",
        }}
      >
        {/* 글래스 사이드바 */}
        <div
          className="w-3.5 h-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.38)",
            borderRight: "1px solid rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        />
        {/* 글래스 콘텐츠 */}
        <div className="flex-1 p-1.5 flex flex-col justify-center gap-1">
          <div
            className="w-3/4 h-1.5 rounded-full"
            style={{ background: "rgba(67,56,202,0.45)" }}
          />
          <div
            className="w-full h-2.5 rounded"
            style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(4px)" }}
          />
          <div
            className="w-5/6 h-2.5 rounded"
            style={{ background: "rgba(255,255,255,0.30)" }}
          />
        </div>
      </div>
    );
  }

  const t = BG_THEMES[id];
  return (
    <div
      className="w-full rounded-lg overflow-hidden flex"
      style={{ background: t.bg, height: "52px" }}
    >
      {/* 사이드바 */}
      <div className="w-3.5 h-full flex-shrink-0" style={{ background: t.accent }} />
      {/* 콘텐츠 */}
      <div className="flex-1 p-1.5 flex flex-col justify-center gap-1">
        <div
          className="w-3/4 h-1.5 rounded-full"
          style={{ background: t.accent, opacity: 0.5 }}
        />
        <div
          className="w-full h-2.5 rounded"
          style={{ background: t.accent, opacity: 0.2 }}
        />
        <div
          className="w-5/6 h-2.5 rounded"
          style={{ background: t.accent, opacity: 0.15 }}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    theme, setTheme, bgTheme, setBgTheme,
    pointColor, setPointColor, customPointColor, setCustomPointColor,
    customBgTheme, setCustomBgTheme,
  } = useThemeStore();
  const {
    defaultView, setDefaultView,
    weekStart, setWeekStart,
    timeFormat, setTimeFormat,
    fontSize, setFontSize,
    timetableStart, setTimetableStart,
  } = useSettingsStore();

  const colorInputRef = useRef<HTMLInputElement>(null);

  function updateCustomBg(partial: Partial<CustomBgTheme>) {
    const next = { ...customBgTheme, ...partial };
    setCustomBgTheme(next);
    setBgTheme("custom");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h2 className="font-serif text-2xl mb-6" style={{ color: "var(--text)" }}>설정</h2>

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
              { value: "small", label: "S" },
              { value: "medium", label: "M" },
              { value: "large", label: "L" },
            ]}
            value={fontSize}
            onChange={(v) => {
              setFontSize(v);
              const sizeMap = { small: "1rem", medium: "1.125rem", large: "1.25rem" };
              document.documentElement.style.setProperty("--base-font-size", sizeMap[v]);
            }}
          />
        </ROW>
      </SECTION>

      {/* 배경 테마 */}
      <div
        className="rounded-2xl border overflow-hidden mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            배경 테마
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(BG_THEMES) as Exclude<BgThemeId, "custom">[]).map((id) => {
              const t = BG_THEMES[id];
              const isSelected = bgTheme === id;
              return (
                <button
                  key={id}
                  onClick={() => setBgTheme(id)}
                  className="text-left rounded-xl overflow-hidden transition-all"
                  style={{
                    border: isSelected ? "2px solid var(--point)" : "2px solid transparent",
                    outline: isSelected ? "none" : undefined,
                    boxShadow: isSelected ? "0 0 0 1px var(--point)" : "0 0 0 1px var(--border)",
                  }}
                >
                  <ThemePreview id={id} />
                  <div className="px-2.5 py-2" style={{ background: t.bg }}>
                    <p className="text-xs font-semibold" style={{ color: t.accent }}>
                      {t.label} {id === "cream" ? "✦" : ""}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.accent, opacity: 0.6 }}>
                      {t.desc}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* 커스텀 테마 카드 */}
            <button
              onClick={() => setBgTheme("custom")}
              className="col-span-2 text-left rounded-xl overflow-hidden transition-all"
              style={{
                border: bgTheme === "custom" ? "2px solid var(--point)" : "2px solid transparent",
                boxShadow: bgTheme === "custom" ? "0 0 0 1px var(--point)" : "0 0 0 1px var(--border)",
              }}
            >
              {/* 커스텀 미니 프리뷰 */}
              <div
                className="w-full rounded-t-lg overflow-hidden flex"
                style={{ background: customBgTheme.bg, height: "40px" }}
              >
                <div className="w-3.5 h-full flex-shrink-0" style={{ background: customBgTheme.accent }} />
                <div className="flex-1 p-1.5 flex flex-col justify-center gap-1">
                  <div className="w-3/4 h-1.5 rounded-full" style={{ background: customBgTheme.accent, opacity: 0.5 }} />
                  <div className="w-full h-2.5 rounded" style={{ background: customBgTheme.surface, border: `1px solid ${customBgTheme.accent}22` }} />
                </div>
              </div>
              <div className="px-2.5 py-2" style={{ background: customBgTheme.bg }}>
                <p className="text-xs font-semibold" style={{ color: customBgTheme.accent }}>나만의 테마</p>
                <p className="text-[10px] mt-0.5" style={{ color: customBgTheme.accent, opacity: 0.6 }}>직접 색상 지정</p>
              </div>
            </button>
          </div>

          {/* 커스텀 테마 색상 피커 */}
          {bgTheme === "custom" && (
            <div
              className="mt-3 rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
            >
              {(
                [
                  { key: "bg", label: "배경색", desc: "앱 전체 배경" },
                  { key: "surface", label: "표면색", desc: "카드·모달 배경" },
                  { key: "accent", label: "강조색", desc: "사이드바·버튼 강조" },
                ] as { key: keyof CustomBgTheme; label: string; desc: string }[]
              ).map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {customBgTheme[key]}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg border-2 cursor-pointer relative overflow-hidden"
                      style={{ borderColor: "var(--border)", background: customBgTheme[key] }}
                    >
                      <input
                        type="color"
                        value={customBgTheme[key]}
                        onChange={(e) => updateCustomBg({ [key]: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 포인트 컬러 */}
      <div
        className="rounded-2xl border overflow-hidden mb-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            포인트 컬러
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(POINT_COLORS) as PointColorId[]).map((id) => {
              const p = POINT_COLORS[id];
              const isSelected = pointColor === id;
              return (
                <button
                  key={id}
                  onClick={() => setPointColor(id)}
                  className="flex flex-col items-center gap-1"
                  title={p.label}
                >
                  <div
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: p.point,
                      boxShadow: isSelected
                        ? `0 0 0 2px var(--surface), 0 0 0 4px ${p.point}`
                        : "none",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {p.label}
                  </span>
                </button>
              );
            })}

            {/* 직접 입력 */}
            <button
              className="flex flex-col items-center gap-1"
              onClick={() => colorInputRef.current?.click()}
              title="직접 입력"
            >
              <div
                className="w-8 h-8 rounded-full transition-all flex items-center justify-center text-sm"
                style={{
                  background: pointColor === "custom" ? customPointColor : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
                  boxShadow: pointColor === "custom"
                    ? `0 0 0 2px var(--surface), 0 0 0 4px ${customPointColor}`
                    : "none",
                  transform: pointColor === "custom" ? "scale(1.15)" : "scale(1)",
                }}
              />
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>직접 입력</span>
              <input
                ref={colorInputRef}
                type="color"
                value={customPointColor}
                onChange={(e) => {
                  setCustomPointColor(e.target.value);
                  setPointColor("custom");
                }}
                className="sr-only"
              />
            </button>
          </div>
        </div>
      </div>

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
            <span className="text-sm font-semibold w-10 text-right" style={{ color: "var(--text)" }}>
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

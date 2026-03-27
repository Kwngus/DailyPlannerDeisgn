"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useToastStore } from "@/store/toastStore";
import { Download, KeyRound, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import dayjs from "dayjs";

type Props = {
  user: User | null;
  weekEvents: any[];
  todos: any[];
  heatmapDates: string[];
};

export default function MypageClient({
  user,
  weekEvents,
  todos,
  heatmapDates,
}: Props) {
  const supabase = createClient();
  const { show } = useToastStore();
  const [nickname, setNickname] = useState(user?.user_metadata?.nickname ?? "");
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.is_done).length;
  const completionRate =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // 히트맵 데이터 집계
  const dateCounts: Record<string, number> = {};
  heatmapDates.forEach((d) => {
    dateCounts[d] = (dateCounts[d] ?? 0) + 1;
  });

  // 최근 84일 날짜 배열 (12주)
  const today = dayjs();
  const days = Array.from({ length: 84 }, (_, i) =>
    today.subtract(83 - i, "day").format("YYYY-MM-DD"),
  );

  function getHeatColor(count: number) {
    if (count === 0) return "var(--border)";
    if (count <= 1) return "#B5D4F4";
    if (count <= 3) return "#378ADD";
    if (count <= 5) return "#185FA5";
    return "#0C447C";
  }

  async function handleNicknameSave() {
    const { error } = await supabase.auth.updateUser({
      data: { nickname },
    });
    if (error) {
      show("저장에 실패했어요.", "error");
      return;
    }
    show("닉네임이 변경됐어요 ✓");
    setEditing(false);
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      show("메일 발송에 실패했어요.", "error");
      return;
    }
    show("비밀번호 재설정 메일을 보냈어요 ✓");
  }

  async function handleExportCSV() {
    const { data } = await supabase
      .from("events")
      .select("title, date, start_min, end_min, note")
      .eq("user_id", user?.id ?? "")
      .order("date", { ascending: true });

    if (!data) return;

    const rows = [
      ["제목", "날짜", "시작", "종료", "메모"],
      ...data.map((e) => [
        e.title,
        e.date,
        `${String(Math.floor(e.start_min / 60)).padStart(2, "0")}:${String(e.start_min % 60).padStart(2, "0")}`,
        `${String(Math.floor(e.end_min / 60)).padStart(2, "0")}:${String(e.end_min % 60).padStart(2, "0")}`,
        e.note ?? "",
      ]),
    ];

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planner_${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show("CSV로 내보냈어요 ✓");
  }

  async function handleDeleteAccount() {
    const { error } = await supabase.rpc("delete_user");
    if (error) {
      show("계정 삭제에 실패했어요.", "error");
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <h2 className="font-serif text-2xl mb-6" style={{ color: "var(--text)" }}>
        마이페이지
      </h2>

      {/* 프로필 */}
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <span
              className="text-2xl font-serif"
              style={{ color: "var(--accent-fg)" }}
            >
              {(nickname || user?.email)?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  className="flex-1 px-3 py-1.5 rounded-lg border text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                  }}
                />
                <button
                  onClick={handleNicknameSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  저장
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold" style={{ color: "var(--text)" }}>
                  {nickname || "닉네임 없음"}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  편집
                </button>
              </div>
            )}
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {user?.email}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              가입일{" "}
              {user?.created_at
                ? dayjs(user.created_at).format("YYYY년 M월 D일")
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          이번 주 통계
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "이번 주 일정", value: weekEvents.length, unit: "개" },
            { label: "전체 할 일", value: totalTodos, unit: "개" },
            { label: "완료율", value: completionRate, unit: "%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-3 rounded-xl"
              style={{ background: "var(--bg)" }}
            >
              <p
                className="text-2xl font-serif font-bold"
                style={{ color: "var(--text)" }}
              >
                {stat.value}
                <span className="text-sm font-sans">{stat.unit}</span>
              </p>
              <p
                className="text-[11px] mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 히트맵 */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          최근 12주 활동
        </p>
        <div className="flex gap-1 flex-wrap">
          {days.map((d) => (
            <div
              key={d}
              title={`${d}: ${dateCounts[d] ?? 0}개`}
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: getHeatColor(dateCounts[d] ?? 0) }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            적음
          </span>
          {["var(--border)", "#B5D4F4", "#378ADD", "#185FA5", "#0C447C"].map(
            (c, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ background: c }}
              />
            ),
          )}
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            많음
          </span>
        </div>
      </div>

      {/* 계정 관리 */}
      <div
        className="rounded-2xl border overflow-hidden"
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
            계정 관리
          </p>
        </div>
        <button
          onClick={handlePasswordReset}
          className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2C2820] transition-colors"
          style={{ color: "var(--text)" }}
        >
          <KeyRound size={16} className="text-gray-400" />
          비밀번호 변경 메일 보내기
        </button>
        <button
          onClick={handleExportCSV}
          className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2C2820] transition-colors border-t"
          style={{ color: "var(--text)", borderColor: "var(--border)" }}
        >
          <Download size={16} className="text-gray-400" />
          일정 CSV로 내보내기
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <Trash2 size={16} />
          계정 삭제
        </button>
      </div>

      {/* 계정 삭제 확인 */}
      {showDeleteConfirm && (
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ background: "var(--surface)", borderColor: "#E24B4A" }}
        >
          <p className="text-sm font-semibold text-red-600">
            정말 계정을 삭제할까요?
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            모든 일정, 할 일, 분류 데이터가 영구적으로 삭제되며 복구할 수
            없어요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "var(--border)",
                color: "var(--text-muted)",
              }}
            >
              취소
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              삭제하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

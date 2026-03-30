"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 해요.");
      return;
    }

    setLoading(true);

    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError("회원가입에 실패했어요. 다시 시도해주세요.");
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
        <div className="text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-semibold mb-2">이메일을 확인해주세요</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {email} 로 인증 메일을 보냈어요.
            <br />
            링크를 클릭하면 로그인할 수 있어요.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold text-[var(--text)] hover:underline"
          >
            로그인 페이지로 →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-serif text-center mb-2 tracking-tight">
          ✦ Planner
        </h1>
        <p className="text-center text-sm text-[var(--text-muted)] mb-8">
          계정을 만들어 시작해요
        </p>

        <form
          onSubmit={handleSignup}
          className="rounded-2xl border p-8 shadow-sm space-y-4 bg-[var(--surface)] border-[var(--border)]"
        >
          <div>
            <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              이메일
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
              required
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              비밀번호
            </label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              required
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
              비밀번호 확인
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--bg)] border-[var(--border)] text-[var(--text)]"
            />
          </div>

          {error && <p role="alert" className="text-red-500 text-xs text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-[var(--text)] font-semibold hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

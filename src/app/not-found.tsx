import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="text-center max-w-sm">
        <div
          className="font-serif text-8xl font-bold mb-4 opacity-10"
          style={{ color: "var(--text)" }}
        >
          404
        </div>
        <h2
          className="font-serif text-2xl mb-2"
          style={{ color: "var(--text)" }}
        >
          페이지를 찾을 수 없어요
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          요청하신 페이지가 존재하지 않거나 이동됐어요.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                     text-sm font-semibold transition-colors"
          style={{ background: "var(--point)", color: "var(--point-fg)" }}
        >
          플래너로 돌아가기
        </Link>
      </div>
    </div>
  );
}

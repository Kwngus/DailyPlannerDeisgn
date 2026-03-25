"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Tag, User, Settings, X, CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const navItems = [
  { href: "/app",            label: "플래너",    icon: CalendarDays },
  { href: "/app/todos",      label: "할 일",     icon: CheckSquare  },
  { href: "/app/categories", label: "분류 지정", icon: Tag          },
  { href: "/app/mypage",     label: "마이페이지", icon: User         },
  { href: "/app/settings",   label: "설정",      icon: Settings     },
];

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-56 z-50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          bg-[#1A1714] dark:bg-[#F0EDE8] text-[#F7F5F0] dark:text-[#1A1714]
        `}
      >
        {/* 로고 + 닫기 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <span className="font-serif text-xl tracking-wide">✦ Planner</span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white dark:text-[#1A1714]/50 dark:hover:text-[#1A1714] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-6 py-3 text-sm font-medium
                  transition-colors
                  ${
                    isActive
                      ? "text-white bg-white/10 dark:text-[#1A1714] dark:bg-[#1A1714]/10"
                      : "text-white/60 hover:text-white hover:bg-white/5 dark:text-[#1A1714]/60 dark:hover:text-[#1A1714] dark:hover:bg-[#1A1714]/5"
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="px-6 py-5 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-white/40 hover:text-white/70 dark:text-[#1A1714]/40 dark:hover:text-[#1A1714]/70 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Tag,
  User,
  Settings,
  CheckSquare,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
};

const navItems = [
  { href: "/app/dashboard",  label: "대시보드",  icon: LayoutDashboard },
  { href: "/app",            label: "플래너",    icon: CalendarDays },
  { href: "/app/todos",      label: "할 일",     icon: CheckSquare  },
  { href: "/app/categories", label: "분류 지정", icon: Tag          },
  { href: "/app/mypage",     label: "마이페이지", icon: User         },
  { href: "/app/settings",   label: "설정",      icon: Settings     },
];

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: Props) {
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
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50
          w-[70px]
          flex flex-col items-center
          bg-gray-50 dark:bg-[#1E1B18]
          border-r border-gray-200 dark:border-[#38342E]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : isCollapsed ? "-translate-x-full" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* 로고 — 클릭 시 숨기기 */}
        <div className="h-14 flex items-center justify-center flex-shrink-0 border-b border-gray-200 dark:border-[#38342E] w-full">
          <button
            onClick={onToggleCollapse}
            title="사이드바 숨기기"
            aria-label="사이드바 숨기기"
            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-800 dark:text-[#F0EDE8] hover:bg-gray-200 dark:hover:bg-[#38342E] transition-all duration-200 font-serif text-xl select-none"
          >
            ✦
          </button>
        </div>

        {/* 네비게이션 아이콘 */}
        <nav className="flex-1 flex flex-col items-center gap-5 py-6">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                title={label}
                aria-label={label}
                className={`
                  w-11 h-11 rounded-full flex items-center justify-center
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-[var(--point-fg)]"
                      : "text-gray-400 hover:bg-gray-200 dark:hover:bg-[#38342E] hover:text-gray-700 dark:hover:text-[#F0EDE8]"
                  }
                `}
                style={isActive ? { background: "var(--point)" } : undefined}
              >
                <Icon size={18} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        {/* 로그아웃 */}
        <div className="pb-6 flex-shrink-0">
          <button
            onClick={handleLogout}
            title="로그아웃"
            aria-label="로그아웃"
            className="w-11 h-11 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-[#38342E] hover:text-gray-700 dark:hover:text-[#F0EDE8] transition-all duration-200"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
    </>
  );
}

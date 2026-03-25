"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ToastContainer from "@/components/ui/ToastContainer";
import RealtimeIndicator from "@/components/ui/RealtimeIndicator";
import SearchModal from "@/components/modals/SearchModal";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import type { Event } from "@/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useAuthGuard(); // 인증 만료 감지

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <main className="pt-14">{children}</main>
      <RealtimeIndicator />
      <ToastContainer />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onEventClick={(editingEvent) => setEditingEvent(editingEvent)}
      />
    </div>
  );
}

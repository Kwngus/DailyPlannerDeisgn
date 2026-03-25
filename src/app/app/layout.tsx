'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import ToastContainer from '@/components/ui/ToastContainer'
import SearchModal from '@/components/modals/SearchModal'
import type { Event } from '@/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  function handleEventClick(event: Event) {
    setEditingEvent(event)
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => setSearchOpen(true)}
      />
      <main className="pt-14">
        {children}
      </main>
      <ToastContainer />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onEventClick={handleEventClick}
      />
    </div>
  )
}
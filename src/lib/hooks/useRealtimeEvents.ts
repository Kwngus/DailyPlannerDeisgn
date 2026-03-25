import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useToastStore } from '@/store/toastStore'

type Options = {
  onInsert?: () => void
  onUpdate?: () => void
  onDelete?: () => void
}

export function useRealtimeEvents({ onInsert, onUpdate, onDelete }: Options) {
  const supabase = createClient()
  const { show } = useToastStore()

  // 항상 최신 콜백을 참조하도록 ref 사용
  const onInsertRef = useRef(onInsert)
  const onUpdateRef = useRef(onUpdate)
  const onDeleteRef = useRef(onDelete)

  useEffect(() => {
    onInsertRef.current = onInsert
    onUpdateRef.current = onUpdate
    onDeleteRef.current = onDelete
  })

  useEffect(() => {
    const channel = supabase
      .channel(`events-realtime-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') onInsertRef.current?.()
          if (payload.eventType === 'UPDATE') onUpdateRef.current?.()
          if (payload.eventType === 'DELETE') onDeleteRef.current?.()
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          show('실시간 연결에 문제가 생겼어요.', 'error')
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, []) // 마운트 시 1회만 구독
}
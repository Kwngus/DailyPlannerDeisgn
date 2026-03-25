import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type Options = {
  onInsert?: () => void
  onUpdate?: () => void
  onDelete?: () => void
}

export function useRealtimeTodos({ onInsert, onUpdate, onDelete }: Options) {
  const supabase = createClient()

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
      .channel(`todos-realtime-${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') onInsertRef.current?.()
          if (payload.eventType === 'UPDATE') onUpdateRef.current?.()
          if (payload.eventType === 'DELETE') onDeleteRef.current?.()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])
}

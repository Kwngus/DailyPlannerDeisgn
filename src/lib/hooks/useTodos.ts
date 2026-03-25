import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useToastStore } from '@/store/toastStore'
import type { Todo, Priority } from '@/types'

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { show } = useToastStore()

  const fetchTodos = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('todos')
      .select('*, category:categories(*)')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })

    if (data) setTodos(data as Todo[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  async function addTodo(payload: {
    title: string; memo: string
    due_date: string | null; priority: Priority; category_id: string | null
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('todos').insert({ ...payload, user_id: user.id })
    if (error) { show('저장에 실패했어요.', 'error'); return }
    show('할 일이 추가됐어요 ✓')
    await fetchTodos()
  }

  async function updateTodo(id: string, payload: Partial<{
    title: string; memo: string; due_date: string | null
    priority: Priority; category_id: string | null; is_done: boolean
  }>) {
    const { error } = await supabase.from('todos').update(payload).eq('id', id)
    if (error) { show('수정에 실패했어요.', 'error'); return }
    if ('is_done' in payload) {
      show(payload.is_done ? '완료했어요 ✓' : '다시 진행 중으로 변경됐어요', 'info')
    } else {
      show('수정됐어요 ✓')
    }
    await fetchTodos()
  }

  async function deleteTodo(id: string) {
    const target = todos.find(t => t.id === id)
    if (!target) return

    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) { show('삭제에 실패했어요.', 'error'); return }

    await fetchTodos()

    show('할 일이 삭제됐어요', 'info', async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('todos').insert({
        user_id: user.id,
        title: target.title,
        memo: target.memo,
        due_date: target.due_date,
        priority: target.priority,
        category_id: target.category_id,
        is_done: false,
      })
      await fetchTodos()
    })
  }

  async function toggleDone(id: string, current: boolean) {
    await updateTodo(id, { is_done: !current })
  }

  return { todos, loading, addTodo, updateTodo, deleteTodo, toggleDone }
}

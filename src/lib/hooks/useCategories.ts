import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import type { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })
      if (data) setCategories(data)
      setLoading(false)
    }
    fetch()
  }, [])

  async function addCategory(name: string, color: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('categories')
      .insert({ name, color, user_id: user.id })
      .select()
      .single()
    if (data) setCategories(prev => [...prev, data])
  }

  async function updateCategory(id: string, name: string, color: string) {
    const { data } = await supabase
      .from('categories')
      .update({ name, color })
      .eq('id', id)
      .select()
      .single()
    if (data) setCategories(prev => prev.map(c => c.id === id ? data : c))
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return { categories, loading, addCategory, updateCategory, deleteCategory }
}
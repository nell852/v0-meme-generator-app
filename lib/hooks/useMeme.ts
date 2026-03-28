'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Meme } from '@/lib/types/database'

export function useMeme() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const getMeme = useCallback(async (memeId: string) => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('memes')
        .select(`
          *,
          user:user_id (id, username, avatar_url),
          likes:likes(count),
          comments:comments(count)
        `)
        .eq('id', memeId)
        .single()

      if (err) throw err
      return data as Meme
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const incrementViews = useCallback(async (memeId: string) => {
    try {
      const supabase = createClient()
      await supabase.rpc('increment_views', { meme_id: memeId })
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }, [])

  return { getMeme, incrementViews, loading, error }
}

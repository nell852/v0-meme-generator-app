'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as AuthUser } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) throw error
        setUser(user)
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return { user, loading, error }
}

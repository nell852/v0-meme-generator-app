'use client'

import { useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use server-side /api/auth/me which reads the httpOnly cookie
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then(({ user }) => {
        setUser(user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })
  }, [])

  return { user, loading }
}

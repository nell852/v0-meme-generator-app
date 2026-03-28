'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { User as ProfileUser, Meme } from '@/lib/types/database'
import Image from 'next/image'
import { Heart, MessageCircle } from 'lucide-react'

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`)
        const { profile: profileData, memes: memesData } = await response.json()

        setProfile(profileData)
        setMemes(memesData || [])
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">User not found</p>
      </div>
    )
  }

  const likeCount = memes.reduce((sum, m) => sum + (m.likes_count || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="rounded-lg border border-border bg-card p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {profile.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-2">
                {profile.username}
              </h1>
              <p className="text-muted-foreground mb-4">
                {profile.bio || 'No bio yet'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{memes.length}</p>
              <p className="text-sm text-muted-foreground">Memes Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{likeCount}</p>
              <p className="text-sm text-muted-foreground">Likes Received</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent">
                {new Date(profile.created_at).getFullYear()}
              </p>
              <p className="text-sm text-muted-foreground">Member Since</p>
            </div>
          </div>
        </div>

        {/* Memes Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">{profile.username}&apos;s Memes</h2>
          {memes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memes.map((meme) => (
                <div
                  key={meme.id}
                  className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-64 w-full bg-muted">
                    <Image
                      src={meme.image_url}
                      alt={meme.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate mb-2">
                      {meme.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {meme.likes_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {meme.comments_count || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                {profile.username} hasn&apos;t created any memes yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

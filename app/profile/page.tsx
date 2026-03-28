'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { User as ProfileUser, Meme } from '@/lib/types/database'
import Image from 'next/image'
import { Trash2, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [memes, setMemes] = useState<Meme[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading || !user) return

    const fetchProfile = async () => {
      try {
        const supabase = createClient()

        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setBio(profileData.bio || '')
        }

        const { data: memesData } = await supabase
          .from('memes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        setMemes(memesData || [])
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setPageLoading(false)
      }
    }

    fetchProfile()
  }, [user, loading])

  const handleSaveBio = async () => {
    if (!user) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', user.id)
      if (error) throw error
      setProfile(profile ? { ...profile, bio } : null)
      setIsEditing(false)
      toast.success('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleDeleteMeme = async (memeId: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) return
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('memes')
        .delete()
        .eq('id', memeId)
        .eq('user_id', user?.id)
      if (error) throw error
      setMemes(memes.filter((m) => m.id !== memeId))
      toast.success('Meme deleted!')
    } catch (error) {
      console.error('Error deleting meme:', error)
      toast.error('Failed to delete meme')
    }
  }

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    )
  }

  const likeCount = memes.reduce((sum, m) => sum + (m.likes_count || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Add a bio..."
                    className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveBio} size="sm">Save</Button>
                    <Button
                      onClick={() => { setIsEditing(false); setBio(profile.bio || '') }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">{profile.bio || 'No bio yet'}</p>
                  <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </>
              )}
            </div>
          </div>

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

        <div>
          <h2 className="text-2xl font-bold mb-6">My Memes</h2>
          {memes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memes.map((meme) => (
                <div key={meme.id} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="relative h-64 w-full bg-muted">
                    <Image src={meme.image_url} alt={meme.title} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate mb-2">{meme.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{meme.views} views</p>
                    <Button
                      onClick={() => handleDeleteMeme(meme.id)}
                      size="sm"
                      variant="destructive"
                      className="w-full gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                You haven&apos;t created any memes yet.
              </p>
              <Button onClick={() => router.push('/editor')}>
                Create Your First Meme
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

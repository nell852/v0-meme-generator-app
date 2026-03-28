'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MemeGrid } from '@/components/Gallery/MemeGrid'
import { MemeDetail } from '@/components/Gallery/MemeDetail'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Meme } from '@/lib/types/database'
import Link from 'next/link'
import { ImagePlus } from 'lucide-react'

export default function GalleryPage() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'recent' | 'popular'>('recent')

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const supabase = createClient()
        let query = supabase
          .from('memes')
          .select(
            `
            *,
            user:user_id (id, username, avatar_url),
            likes:likes(count),
            comments:comments(count)
          `
          )
          .eq('is_published', true)

        if (filter === 'popular') {
          query = query.order('views', { ascending: false })
        } else {
          query = query.order('created_at', { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        // Transform data to include counts
        const transformedMemes = (data || []).map((meme: any) => ({
          ...meme,
          likes_count: meme.likes?.[0]?.count || 0,
          comments_count: meme.comments?.[0]?.count || 0,
        }))

        setMemes(transformedMemes)
      } catch (error) {
        console.error('Error fetching memes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMemes()
  }, [filter])

  const filteredMemes = memes.filter(
    (meme) =>
      meme.title.toLowerCase().includes(search.toLowerCase()) ||
      meme.user?.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-primary">Meme Gallery</h1>

        {/* Filters */}
        <div className="mb-8 space-y-4 sm:flex sm:gap-4">
          <Input
            placeholder="Search memes or creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
            >
              Recent
            </Button>
            <Button
              variant={filter === 'popular' ? 'default' : 'outline'}
              onClick={() => setFilter('popular')}
            >
              Popular
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : filteredMemes.length > 0 ? (
          <MemeGrid memes={filteredMemes} onSelectMeme={setSelectedMeme} />
        ) : (
          <div className="text-center py-20">
            {search ? (
              <p className="text-lg text-muted-foreground">No memes found matching your search.</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ImagePlus className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-xl font-semibold">No memes yet</p>
                <p className="text-muted-foreground mb-2">Be the first to create one!</p>
                <Link href="/editor">
                  <Button size="lg" className="gap-2">
                    <ImagePlus className="h-5 w-5" />
                    Create Your First Meme
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedMeme && (
        <MemeDetail meme={selectedMeme} onClose={() => setSelectedMeme(null)} />
      )}
    </div>
  )
}

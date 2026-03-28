'use client'

import type { Meme } from '@/lib/types/database'
import { Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface MemeCardProps {
  meme: Meme
  onClick: () => void
}

export function MemeCard({ meme, onClick }: MemeCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-64 w-full bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meme.image_url}
          alt={meme.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{meme.title}</h3>

        <Link
          href={`/profile/${meme.user?.id}`}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          by {meme.user?.username || 'Anonymous'}
        </Link>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
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
  )
}

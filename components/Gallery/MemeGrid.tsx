'use client'

import type { Meme } from '@/lib/types/database'
import { MemeCard } from './MemeCard'

interface MemeGridProps {
  memes: Meme[]
  onSelectMeme: (meme: Meme) => void
}

export function MemeGrid({ memes, onSelectMeme }: MemeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {memes.map((meme) => (
        <MemeCard
          key={meme.id}
          meme={meme}
          onClick={() => onSelectMeme(meme)}
        />
      ))}
    </div>
  )
}

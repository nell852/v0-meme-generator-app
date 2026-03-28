'use client'

import { useState, useEffect } from 'react'
import type { Meme, Comment } from '@/lib/types/database'
import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'
import { Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'

interface MemeDetailProps {
  meme: Meme
  onClose: () => void
}

export function MemeDetail({ meme, onClose }: MemeDetailProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(meme.likes_count || 0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [commentsRes, likeRes] = await Promise.all([
          fetch(`/api/comments?meme_id=${meme.id}`),
          user ? fetch(`/api/likes?meme_id=${meme.id}`) : Promise.resolve(null),
        ])

        const { comments: commentsData } = await commentsRes.json()
        setComments(commentsData || [])

        if (likeRes) {
          const { liked: isLiked } = await likeRes.json()
          setLiked(!!isLiked)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [meme.id, user])

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like memes')
      return
    }

    setLikeLoading(true)
    try {
      if (liked) {
        const res = await fetch(`/api/likes?meme_id=${meme.id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Failed to unlike')
        setLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      } else {
        const res = await fetch('/api/likes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meme_id: meme.id }),
        })
        if (!res.ok) throw new Error('Failed to like')
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment')
      return
    }

    if (!commentText.trim()) return

    setCommentLoading(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meme_id: meme.id, text: commentText }),
      })

      if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error || 'Failed to add comment')
      }

      const { comment: newComment } = await res.json()
      if (newComment) {
        setComments((prev) => [newComment, ...prev])
        setCommentText('')
        toast.success('Comment added!')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{meme.title}</DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative h-96 w-full bg-muted rounded-lg overflow-hidden">
          <Image
            src={meme.image_url}
            alt={meme.title}
            fill
            className="object-contain"
          />
        </div>

        {/* Author info */}
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Created by{' '}
            <Link
              href={`/profile/${meme.user?.id}`}
              className="text-primary hover:underline"
            >
              {meme.user?.username || 'Anonymous'}
            </Link>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(meme.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 border-t border-border pt-4">
          <Button
            variant={liked ? 'default' : 'outline'}
            onClick={handleLike}
            disabled={likeLoading}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
          <Button variant="outline" disabled className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {comments.length}
          </Button>
        </div>

        {/* Comment input — only for logged-in users */}
        {user && (
          <div className="border-t border-border pt-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !commentLoading && handleAddComment()}
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim() || commentLoading}
              >
                {commentLoading ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 border-t border-border pt-4 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <p className="font-semibold text-primary">
                  {comment.user?.username || 'Anonymous'}
                </p>
                <p className="text-muted-foreground">{comment.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

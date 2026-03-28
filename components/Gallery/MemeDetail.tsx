'use client'

import { useState, useEffect } from 'react'
import type { Meme, Comment } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import Image from 'next/image'
import { Heart, MessageCircle, X } from 'lucide-react'
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Check if user liked this meme
        if (user) {
          const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('meme_id', meme.id)
            .eq('user_id', user.id)
            .single()
          setLiked(!!data)
        }

        // Fetch comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select(
            `
            *,
            user:user_id (id, username, avatar_url)
          `
          )
          .eq('meme_id', meme.id)
          .order('created_at', { ascending: false })

        setComments(commentsData || [])
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

    try {
      const supabase = createClient()

      if (liked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('meme_id', meme.id)
          .eq('user_id', user.id)
        setLiked(false)
        setLikeCount(Math.max(0, likeCount - 1))
      } else {
        // Like
        await supabase.from('likes').insert({
          meme_id: meme.id,
          user_id: user.id,
        })
        setLiked(true)
        setLikeCount(likeCount + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like')
    }
  }

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment')
      return
    }

    if (!commentText.trim()) {
      return
    }

    try {
      const supabase = createClient()
      const { data: newComment } = await supabase
        .from('comments')
        .insert({
          meme_id: meme.id,
          user_id: user.id,
          text: commentText,
        })
        .select(
          `
          *,
          user:user_id (id, username, avatar_url)
        `
        )
        .single()

      if (newComment) {
        setComments([newComment, ...comments])
        setCommentText('')
        toast.success('Comment added!')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
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

        {/* Comments Section */}
        {user && (
          <div className="border-t border-border pt-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && handleAddComment()
                }
              />
              <Button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 border-t border-border pt-4 max-h-64 overflow-y-auto">
          {comments.length > 0 ? (
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

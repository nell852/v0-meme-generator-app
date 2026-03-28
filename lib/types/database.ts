export type User = {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Meme = {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string
  created_at: string
  updated_at: string
  views: number
  is_published: boolean
  user?: User
  likes_count?: number
  comments_count?: number
  liked_by_user?: boolean
}

export type Like = {
  id: string
  user_id: string
  meme_id: string
  created_at: string
}

export type Comment = {
  id: string
  user_id: string
  meme_id: string
  text: string
  created_at: string
  updated_at: string
  user?: User
}

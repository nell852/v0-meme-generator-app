import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const meme_id = searchParams.get('meme_id')

  if (!meme_id) {
    return NextResponse.json({ error: 'meme_id is required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .select('*, user:user_id (id, username, avatar_url)')
    .eq('meme_id', meme_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comments: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { meme_id, text } = await request.json()

  if (!meme_id || !text?.trim()) {
    return NextResponse.json({ error: 'meme_id and text are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ meme_id, user_id: user.id, text: text.trim() })
    .select('*, user:user_id (id, username, avatar_url)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ comment: data })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const comment_id = searchParams.get('comment_id')

  if (!comment_id) {
    return NextResponse.json({ error: 'comment_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', comment_id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

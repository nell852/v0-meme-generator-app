import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const meme_id = searchParams.get('meme_id')

  if (!meme_id) {
    return NextResponse.json({ error: 'meme_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ liked: false })
  }

  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('meme_id', meme_id)
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ liked: !!data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { meme_id } = await request.json()

  if (!meme_id) {
    return NextResponse.json({ error: 'meme_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('likes')
    .insert({ meme_id, user_id: user.id })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already liked' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const meme_id = searchParams.get('meme_id')

  if (!meme_id) {
    return NextResponse.json({ error: 'meme_id is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('meme_id', meme_id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

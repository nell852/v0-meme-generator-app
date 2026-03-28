import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, image_url } = body

    if (!title || !image_url) {
      return NextResponse.json({ error: 'title and image_url are required' }, { status: 400 })
    }

    // Ensure user profile exists before inserting meme (FK constraint)
    await supabase
      .from('users')
      .upsert(
        { id: user.id, username: user.email?.split('@')[0] || user.id },
        { onConflict: 'id', ignoreDuplicates: true }
      )

    const { data, error } = await supabase.from('memes').insert([
      {
        title,
        image_url,
        is_published: true,
        user_id: user.id,
      },
    ]).select().single()

    if (error) {
      console.error('Meme insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ meme: data })
  } catch (error) {
    console.error('Memes API error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
